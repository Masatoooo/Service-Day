import { addMinutes, format, isSameDay } from 'date-fns';
import { Activity, Registration } from '../models';
import { activityStart } from './availability.rules';
import { ALLOWED, RuleResult, blocked } from './rule-result';

/**
 * Model: QR check-in rules (PLAN §5 rule 7). Pure functions, `now` as a parameter.
 */

export const CHECK_IN_CODE_LENGTH = 8;
/** No 0/O, 1/I/L: easy to read aloud and to type from a printed sheet. */
export const CHECK_IN_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
/** Arriving more than this many minutes after the start time counts as late. */
export const LATE_AFTER_MINUTES = 15;

/** "ab12-cd34 " → "AB12CD34". */
export function normalizeCheckInCode(input: string): string {
  return input.replace(/[\s-]/g, '').toUpperCase();
}

export function isValidCheckInCode(code: string): boolean {
  return code.length === CHECK_IN_CODE_LENGTH && [...code].every((char) => CHECK_IN_ALPHABET.includes(char));
}

/** Rule 7: on the activity's date (local, all day in the mock), registered, once. */
export function canCheckIn(activity: Activity, registration: Registration | null, now: Date): RuleResult {
  if (activity.status === 'cancelled') {
    return blocked('cancelled', 'This activity has been cancelled.');
  }
  if (!registration || registration.status !== 'registered') {
    return blocked('not-registered', `You're not registered for ${activity.title}. Only registered volunteers can check in.`);
  }
  if (registration.checkedInAt) {
    const time = format(new Date(registration.checkedInAt), 'HH:mm');
    return blocked('already-checked-in', `You already checked in at ${time}. Enjoy the day!`);
  }
  const day = new Date(`${activity.date}T00:00:00`);
  if (!isSameDay(now, day)) {
    const label = format(day, 'EEE d MMM');
    return now < day
      ? blocked('too-early', `Check-in opens on ${label}.`)
      : blocked('too-late', `Check-in for this activity closed on ${label}.`);
  }
  return ALLOWED;
}

/** Shown as "Late" when the arrival is more than 15 minutes after the start. */
export function isLateArrival(activity: Pick<Activity, 'date' | 'startTime'>, checkedInAt: Date): boolean {
  return checkedInAt.getTime() > addMinutes(activityStart(activity), LATE_AFTER_MINUTES).getTime();
}
