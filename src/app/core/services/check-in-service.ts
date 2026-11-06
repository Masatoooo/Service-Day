import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { format } from 'date-fns';
import { BehaviorSubject, EMPTY, Observable, Subject, catchError, forkJoin, map, of, startWith, switchMap, tap, throwError, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Activity, PublicUser, Registration } from '../models';
import {
  CHECK_IN_ALPHABET,
  CHECK_IN_CODE_LENGTH,
  RuleViolationError,
  canCheckIn,
  isLateArrival,
  isValidCheckInCode,
  normalizeCheckInCode,
} from '../rules';
import { ActivityService } from './activity-service';
import { ApiUrlService } from './api-url-service';
import { ClockService } from './clock-service';
import { UserService } from './user-service';

/** The admin arrivals list re-polls this often (PLAN §6.4). */
const ARRIVALS_POLL_MS = 5_000;

export interface CheckInResult {
  activity: Activity;
  registration: Registration;
  late: boolean;
}

export type ArrivalStatus = 'on-time' | 'late' | 'not-arrived';

export interface ArrivalRow {
  registrationId: string;
  name: string;
  email: string;
  department: string;
  registeredAt: string;
  checkedInAt: string | null;
  late: boolean;
  status: ArrivalStatus;
}

export interface ArrivalsView {
  activity: Activity;
  rows: ArrivalRow[];
  expected: number;
  present: number;
  late: number;
  notArrived: number;
}

const STATUS_LABEL: Record<ArrivalStatus, string> = { 'on-time': 'On time', late: 'Late', 'not-arrived': 'Not arrived' };

