import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';
import { WORK_EMAIL_DOMAIN } from '../models';
import { UserService } from '../services/user-service';

/** Wait this long after the last keystroke before asking the API. */
const EMAIL_CHECK_DEBOUNCE_MS = 400;

/** Custom validator: the email must end with @halden.co. → { workEmail: true } */
export const workEmailValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim().toLowerCase();
  return !value || value.endsWith(WORK_EMAIL_DOMAIN) ? null : { workEmail: true };
};

/** At least one digit. → { needsNumber: true } (length is checked by Validators.minLength). */
export const containsNumberValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '');
  return !value || /\d/.test(value) ? null : { needsNumber: true };
};

/**
 * Cross-field validator for a FormGroup: `confirmKey` must equal `key`.
 * Sets { mismatch: true } on the confirm control so the message shows under it.
 */
export function matchingFieldsValidator(key: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const confirm = group.get(confirmKey);
    if (!confirm) return null;
    const matches = group.get(key)?.value === confirm.value;
    const { mismatch: _old, ...otherErrors } = confirm.errors ?? {};
    if (!matches && confirm.value) {
      confirm.setErrors({ ...otherErrors, mismatch: true });
      return { mismatch: true };
    }
    confirm.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
    return null;
  };
}

/**
 * Async validator: asks UserService whether the email is free. Angular cancels the
 * previous check on each keystroke, so the timer acts as a debounce.
 * → { emailTaken: true }. A network failure doesn't block the form (the server re-checks).
 */
export function emailAvailableValidator(users: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const email = String(control.value ?? '').trim();
    if (!email) {
      return of(null);
    }
    return timer(EMAIL_CHECK_DEBOUNCE_MS).pipe(
      switchMap(() => users.isEmailTaken(email)),
      map((taken) => (taken ? { emailTaken: true } : null)),
      catchError(() => of(null)),
    );
  };
}
