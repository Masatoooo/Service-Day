import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { format } from 'date-fns';
import { BehaviorSubject, EMPTY, Observable, Subject, catchError, combineLatest, forkJoin, map, of, shareReplay, startWith, switchMap, tap, timer } from 'rxjs';
import { Activity, AppNotification, Audience, Ngo, NotificationType, Registration, User } from '../models';
import { activityStart } from '../rules';
import { ActivityService } from './activity-service';
import { ApiUrlService } from './api-url-service';
import { ClockService } from './clock-service';
import { UserService } from './user-service';

/** The bell re-polls the inbox this often (PLAN §6.4). */
const INBOX_POLL_MS = 15_000;

export interface NewNotification {
  type: NotificationType;
  audience: Audience;
  title: string;
  message: string;
  recipientId?: string | null;
  activityId?: string | null;
  ngoId?: string | null;
  urgent?: boolean;
  sentBy?: 'system' | string;
  broadcastId?: string | null;
}

export interface BroadcastInput {
  audience: Exclude<Audience, 'user'>;
  title: string;
  message: string;
  urgent: boolean;
  sentBy: string;
  type?: NotificationType;
  activityId?: string | null;
  ngoId?: string | null;
  /** Send personal copies to exactly these people (e.g. staff picked on the Participation page). */
  recipientIds?: string[];
}

/** Who a broadcast reaches, before it is sent (for the composer's confirm step). */
export type AudienceTarget = Pick<BroadcastInput, 'audience' | 'activityId' | 'ngoId' | 'recipientIds'>;

/** One original notice in the admin History, with how many people it reached and who sent it. */
export interface HistoryRow {
  notice: AppNotification;
  recipientCount: number;
  sender: string;
}

/** A notice in someone's inbox and whether they have read it. */
export interface InboxItem {
  notice: AppNotification;
  unread: boolean;
}

export interface InboxView {
  items: InboxItem[];
  unread: number;
  now: Date;
}

export interface BroadcastResult {
  original: AppNotification;
  recipientCount: number;
}

/** "Riverbank Food Collective — Pack & Deliver, Sat 21 Nov, 08:30" */
function describe(activity: Activity, ngo: Ngo): string {
  return `${ngo.name} — ${activity.title}, ${format(activityStart(activity), 'EEE d MMM')}, ${activity.startTime}`;
}

