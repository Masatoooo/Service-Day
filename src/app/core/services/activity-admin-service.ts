import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { format } from 'date-fns';
import { Observable, combineLatest, map, of, shareReplay, switchMap, throwError } from 'rxjs';
import { Activity, ActivityStatus, ActivityView, Ngo, PublicUser, Registration } from '../models';
import { RuleViolationError, canDeleteActivity, canDeleteNgo, canUnpublish, formatCutoff, isLateArrival } from '../rules';
import { ActivityService, NewActivity } from './activity-service';
import { ApiUrlService } from './api-url-service';
import { NgoService } from './ngo-service';
import { NotificationService } from './notification-service';
import { UserService } from './user-service';
import { runToCompletion } from './run-to-completion';

export interface ParticipantRow {
  registrationId: string;
  name: string;
  department: string;
  registeredAt: string;
  checkedInAt: string | null;
  late: boolean;
}

export interface NgoRow {
  ngo: Ngo;
  activityCount: number;
}

/** Fields whose change is worth telling participants about, with how to describe them. */
const NOTIFY_FIELDS: { key: keyof NewActivity; describe: (a: NewActivity) => string }[] = [
  { key: 'title', describe: (a) => `the name is now "${a.title}"` },
  { key: 'date', describe: (a) => `the date is now ${format(new Date(`${a.date}T00:00:00`), 'EEE d MMM')}` },
  { key: 'startTime', describe: (a) => `it now runs ${a.startTime}–${a.endTime}` },
  { key: 'endTime', describe: (a) => `it now runs ${a.startTime}–${a.endTime}` },
  { key: 'location', describe: (a) => `the meeting point is now ${a.location}` },
  { key: 'cutoffAt', describe: (a) => `changes now close ${formatCutoff(a.cutoffAt)}` },
  { key: 'description', describe: () => 'the description was updated' },
];

/**
 * Admin orchestration for activities and NGOs (UC1): save with participant
 * notices, publish / unpublish / cancel / delete guarded by the rules,
 * live participants, NGO rows with activity counts.
 */
@Injectable({ providedIn: 'root' })
export class ActivityAdminService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiUrlService);
  private readonly activities = inject(ActivityService);
  private readonly ngos = inject(NgoService);
  private readonly notifications = inject(NotificationService);
  private readonly users = inject(UserService);

  /** Current registrations on one activity (for the async maxSlots validator). */
  takenCount(activityId: string): Observable<number> {
    return this.http
      .get<Registration[]>(this.api.url('registrations'), { params: { activityId, status: 'registered' } })
      .pipe(map((rows) => rows.length));
  }

  /**
   * Create or update. When a published activity with participants changes in a
   * way that matters to them, they get one "activity-update" notice listing what changed.
   */
  save(input: NewActivity, existing: ActivityView | null, adminId: string): Observable<Activity> {
    if (!existing) {
      return this.activities.create(input);
    }
    const changes = [...new Set(NOTIFY_FIELDS.filter((f) => input[f.key] !== existing[f.key]).map((f) => f.describe(input)))];
    return runToCompletion(this.activities.update(existing.id, input).pipe(
      switchMap((saved) => {
        if (existing.status !== 'published' || existing.taken === 0 || changes.length === 0) {
          return of(saved);
        }
        return this.notifications
          .broadcast({
            type: 'activity-update',
            audience: 'activity',
            activityId: saved.id,
            title: `${saved.title}: details changed`,
            message: `${existing.ngo.name} updated ${saved.title}: ${changes.join('; ')}. Please check the details before Service Day.`,
            urgent: false,
            sentBy: adminId,
          })
          .pipe(map(() => saved));
      }),
    ));
  }

  setStatus(view: ActivityView, status: Exclude<ActivityStatus, 'cancelled'>): Observable<Activity> {
    if (status === 'draft') {
      const result = canUnpublish(view.taken);
      if (!result.ok) return throwError(() => new RuleViolationError(result.code, result.reason));
    }
    return this.activities.update(view.id, { status });
  }

  /** Cancel and tell everyone registered (their places stop counting as active). */
  cancel(view: ActivityView, adminId: string): Observable<number> {
    return runToCompletion(this.activities.update(view.id, { status: 'cancelled' }).pipe(
      switchMap(() =>
        this.notifications.broadcast({
          type: 'activity-update',
          audience: 'activity',
          activityId: view.id,
          title: `${view.title} is cancelled`,
          message: `${view.ngo.name} — ${view.title} won't go ahead. Your place has been released, so you can register for another activity while cut-offs are open.`,
          urgent: true,
          sentBy: adminId,
        }),
      ),
      map((result) => result.recipientCount),
    ));
  }

  remove(view: ActivityView): Observable<void> {
    const result = canDeleteActivity(view.taken, view.status);
    if (!result.ok) return throwError(() => new RuleViolationError(result.code, result.reason));
    return this.activities.delete(view.id);
  }

  /** Live participant list for the admin detail page (refreshes with every poll). */
  participants$(activityId: string): Observable<ParticipantRow[]> {
    const employees$ = this.users.employees().pipe(shareReplay(1));
    return combineLatest([this.activities.snapshot$, employees$]).pipe(
      map(([snapshot, employees]) => {
        const activity = snapshot.activities.find((a) => a.id === activityId);
        const byId = new Map<string, PublicUser>(employees.map((e) => [e.id, e]));
        return snapshot.registrations
          .filter((r) => r.activityId === activityId)
          .map((r) => ({
            registrationId: r.id,
            name: byId.get(r.userId)?.name ?? 'Unknown employee',
            department: byId.get(r.userId)?.department ?? '',
            registeredAt: r.registeredAt,
            checkedInAt: r.checkedInAt,
            late: !!(activity && r.checkedInAt && isLateArrival(activity, new Date(r.checkedInAt))),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
      }),
    );
  }

  /** NGOs with how many activities each has (any status), live. */
  ngoRows$(): Observable<NgoRow[]> {
    return this.activities.snapshot$.pipe(
      map((snapshot) =>
        [...snapshot.ngos]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((ngo) => ({ ngo, activityCount: snapshot.activities.filter((a) => a.ngoId === ngo.id).length })),
      ),
    );
  }

  deleteNgo(row: NgoRow): Observable<void> {
    const result = canDeleteNgo(row.activityCount);
    if (!result.ok) return throwError(() => new RuleViolationError(result.code, result.reason));
    return this.ngos.delete(row.ngo.id);
  }
}
