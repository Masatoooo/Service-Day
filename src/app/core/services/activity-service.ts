import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  EMPTY,
  Observable,
  Subject,
  catchError,
  forkJoin,
  map,
  merge,
  shareReplay,
  startWith,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import { Activity, ActivityView, Ngo, Registration, ReminderSettings } from '../models';
import { getAvailability } from '../rules';
import { ApiUrlService } from './api-url-service';
import { ClockService } from './clock-service';
import { NgoService } from './ngo-service';

/** How often availability re-polls the API (PLAN §6.4). */
const POLL_MS = 10_000;

export type NewActivity = Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'checkInCode'>;

/** Everything needed to compute live availability, fetched together. */
export interface ActivitySnapshot {
  activities: Activity[];
  ngos: Ngo[];
  /** Only registrations with status 'registered' (the ones that take a slot). */
  registrations: Registration[];
  /** Registered places on activities that are not cancelled: one per employee per season. */
  activeRegistrations: Registration[];
  threshold: number;
  now: Date;
}

/**
 * Activities CRUD + live availability (UC1, UC2).
 * AJAX: `snapshot$` polls every 10 s and also reloads on `refresh()`;
 * shareReplay makes every subscribed view share one request.
 */
@Injectable({ providedIn: 'root' })
export class ActivityService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiUrlService);
  private readonly clock = inject(ClockService);
  private readonly ngoService = inject(NgoService);
  private readonly refresh$ = new Subject<void>();

  readonly snapshot$: Observable<ActivitySnapshot> = merge(this.refresh$, this.ngoService.changed$).pipe(
    startWith(undefined),
    // Each refresh restarts the 10-second polling timer.
    switchMap(() => timer(0, POLL_MS)),
    // A failed poll is skipped (ErrorInterceptor already showed a toast); the next one retries.
    switchMap(() => this.snapshotOnce().pipe(catchError(() => EMPTY))),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /** Ask every live view to reload now (called after each mutation). */
  refresh(): void {
    this.refresh$.next();
  }

  /** Live activity views. Pass a userId to fill `isRegisteredByMe`. */
  live$(userId?: string): Observable<ActivityView[]> {
    return this.snapshot$.pipe(map((snapshot) => this.toViews(snapshot, userId)));
  }

  getView(id: string, userId?: string): Observable<ActivityView | null> {
    return this.live$(userId).pipe(map((views) => views.find((view) => view.id === id) ?? null));
  }

  /** Joins activities with their NGO and counts slots from registrations (single source of truth). */
  toViews(snapshot: ActivitySnapshot, userId?: string): ActivityView[] {
    const ngoById = new Map(snapshot.ngos.map((ngo) => [ngo.id, ngo]));
    return snapshot.activities
      .filter((activity) => ngoById.has(activity.ngoId))
      .map((activity) => {
        const mine = snapshot.registrations.filter((r) => r.activityId === activity.id);
        const taken = mine.length;
        return {
          ...activity,
          ngo: ngoById.get(activity.ngoId)!,
          taken,
          remaining: Math.max(activity.maxSlots - taken, 0),
          availability: getAvailability(activity, taken, snapshot.now, snapshot.threshold),
          isRegisteredByMe: userId ? mine.some((r) => r.userId === userId) : undefined,
        };
      })
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  }

  list(): Observable<Activity[]> {
    return this.http.get<Activity[]>(this.api.url('activities'));
  }

  get(id: string): Observable<Activity> {
    return this.http.get<Activity>(this.api.url('activities', id));
  }

  create(activity: NewActivity): Observable<Activity> {
    const now = this.clock.nowIso();
    const body = { ...activity, checkInCode: null, createdAt: now, updatedAt: now };
    return this.http.post<Activity>(this.api.url('activities'), body).pipe(tap(() => this.refresh()));
  }

  update(id: string, changes: Partial<NewActivity> & Pick<Partial<Activity>, 'checkInCode'>): Observable<Activity> {
    const body = { ...changes, updatedAt: this.clock.nowIso() };
    return this.http.patch<Activity>(this.api.url('activities', id), body).pipe(tap(() => this.refresh()));
  }

  /** The caller checks canDeleteActivity() first. */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(this.api.url('activities', id)).pipe(tap(() => this.refresh()));
  }

  /** One fresh fetch, no polling: used by the stream above and right before writes (overbooking guard). */
  snapshotOnce(): Observable<ActivitySnapshot> {
    return forkJoin({
      activities: this.list(),
      ngos: this.ngoService.list(),
      registrations: this.http.get<Registration[]>(this.api.url('registrations'), { params: { status: 'registered' } }),
      // Read with every snapshot so a changed "last slots" threshold applies on the next poll.
      settings: this.http.get<ReminderSettings>(this.api.url('reminderSettings')),
    }).pipe(
      map(({ activities, ngos, registrations, settings }) => {
        const cancelled = new Set(activities.filter((a) => a.status === 'cancelled').map((a) => a.id));
        return {
          activities,
          ngos,
          registrations,
          activeRegistrations: registrations.filter((r) => !cancelled.has(r.activityId)),
          threshold: settings.lastSlotsThreshold,
          now: this.clock.now(),
        };
      }),
    );
  }
}
