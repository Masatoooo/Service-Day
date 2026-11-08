import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Longest values the forms accept (the mock API has no limits; Assignment 2's server should enforce the same). */
export const TEXT_LIMITS = {
  personName: 80,
  ngoName: 60,
  focusArea: 40,
  ngoDescription: 400,
  email: 120,
  activityTitle: 80,
  activityDescription: 800,
  location: 120,
} as const;

/**
 * Like Validators.required, but a value of only spaces also counts as empty
 * (Validators.required accepts "   "). Same error key, so the same message shows.
 */
export const requiredText: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim() === '' ? { required: true } : null;
