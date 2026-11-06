import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, finalize, map, switchMap, throwError } from 'rxjs';
import { Activity, Ngo, Registration } from '../models';
import { RuleResult, RuleViolationError, canRegister, canSwitch, canWithdraw } from '../rules';
import { ActivitySnapshot, ActivityService } from './activity-service';
import { ApiUrlService } from './api-url-service';
import { ClockService } from './clock-service';
import { NotificationService } from './notification-service';

const OVERBOOKED = 'Someone just took the last slot. The list has been refreshed.';

/** Fresh data loaded immediately before a write, plus the employee's current place. */
interface GuardContext {
  snapshot: ActivitySnapshot;
  current: Registration | null;
  currentActivity: Activity | null;
}

/** Turns a blocked rule into an Observable error the component can show. */
function violation(result: Extract<RuleResult, { ok: false }>): Observable<never> {
  const message = result.code === 'full' ? OVERBOOKED : result.reason;
  return throwError(() => new RuleViolationError(result.code, message));
}

/**
 * Register / switch / withdraw (UC3).
 * Overbooking guard (PLAN §5 rule 5): every action re-fetches activities and
 * registrations right before writing and re-runs the rule; only then it writes.
 * After every action (success or failure) live views refresh without a reload.
 */
@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiUrlService);
  private readonly clock = inject(ClockService);
  private readonly activities = inject(ActivityService);
  private readonly notifications = inject(NotificationService);

  /** Current and past registrations of one employee, newest first. */
  forUser(userId: string): Observable<Registration[]> {
    return this.http
      .get<Registration[]>(this.api.url('registrations'), { params: { userId } })
      .pipe(map((rows) => [...rows].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))));
  }

  /** The employee's one active place this season, or null. */
  active(userId: string): Observable<Registration | null> {
    return this.activities.snapshotOnce().pipe(map((s) => s.activeRegistrations.find((r) => r.userId === userId) ?? null));
  }

  /** People currently registered on an activity. */
  forActivity(activityId: string): Observable<Registration[]> {
    return this.http.get<Registration[]>(this.api.url('registrations'), { params: { activityId, status: 'registered' } });
  }

  register(userId: string, activityId: string): Observable<Registration> {
    return this.guard(userId).pipe(
      switchMap((ctx) => {
        const target = this.find(ctx, activityId);
        const result = canRegister(target, this.taken(ctx, activityId), ctx.snapshot.now, ctx.current !== null);
        if (!result.ok) return violation(result);
        return this.create(userId, activityId).pipe(
          switchMap((created) => this.notifications.notifyRegistered(userId, target, this.ngoOf(ctx, target)).pipe(map(() => created))),
        );
      }),
      finalize(() => this.activities.refresh()),
    );
  }

  switch(userId: string, targetActivityId: string): Observable<Registration> {
    return this.guard(userId).pipe(
      switchMap((ctx) => {
        if (!ctx.current || !ctx.currentActivity) return this.noCurrentPlace('switch');
        const from = ctx.currentActivity;
        const target = this.find(ctx, targetActivityId);
        const result = canSwitch(from, target, this.taken(ctx, targetActivityId), ctx.snapshot.now);
        if (!result.ok) return violation(result);
        return this.setStatus(ctx.current, 'switched').pipe(
          switchMap(() => this.create(userId, targetActivityId)),
          switchMap((created) => this.notifications.notifySwitched(userId, from, target, this.ngoOf(ctx, target)).pipe(map(() => created))),
        );
      }),
      finalize(() => this.activities.refresh()),
    );
  }

  withdraw(userId: string): Observable<Registration> {
    return this.guard(userId).pipe(
      switchMap((ctx) => {
        if (!ctx.current || !ctx.currentActivity) return this.noCurrentPlace('withdraw from');
        const activity = ctx.currentActivity;
        const result = canWithdraw(activity, ctx.snapshot.now);
        if (!result.ok) return violation(result);
        return this.setStatus(ctx.current, 'withdrawn').pipe(
          switchMap((updated) => this.notifications.notifyWithdrawn(userId, activity, this.ngoOf(ctx, activity)).pipe(map(() => updated))),
        );
      }),
      finalize(() => this.activities.refresh()),
    );
  }

  /** Re-fetch everything the rules need, right now (not the cached live stream). */
  private guard(userId: string): Observable<GuardContext> {
    return this.activities.snapshotOnce().pipe(
      map((snapshot) => {
        const current = snapshot.activeRegistrations.find((r) => r.userId === userId) ?? null;
        const currentActivity = current ? snapshot.activities.find((a) => a.id === current.activityId) ?? null : null;
        return { snapshot, current, currentActivity };
      }),
    );
  }

  private find(ctx: GuardContext, activityId: string): Activity {
    const activity = ctx.snapshot.activities.find((a) => a.id === activityId);
    if (!activity) {
      throw new RuleViolationError('not-published', 'This activity no longer exists.');
    }
    return activity;
  }

  private taken(ctx: GuardContext, activityId: string): number {
    return ctx.snapshot.registrations.filter((r) => r.activityId === activityId).length;
  }

  private ngoOf(ctx: GuardContext, activity: Activity): Ngo {
    const ngo = ctx.snapshot.ngos.find((n) => n.id === activity.ngoId);
    return ngo ?? { id: activity.ngoId, name: 'the NGO', focusArea: '', description: '', contactName: '', contactEmail: '', verified: false };
  }

  private create(userId: string, activityId: string): Observable<Registration> {
    const now = this.clock.nowIso();
    const body: Omit<Registration, 'id'> = { userId, activityId, status: 'registered', registeredAt: now, updatedAt: now, checkedInAt: null };
    return this.http.post<Registration>(this.api.url('registrations'), body);
  }

  private setStatus(registration: Registration, status: 'switched' | 'withdrawn'): Observable<Registration> {
    return this.http.patch<Registration>(this.api.url('registrations', registration.id), { status, updatedAt: this.clock.nowIso() });
  }

  private noCurrentPlace(action: string): Observable<never> {
    return throwError(
      () => new RuleViolationError('no-current-registration', `You don't have a place to ${action} yet. Register for an activity first.`),
    );
  }
}
