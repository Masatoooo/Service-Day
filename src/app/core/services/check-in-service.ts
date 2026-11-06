import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { format } from 'date-fns';
import { Observable, forkJoin, map, of, switchMap, throwError, timer } from 'rxjs';
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

export interface ArrivalRow {
  registrationId: string;
  name: string;
  department: string;
  checkedInAt: string | null;
  late: boolean;
}

export interface ArrivalsView {
  activity: Activity;
  rows: ArrivalRow[];
  expected: number;
  present: number;
  late: number;
}

/** QR check-in (UC6, simulated): codes, check-in, live arrivals, attendance CSV. */
@Injectable({ providedIn: 'root' })
export class CheckInService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiUrlService);
  private readonly clock = inject(ClockService);
  private readonly activities = inject(ActivityService);
  private readonly users = inject(UserService);

  /** New random 8-character code from the unambiguous alphabet, saved on the activity. */
  generateCode(activityId: string): Observable<string> {
    const bytes = crypto.getRandomValues(new Uint8Array(CHECK_IN_CODE_LENGTH));
    const code = Array.from(bytes, (byte) => CHECK_IN_ALPHABET[byte % CHECK_IN_ALPHABET.length]).join('');
    return this.activities.update(activityId, { checkInCode: code }).pipe(map(() => code));
  }

  /** The link encoded in the QR code. */
  checkInUrl(code: string): string {
    return `${environment.publicAppUrl}/app/check-in/${code}`;
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
          .pipe(map((updated) => ({ activity, registration: updated, late: isLateArrival(activity, now) })));
      }),
    );
  }

  /** Live arrivals for the admin Check-ins page: polls every 5 s. */
  arrivals$(activityId: string): Observable<ArrivalsView> {
    const employees$ = this.users.employees();
    return timer(0, ARRIVALS_POLL_MS).pipe(
      switchMap(() =>
        forkJoin({
          activity: this.activities.get(activityId),
          registrations: this.http.get<Registration[]>(this.api.url('registrations'), {
            params: { activityId, status: 'registered' },
          }),
          employees: employees$,
        }),
      ),
      map(({ activity, registrations, employees }) => this.toArrivals(activity, registrations, employees)),
    );
  }

  /** Attendance export: one row per registered volunteer. */
  toCsv(view: ArrivalsView): string {
    const escape = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
    const header = ['Name', 'Department', 'Status', 'Checked in at'];
    const lines = view.rows.map((row) => {
      const status = row.checkedInAt ? (row.late ? 'Late' : 'Present') : 'Not arrived';
      const time = row.checkedInAt ? format(new Date(row.checkedInAt), 'yyyy-MM-dd HH:mm') : '';
      return [row.name, row.department, status, time];
    });
    return [header, ...lines].map((cells) => cells.map(escape).join(',')).join('\n');
  }

  private toArrivals(activity: Activity, registrations: Registration[], employees: PublicUser[]): ArrivalsView {
    const byId = new Map(employees.map((e) => [e.id, e]));
    const rows: ArrivalRow[] = registrations.map((r) => ({
      registrationId: r.id,
      name: byId.get(r.userId)?.name ?? 'Unknown employee',
      department: byId.get(r.userId)?.department ?? '',
      checkedInAt: r.checkedInAt,
      late: r.checkedInAt ? isLateArrival(activity, new Date(r.checkedInAt)) : false,
    }));
    // Arrived first (latest on top), then everyone still expected, by name.
    rows.sort((a, b) => {
      if (a.checkedInAt && b.checkedInAt) return Date.parse(b.checkedInAt) - Date.parse(a.checkedInAt);
      if (a.checkedInAt || b.checkedInAt) return a.checkedInAt ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    const present = rows.filter((row) => row.checkedInAt).length;
    return { activity, rows, expected: rows.length, present, late: rows.filter((row) => row.late).length };
  }
}
