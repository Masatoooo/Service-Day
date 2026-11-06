import { CanDeactivateFn } from '@angular/router';

/** A page that can tell whether leaving would lose edits. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/** Asks before leaving a form with unsaved edits (in-app navigation). */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) =>
  !component.hasUnsavedChanges() || window.confirm('You have unsaved changes. Leave this page without saving them?');
