import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { format } from 'date-fns';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';
import { isCutoffBeforeStart, isEndAfterStart } from '../rules';
import { ActivityAdminService } from '../services/activity-admin-service';

/**
 * Validators for the admin activity form (PLAN §5 rule 6). The checks themselves
 * are the pure rule functions; these only connect them to form controls.
 */

/** Adds or removes one error key on a control without touching its other errors. */
function toggleError(control: AbstractControl | null, key: string, value: unknown): void {
  if (!control) return;
  const { [key]: _old, ...others } = control.errors ?? {};
  const next = value ? { ...others, [key]: value } : others;
  control.setErrors(Object.keys(next).length ? next : null);
}

/** Group validator: endTime must be after startTime → { endBeforeStart: { start } } on endTime. */
export const endAfterStartValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const start = group.get('startTime')?.value as string;
  const end = group.get('endTime')?.value as string;
  const invalid = !!start && !!end && !isEndAfterStart(start, end);
  toggleError(group.get('endTime'), 'endBeforeStart', invalid ? { start } : null);
  return invalid ? { endBeforeStart: true } : null;
};

/** Group validator: the cut-off must be before the start → { cutoffAfterStart: { start } } on cutoffTime. */
export const cutoffBeforeStartValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const date = group.get('date')?.value as string;
  const startTime = group.get('startTime')?.value as string;
  const cutoffDate = group.get('cutoffDate')?.value as string;
  const cutoffTime = group.get('cutoffTime')?.value as string;
  if (!date || !startTime || !cutoffDate || !cutoffTime) {
    toggleError(group.get('cutoffTime'), 'cutoffAfterStart', null);
    return null;
  }
  const cutoffAt = `${cutoffDate}T${cutoffTime}:00`;
  const invalid = !isCutoffBeforeStart({ date, startTime, cutoffAt });
  const start = `${format(new Date(`${date}T00:00:00`), 'EEE d MMM')}, ${startTime}`;
  toggleError(group.get('cutoffTime'), 'cutoffAfterStart', invalid ? { start } : null);
  return invalid ? { cutoffAfterStart: true } : null;
};

/**
 * Async validator (edit only): maxSlots can't go below the people already
 * registered, checked against the API → { belowTaken: { taken } }.
 */
export function maxSlotsNotBelowTakenValidator(admin: ActivityAdminService, activityId: string): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const maxSlots = Number(control.value);
    if (!maxSlots) return of(null);
    return timer(300).pipe(
      switchMap(() => admin.takenCount(activityId)),
      map((taken) => (maxSlots < taken ? { belowTaken: { taken } } : null)),
      catchError(() => of(null)),
    );
  };
}