/** QR check-in (UC6, simulated): codes, check-in, live arrivals, attendance CSV. */
@Injectable({ providedIn: 'root' })
export class CheckInService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiUrlService);
  private readonly clock = inject(ClockService);
  private readonly activities = inject(ActivityService);
  private readonly users = inject(UserService);
  private readonly refresh$ = new Subject<void>();
  private readonly loadFailedSubject = new BehaviorSubject(false);
  /** True while the latest arrivals poll failed (the page shows an error state; polling continues). */
  readonly loadFailed$ = this.loadFailedSubject.asObservable();

  /** New random 8-character code from the unambiguous alphabet, saved on the activity. */
  generateCode(activityId: string): Observable<string> {
    const bytes = crypto.getRandomValues(new Uint8Array(CHECK_IN_CODE_LENGTH));
    const code = Array.from(bytes, (byte) => CHECK_IN_ALPHABET[byte % CHECK_IN_ALPHABET.length]).join('');
    return this.activities.update(activityId, { checkInCode: code }).pipe(
      tap(() => this.refresh$.next()),
      map(() => code),
    );
  }

  /**
   * The link encoded in the QR code. `environment.publicAppUrl` when set; otherwise
   * the address this page was opened on, so `npm run dev:lan` + the Mac's IP just works.
   */
  checkInUrl(code: string): string {
    const base = environment.publicAppUrl || window.location.origin;
    return `${base}/app/check-in/${code}`;
  }

  /** Code → activity, or null when nothing matches. */
  resolve(rawCode: string): Observable<Activity | null> {
    const code = normalizeCheckInCode(rawCode);
    if (!isValidCheckInCode(code)) {
      return of(null);
    }
    return this.http
      .get<Activity[]>(this.api.url('activities'), { params: { checkInCode: code } })
      .pipe(map((found) => found[0] ?? null));
  }

  checkIn(userId: string, rawCode: string): Observable<CheckInResult> {
    return this.resolve(rawCode).pipe(
      switchMap((activity) => {
        if (!activity) {
          const message = "We couldn't find an activity with that code. Check the 8 characters under the QR code.";
          return throwError(() => new RuleViolationError('invalid-code', message));
        }
        return this.http
          .get<Registration[]>(this.api.url('registrations'), { params: { activityId: activity.id, userId } })
          .pipe(map((rows) => ({ activity, registration: rows.find((r) => r.status === 'registered') ?? null })));
      }),
      switchMap(({ activity, registration }) => {
        const now = this.clock.now();
        const result = canCheckIn(activity, registration, now);
        if (!result.ok) {
          return throwError(() => new RuleViolationError(result.code, result.reason));
        }
        // canCheckIn only allows a non-null, 'registered' registration.
        const registered = registration as Registration;
        return this.http
          .patch<Registration>(this.api.url('registrations', registered.id), { checkedInAt: this.clock.nowIso() })
          .pipe(
            tap(() => this.refresh$.next()),
            map((updated) => ({ activity, registration: updated, late: isLateArrival(activity, now) })),
          );
      }),
    );
  }

  /** Live arrivals for the admin Check-ins page: polls every 5 s and right after a code change. */
  arrivals$(activityId: string): Observable<ArrivalsView> {
    const employees$ = this.users.employees();
    return this.refresh$.pipe(
      startWith(undefined),
      switchMap(() => timer(0, ARRIVALS_POLL_MS)),
      switchMap(() =>
        forkJoin({
          activity: this.activities.get(activityId),
          registrations: this.http.get<Registration[]>(this.api.url('registrations'), {
            params: { activityId, status: 'registered' },
          }),
          employees: employees$,
        }).pipe(
          tap(() => this.loadFailedSubject.next(false)),
          // A failed poll is skipped (ErrorInterceptor shows the toast); the next one retries.
          catchError(() => {
            this.loadFailedSubject.next(true);
            return EMPTY;
          }),
        ),
      ),
      map(({ activity, registrations, employees }) => this.toArrivals(activity, registrations, employees)),
    );
  }

  /**
   * Attendance export (PLAN §3): one row per registered volunteer. UTF-8 with a BOM and
   * CRLF line ends, so Excel and Numbers open names and dashes correctly.
   */
  toCsv(view: ArrivalsView): string {
    const escape = (value: string) => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
    const when = (iso: string | null) => (iso ? format(new Date(iso), 'yyyy-MM-dd HH:mm') : '');
    const header = ['Name', 'Email', 'Department', 'Activity', 'Registered at', 'Checked in at', 'Status'];
    const lines = view.rows.map((row) => [
      row.name,
      row.email,
      row.department,
      view.activity.title,
      when(row.registeredAt),
      when(row.checkedInAt),
      STATUS_LABEL[row.status],
    ]);
    return '\uFEFF' + [header, ...lines].map((cells) => cells.map(escape).join(',')).join('\r\n') + '\r\n';
  }

  private toArrivals(activity: Activity, registrations: Registration[], employees: PublicUser[]): ArrivalsView {
    const byId = new Map(employees.map((e) => [e.id, e]));
    const rows: ArrivalRow[] = registrations.map((r) => {
      const late = r.checkedInAt ? isLateArrival(activity, new Date(r.checkedInAt)) : false;
      return {
        registrationId: r.id,
        name: byId.get(r.userId)?.name ?? 'Unknown employee',
        email: byId.get(r.userId)?.email ?? '',
        department: byId.get(r.userId)?.department ?? '',
        registeredAt: r.registeredAt,
        checkedInAt: r.checkedInAt,
        late,
        status: r.checkedInAt ? (late ? 'late' : 'on-time') : 'not-arrived',
      };
    });
    // Arrived first (latest on top), then everyone still expected, by name.
    rows.sort((a, b) => {
      if (a.checkedInAt && b.checkedInAt) return Date.parse(b.checkedInAt) - Date.parse(a.checkedInAt);
      if (a.checkedInAt || b.checkedInAt) return a.checkedInAt ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    const present = rows.filter((row) => row.checkedInAt).length;
    return { activity, rows, expected: rows.length, present, late: rows.filter((row) => row.late).length, notArrived: rows.length - present };
  }
}
