import { Injectable, inject } from '@angular/core';
import { differenceInCalendarDays, format, isSameDay } from 'date-fns';
import { Observable, catchError, combineLatest, map, of, startWith } from 'rxjs';
import { ActivityView, AppNotification, Availability } from '../models';
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
          place: placeView
            ? {
                view: placeView,
                changes: canWithdraw(placeView, now),
                checkInToday: isSameDay(now, new Date(`${placeView.date}T00:00:00`)),
                day: this.dayParts(placeView.date),
              }
            : null,
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