/**
 * Notices (UC5): system notices after each action, admin broadcasts (expanded
 * per recipient with a broadcastId), the employee inbox, unread counts.
 * In Assignment 1 the client creates these to simulate the server.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiUrlService);
  private readonly clock = inject(ClockService);
  private readonly users = inject(UserService);
  private readonly activities = inject(ActivityService);
  private readonly refresh$ = new Subject<void>();
  /** One shared live inbox per user, so the bell and the inbox page don't poll twice. */
  private readonly inboxViews = new Map<string, Observable<InboxView>>();
  private readonly loadFailedSubject = new BehaviorSubject(false);
  /** True while the latest inbox / history poll failed (pages show an error state; polling continues). */
  readonly loadFailed$ = this.loadFailedSubject.asObservable();

  refresh(): void {
    this.refresh$.next();
  }

  create(input: NewNotification): Observable<AppNotification> {
    const body: Omit<AppNotification, 'id'> = {
      type: input.type,
      audience: input.audience,
      recipientId: input.recipientId ?? null,
      activityId: input.activityId ?? null,
      ngoId: input.ngoId ?? null,
      title: input.title,
      message: input.message,
      urgent: input.urgent ?? false,
      sentBy: input.sentBy ?? 'system',
      broadcastId: input.broadcastId ?? null,
      createdAt: this.clock.nowIso(),
      readBy: [],
    };
    return this.http.post<AppNotification>(this.api.url('notifications'), body).pipe(tap(() => this.refresh()));
  }

  // ---- System notices (PLAN §5 rule 8): specific, human messages ----

  notifyRegistered(userId: string, activity: Activity, ngo: Ngo): Observable<AppNotification> {
    return this.toUser(userId, 'registration', activity, `You're in: ${activity.title}`, `You're in: ${describe(activity, ngo)}.`);
  }

  notifySwitched(userId: string, from: Activity, to: Activity, ngo: Ngo): Observable<AppNotification> {
    const message = `Your place moved from ${from.title} to ${describe(to, ngo)}.`;
    return this.toUser(userId, 'switch', to, `You switched to ${to.title}`, message);
  }

  notifyWithdrawn(userId: string, activity: Activity, ngo: Ngo): Observable<AppNotification> {
    const message = `Your place on ${ngo.name} — ${activity.title} has been released. You can register for another activity before its cut-off.`;
    return this.toUser(userId, 'withdrawal', activity, `You've withdrawn from ${activity.title}`, message);
  }

  // ---- Broadcasts ----

  /**
   * Stores the original once (for admin History), then one audience 'user' copy per
   * recipient with `broadcastId` = original id. All-staff and NGO notices stay single.
   */
  broadcast(input: BroadcastInput): Observable<BroadcastResult> {
    const { recipientIds: _ids, ...notice } = input;
    const original$ = this.create({ ...notice, type: input.type ?? 'broadcast' });
    return forkJoin({ original: original$, recipients: this.recipientsFor(input), reach: this.recipientCount(input) }).pipe(
      switchMap(({ original, recipients, reach }) => {
        // All-staff and NGO notices stay one record, so their reach comes from the audience.
        if (recipients.length === 0) {
          return of({ original, recipientCount: reach });
        }
        const copies = recipients.map((recipientId) =>
          this.create({ ...notice, type: original.type, audience: 'user', recipientId, broadcastId: original.id }),
        );
        return forkJoin(copies).pipe(map(() => ({ original, recipientCount: recipients.length })));
      }),
    );
  }

  /** Admin History: originals only (per-user copies of a broadcast are hidden). */
  history(): Observable<AppNotification[]> {
    return this.http
      .get<AppNotification[]>(this.api.url('notifications'))
      .pipe(map((all) => this.newestFirst(all.filter((n) => n.broadcastId === null))));
  }

  /** History rows (originals only) with recipient counts and sender names, re-polled like the inbox. */
  historyLive$(): Observable<HistoryRow[]> {
    const lookups$ = forkJoin({
      employees: this.users.employees(),
      admins: this.http.get<User[]>(this.api.url('users'), { params: { role: 'admin' } }),
    }).pipe(shareReplay(1));
    const all$ = this.refresh$.pipe(
      startWith(undefined),
      switchMap(() => timer(0, INBOX_POLL_MS)),
      switchMap(() => this.keepPolling(this.http.get<AppNotification[]>(this.api.url('notifications')))),
    );
    return combineLatest([all$, lookups$]).pipe(
      map(([all, { employees, admins }]) => {
        const copies = new Map<string, number>();
        all.filter((n) => n.broadcastId).forEach((n) => copies.set(n.broadcastId!, (copies.get(n.broadcastId!) ?? 0) + 1));
        const names = new Map(admins.map((a) => [a.id, a.name]));
        return this.newestFirst(all.filter((n) => n.broadcastId === null)).map((notice) => ({
          notice,
          recipientCount: this.reach(notice, copies.get(notice.id) ?? 0, employees.length),
          sender: notice.sentBy === 'system' ? 'System' : (names.get(notice.sentBy) ?? 'Admin'),
        }));
      }),
    );
  }

  /** How many people a broadcast would reach right now. */
  recipientCount(target: AudienceTarget): Observable<number> {
    if (target.audience === 'all-staff') return this.users.employees().pipe(map((e) => e.length));
    if (target.audience === 'ngo') return of(target.ngoId ? 1 : 0);
    return this.recipientsFor(target).pipe(map((ids) => ids.length));
  }

  // ---- Inbox ----

  /** A user's inbox = notices addressed to them + all-staff notices, newest first. */
  inbox(userId: string): Observable<AppNotification[]> {
    return forkJoin([
      this.http.get<AppNotification[]>(this.api.url('notifications'), { params: { recipientId: userId } }),
      this.http.get<AppNotification[]>(this.api.url('notifications'), { params: { audience: 'all-staff' } }),
    ]).pipe(map(([mine, everyone]) => this.newestFirst([...mine, ...everyone])));
  }

  /** Inbox that re-polls every 15 s and after every change. */
  inboxLive$(userId: string): Observable<AppNotification[]> {
    return this.refresh$.pipe(
      startWith(undefined),
      switchMap(() => timer(0, INBOX_POLL_MS)),
      switchMap(() => this.keepPolling(this.inbox(userId))),
    );
  }

  /** Live inbox with read state per item (shared by the bell and the inbox page). */
  inboxView$(userId: string): Observable<InboxView> {
    let view$ = this.inboxViews.get(userId);
    if (!view$) {
      view$ = this.inboxLive$(userId).pipe(
        map((notices) => {
          const items = notices.map((notice) => ({ notice, unread: !notice.readBy.includes(userId) }));
          return { items, unread: items.filter((i) => i.unread).length, now: this.clock.now() };
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
      this.inboxViews.set(userId, view$);
    }
    return view$;
  }

  unreadCount$(userId: string): Observable<number> {
    return this.inboxLive$(userId).pipe(map((items) => items.filter((n) => !n.readBy.includes(userId)).length));
  }

  markRead(notification: AppNotification, userId: string): Observable<AppNotification> {
    if (notification.readBy.includes(userId)) {
      return of(notification);
    }
    const readBy = [...notification.readBy, userId];
    return this.http
      .patch<AppNotification>(this.api.url('notifications', notification.id), { readBy })
      .pipe(tap(() => this.refresh()));
  }

  markAllRead(userId: string): Observable<number> {
    return this.inbox(userId).pipe(
      switchMap((items) => {
        const unread = items.filter((n) => !n.readBy.includes(userId));
        return unread.length ? forkJoin(unread.map((n) => this.markRead(n, userId))).pipe(map(() => unread.length)) : of(0);
      }),
    );
  }

  /** A failed poll is skipped (ErrorInterceptor shows the toast) so the next one can retry. */
  private keepPolling<T>(request$: Observable<T>): Observable<T> {
    return request$.pipe(
      tap(() => this.loadFailedSubject.next(false)),
      catchError(() => {
        this.loadFailedSubject.next(true);
        return EMPTY;
      }),
    );
  }

  /** Per-user copies when there are any; otherwise what the audience implies. */
  private reach(notice: AppNotification, copies: number, staff: number): number {
    if (copies > 0) return copies;
    if (notice.audience === 'all-staff') return staff;
    return notice.audience === 'user' || notice.audience === 'ngo' ? 1 : 0;
  }

  private toUser(userId: string, type: NotificationType, activity: Activity, title: string, message: string): Observable<AppNotification> {
    return this.create({ type, audience: 'user', recipientId: userId, activityId: activity.id, title, message });
  }

  /** Who gets a personal copy: unregistered staff, or one activity's participants. */
  private recipientsFor(input: AudienceTarget): Observable<string[]> {
    if (input.recipientIds) {
      return of([...new Set(input.recipientIds)]);
    }
    if (input.audience === 'unregistered') {
      return forkJoin({ employees: this.users.employees(), snapshot: this.activities.snapshotOnce() }).pipe(
        map(({ employees, snapshot }) => {
          const placed = new Set(snapshot.activeRegistrations.map((r) => r.userId));
          return employees.filter((e) => !placed.has(e.id)).map((e) => e.id);
        }),
      );
    }
    if (input.audience === 'activity' && input.activityId) {
      return this.http
        .get<Registration[]>(this.api.url('registrations'), { params: { activityId: input.activityId, status: 'registered' } })
        .pipe(map((registrations) => registrations.map((r) => r.userId)));
    }
    return of([]);
  }

  private newestFirst(items: AppNotification[]): AppNotification[] {
    return [...items].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }
}
