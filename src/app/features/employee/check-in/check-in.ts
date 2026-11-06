import { Component, ElementRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { format } from 'date-fns';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { Activity } from '../../../core/models';
import { CHECK_IN_CODE_LENGTH, RuleViolationError, isValidCheckInCode, normalizeCheckInCode } from '../../../core/rules';
import { AuthService } from '../../../core/services/auth-service';
import { CheckInService } from '../../../core/services/check-in-service';

/** What the page shows: the form, the request in flight, a success, or a specific refusal. */
type CheckInState =
  | { kind: 'idle' }
  | { kind: 'working'; code: string }
  | { kind: 'done'; activity: Activity; time: string; late: boolean }
  | { kind: 'refused'; code: string; reason: string; heading: string; tone: 'info' | 'warning' };

/** A heading per refusal (the rule supplies the sentence underneath). */
const REFUSAL_HEADING: Record<string, string> = {
  'invalid-code': "We don't recognise that code",
  'not-registered': "You're not on this activity's list",
  'already-checked-in': "You're already checked in",
  'too-early': "It's too early to check in",
  'too-late': 'Check-in has closed',
  cancelled: 'This activity was cancelled',
};

/**
 * Check in (/app/check-in and /app/check-in/:code, UC6). The QR link opens the second
 * route and checks in straight away; the first is for typing the code by hand.
 * Controller: reads the code, delegates to CheckInService, shows the outcome.
 */
@Component({
  selector: 'app-check-in',
  standalone: false,
  templateUrl: './check-in.html',
  styleUrl: './check-in.css',
})
export class CheckIn {
  private readonly checkIns = inject(CheckInService);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly userId = inject(AuthService).session?.userId ?? '';

  protected readonly codeLength = CHECK_IN_CODE_LENGTH;
  protected readonly state = signal<CheckInState>({ kind: 'idle' });
  protected readonly typed = signal('');
  protected readonly formError = signal<string | null>(null);

  constructor() {
    inject(ActivatedRoute)
      .paramMap.pipe(
        map((params) => params.get('code')),
        switchMap((code) => (code ? this.run(code) : of<CheckInState>({ kind: 'idle' }))),
        takeUntilDestroyed(),
      )
      .subscribe((state) => this.state.set(state));
  }

  protected onType(event: Event): void {
    this.typed.set((event.target as HTMLInputElement).value.toUpperCase());
    this.formError.set(null);
  }

  /** Manual entry: validate the format here, then open the code's own URL (same flow as the QR). */
  protected submit(event: Event): void {
    event.preventDefault();
    const code = normalizeCheckInCode(this.typed());
    if (!isValidCheckInCode(code)) {
      this.formError.set(`Enter the ${CHECK_IN_CODE_LENGTH} characters under the QR code: letters and the numbers 2–9 (there is no 0, 1, I, L or O).`);
      this.host.nativeElement.querySelector<HTMLInputElement>('#ci-code')?.focus();
      return;
    }
    this.router.navigate(['/app/check-in', code]);
  }

  private run(rawCode: string): Observable<CheckInState> {
    const code = normalizeCheckInCode(rawCode);
    this.state.set({ kind: 'working', code });
    return this.checkIns.checkIn(this.userId, code).pipe(
      map(({ activity, registration, late }): CheckInState => ({
        kind: 'done',
        activity,
        late,
        time: format(new Date(registration.checkedInAt ?? Date.now()), 'HH:mm'),
      })),
      catchError((error: unknown) => {
        if (!(error instanceof RuleViolationError)) {
          // Network/HTTP problems: ErrorInterceptor already showed a toast; let them try again.
          this.typed.set(code);
          return of<CheckInState>({ kind: 'idle' });
        }
        const heading = REFUSAL_HEADING[error.code] ?? "We couldn't check you in";
        const tone = error.code === 'already-checked-in' ? 'info' : 'warning';
        this.typed.set(code);
        return of<CheckInState>({ kind: 'refused', code, reason: error.message, heading, tone });
      }),
    );
  }
}
