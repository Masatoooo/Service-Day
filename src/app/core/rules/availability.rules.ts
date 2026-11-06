import { format } from 'date-fns';
import { Activity, Availability } from '../models';
import { ALLOWED, RuleResult, blocked } from './rule-result';

/**
 * Model: business rules for slots, cut-offs and registrations (PLAN §5, rules 1–4 and 6).
 * Pure functions: no HTTP, no DOM, and `now` is always a parameter (from ClockService),
 * so every rule can be unit-tested with fixed dates.
 */

/** A cut-off within this many hours shows the activity as "closing soon". */
export const CLOSING_SOON_HOURS = 48;
const HOUR_MS = 60 * 60 * 1000;

/** "18 Nov, 17:00" — the absolute format used in every rule message. */
export function formatCutoff(cutoffAt: string): string {
  return format(new Date(cutoffAt), 'd MMM, HH:mm');
}

/** Local start of the activity, from its 'YYYY-MM-DD' date and 'HH:mm' start time. */
export function activityStart(activity: Pick<Activity, 'date' | 'startTime'>): Date {
  return new Date(`${activity.date}T${activity.startTime}:00`);
}

export function isPastCutoff(activity: Pick<Activity, 'cutoffAt'>, now: Date): boolean {
  return now.getTime() >= new Date(activity.cutoffAt).getTime();
}

/** Rule 1: the first matching state wins, in this exact order. */
export function getAvailability(activity: Activity, taken: number, now: Date, threshold: number): Availability {
  if (activity.status === 'cancelled') return 'cancelled';
  if (activity.status === 'draft') return 'draft';
  if (isPastCutoff(activity, now)) return 'closed';
  const remaining = activity.maxSlots - taken;
  if (remaining <= 0) return 'full';
  if (remaining <= threshold) return 'last-slots';
  const msToCutoff = new Date(activity.cutoffAt).getTime() - now.getTime();
  if (msToCutoff <= CLOSING_SOON_HOURS * HOUR_MS) return 'closing-soon';
  return 'open';
}

/** Rule 2: can this employee take a slot on this activity? */
export function canRegister(activity: Activity, taken: number, now: Date, hasActiveRegistration: boolean): RuleResult {
  if (activity.status === 'cancelled') {
    return blocked('cancelled', 'This activity has been cancelled.');
  }
  if (activity.status !== 'published') {
    return blocked('not-published', "This activity isn't open for registration yet.");
  }
  if (isPastCutoff(activity, now)) {
    return blocked('closed', `Registration closed on ${formatCutoff(activity.cutoffAt)}.`);
  }
  if (taken >= activity.maxSlots) {
    return blocked('full', 'All slots are taken.');
  }
  if (hasActiveRegistration) {
    return blocked('already-registered', 'You already have a place for this Service Day. Switch to move it here.');
  }
  return ALLOWED;
}

/** Rule 3: move the current registration to `target` (both cut-offs must still be open). */
export function canSwitch(current: Activity, target: Activity, targetTaken: number, now: Date): RuleResult {
  if (current.id === target.id) {
    return blocked('same-activity', "You're already registered for this activity.");
  }
  if (isPastCutoff(current, now)) {
    return blocked('changes-closed', `Changes closed on ${formatCutoff(current.cutoffAt)}.`);
  }
  // Same checks as registering, minus "already registered" (that is the point of a switch).
  return canRegister(target, targetTaken, now, false);
}

/** Rule 4: give the slot back, only before the activity's cut-off. */
export function canWithdraw(current: Activity, now: Date): RuleResult {
  if (isPastCutoff(current, now)) {
    return blocked('changes-closed', `Changes closed on ${formatCutoff(current.cutoffAt)}.`);
  }
  return ALLOWED;
}

/** Fields an admin edits that rule 6 checks. */
export type ActivityEditInput = Pick<Activity, 'date' | 'startTime' | 'endTime' | 'maxSlots' | 'cutoffAt'>;

/** 'HH:mm' strings compare correctly as text. */
export function isEndAfterStart(startTime: string, endTime: string): boolean {
  return endTime > startTime;
}

export function isCutoffBeforeStart(input: Pick<Activity, 'date' | 'startTime' | 'cutoffAt'>): boolean {
  return new Date(input.cutoffAt).getTime() < activityStart(input).getTime();
}

/** Rule 6: admin edit validation. Returns human messages; empty means valid. */
export function validateActivityEdit(input: ActivityEditInput, taken: number): string[] {
  const errors: string[] = [];
  if (!isEndAfterStart(input.startTime, input.endTime)) {
    errors.push('The end time must be after the start time.');
  }
  if (!isCutoffBeforeStart(input)) {
    errors.push('The cut-off must be before the activity starts.');
  }
  if (input.maxSlots < 1) {
    errors.push('An activity needs at least 1 slot.');
  } else if (input.maxSlots < taken) {
    errors.push(`Max slots can't go below the ${taken} people already registered.`);
  }
  return errors;
}

const people = (n: number) => (n === 1 ? '1 person' : `${n} people`);

/**
 * Rule 6: an activity with registrations is cancelled (participants notified), not deleted.
 * A cancelled one keeps its registrations so people's history stays accurate.
 */
export function canDeleteActivity(taken: number, status: Activity['status'] = 'published'): RuleResult {
  if (taken > 0 && status === 'cancelled') {
    return blocked('has-registrations', `${people(taken)} had places when it was cancelled. Keep it so their history stays accurate.`);
  }
  if (taken > 0) {
    const verb = taken === 1 ? 'is' : 'are';
    return blocked('has-registrations', `${people(taken)} ${verb} registered. Cancel the activity instead so they are notified.`);
  }
  return ALLOWED;
}

/** Unpublishing would hide a place people already hold; cancel instead so they hear about it. */
export function canUnpublish(taken: number): RuleResult {
  if (taken > 0) {
    return blocked('has-registrations', `${people(taken)} already registered. Cancel the activity instead so they are told.`);
  }
  return ALLOWED;
}

/** An NGO that still has activities can't be deleted (PLAN §3, /admin/ngos). */
export function canDeleteNgo(activityCount: number): RuleResult {
  if (activityCount > 0) {
    const what = activityCount === 1 ? '1 activity' : `${activityCount} activities`;
    return blocked('has-activities', `This NGO still has ${what}. Delete or move them first.`);
  }
  return ALLOWED;
}
