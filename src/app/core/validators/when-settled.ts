import { AbstractControl } from '@angular/forms';
import { Observable, filter, map, take } from 'rxjs';

/**
 * Emits once when no async validator is running on the form any more.
 * Listens on `events` (not `statusChanges`): in Angular 22 the final status of an
 * async validator started by `reset()` only arrives as a StatusChangeEvent there.
 */
export function whenSettled(form: AbstractControl): Observable<void> {
  return form.events.pipe(
    filter(() => !form.pending),
    take(1),
    map(() => undefined),
  );
}
