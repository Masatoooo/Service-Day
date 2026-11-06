import { Injectable, inject } from '@angular/core';
import { differenceInCalendarDays, format, isSameDay } from 'date-fns';
import { Observable, catchError, combineLatest, filter, map, of, startWith, switchMap } from 'rxjs';
import { ActivityView, AppNotification, Availability, Registration, RegistrationStatus } from '../models';
import { RuleResult, canWithdraw } from '../rules';
import { ActivityService } from './activity-service';
import { NotificationService } from './notification-service';
import { RegistrationService } from './registration-service';

/** Availabilities an employee can still sign up for. */
export const BOOKABLE: readonly Availability[] = ['open', 'last-slots', 'closing-soon'];

export interface MyPlace {
  view: ActivityView;
  /** Switch and withdraw share the same rule: allowed until this activity's cut-off. */
  changes: RuleResult;
  checkInToday: boolean;
  /** The activity's day, split for the date tile: "Friday", "20", "November". */
  day: { weekday: string; date: string; month: string };
}

export interface EmployeeHomeView {
  now: Date;
  place: MyPlace | null;
  openCount: number;
  slotsAvailable: number;
  /** 'YYYY-MM-DD' shared by most published activities. */
  serviceDay: string | null;
  daysUntil: number | null;
  closingSoon: ActivityView[];
  /** null while the inbox is still loading. */
  notifications: AppNotification[] | null;
}

/** One line in the My registrations history. */
export interface HistoryRow {
  id: string;
  status: RegistrationStatus;
  activity: ActivityView | null;
  title: string;
  label: string;
  tone: 'success' | 'neutral' | 'danger-outline';
  /** e.g. "Switched away 31 Oct, 14:10" */
  when: string;
}

export interface MyRegistrationsView {
  now: Date;
  place: MyPlace | null;
  /** Newest change first. */
  rows: HistoryRow[];
}

/**
 * Everything the employee Home page shows, prepared from the live activity
 * stream (10 s) and the live inbox (15 s). The component only renders it.
 */
@Injectable({ providedIn: 'root' })
export class EmployeeHomeService {
  private readonly activities = inject(ActivityService);
  private readonly registrations = inject(RegistrationService);
  private readonly notifications = inject(NotificationService);

  home$(userId: string): Observable<EmployeeHomeView> {
    const inbox$ = this.notifications.inboxLive$(userId).pipe(
      map((items) => items.slice(0, 3)),
      catchError(() => of([])),
      startWith(null),
    );
    return combineLatest([this.activities.snapshot$, inbox$]).pipe(
      map(([snapshot, notifications]) => {
        const now = snapshot.now;
        const views = this.activities.toViews(snapshot, userId).filter((v) => v.status === 'published');
        const bookable = views.filter((v) => BOOKABLE.includes(v.availability));
        const placeView = this.registrations.placeIn(views, snapshot, userId);
        const serviceDay = this.mostCommonDate(views);
        const daysUntil = serviceDay ? differenceInCalendarDays(new Date(`${serviceDay}T00:00:00`), now) : null;
        return {
          now,
          place: placeView ? this.toPlace(placeView, now) : null,
          openCount: bookable.length,
          slotsAvailable: bookable.reduce((sum, v) => sum + v.remaining, 0),
          serviceDay,
          daysUntil: daysUntil !== null && daysUntil >= 0 ? daysUntil : null,
          closingSoon: bookable
            .filter((v) => !v.isRegisteredByMe)
            .sort((a, b) => Date.parse(a.cutoffAt) - Date.parse(b.cutoffAt))
            .slice(0, 3),
          notifications,
        };
      }),
    );
  }

  /**
   * My registrations: current place + full history (registered / switched / withdrawn).
   * Re-reads the employee's registrations whenever the live activity snapshot updates,
   * so the page changes right after an action without a reload.
   */
  registrations$(userId: string): Observable<MyRegistrationsView> {
    return this.activities.snapshot$.pipe(
      switchMap((snapshot) =>
        this.registrations.forUser(userId).pipe(
          map((rows) => {
            const views = this.activities.toViews(snapshot, userId);
            const byId = new Map(views.map((v) => [v.id, v]));
            const placeView = this.registrations.placeIn(views, snapshot, userId);
            return {
              now: snapshot.now,
              place: placeView ? this.toPlace(placeView, snapshot.now) : null,
              rows: rows.map((r) => this.toHistoryRow(r, byId.get(r.activityId) ?? null)),
            };
          }),
          catchError(() => of(null)),
        ),
      ),
      filter((view): view is MyRegistrationsView => view !== null),
    );
  }

  private toPlace(view: ActivityView, now: Date): MyPlace {
    return {
      view,
      changes: canWithdraw(view, now),
      checkInToday: isSameDay(now, new Date(`${view.date}T00:00:00`)),
      day: this.dayParts(view.date),
    };
  }

  private toHistoryRow(registration: Registration, activity: ActivityView | null): HistoryRow {
    const at = (iso: string) => format(new Date(iso), 'd MMM, HH:mm');
    const base = { id: registration.id, status: registration.status, activity, title: activity?.title ?? 'Removed activity' };
    if (registration.status === 'switched') {
      return { ...base, label: 'Switched', tone: 'neutral', when: `Switched away ${at(registration.updatedAt)}` };
    }
    if (registration.status === 'withdrawn') {
      return { ...base, label: 'Withdrawn', tone: 'neutral', when: `Withdrawn ${at(registration.updatedAt)}` };
    }
    if (activity?.status === 'cancelled') {
      return { ...base, label: 'Activity cancelled', tone: 'danger-outline', when: `Registered ${at(registration.registeredAt)}` };
    }
    return { ...base, label: 'Current', tone: 'success', when: `Registered ${at(registration.registeredAt)}` };
  }

  private dayParts(date: string): MyPlace['day'] {
    const day = new Date(`${date}T00:00:00`);
    return { weekday: format(day, 'EEEE'), date: format(day, 'd'), month: format(day, 'MMMM') };
  }

  private mostCommonDate(views: ActivityView[]): string | null {
    const perDate = new Map<string, number>();
    views.forEach((v) => perDate.set(v.date, (perDate.get(v.date) ?? 0) + 1));
    return [...perDate.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }
}
