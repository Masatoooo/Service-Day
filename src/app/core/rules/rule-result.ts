// Shared result type for every rule: either allowed, or blocked with a code
// (for programmatic checks) and a human sentence (shown in the UI as-is).

export type RuleCode =
  | 'cancelled'
  | 'not-published'
  | 'closed'
  | 'full'
  | 'already-registered'
  | 'same-activity'
  | 'changes-closed'
  | 'has-registrations'
  | 'has-activities'
  | 'not-registered'
  | 'already-checked-in'
  | 'too-early'
  | 'too-late'
  | 'invalid-code'
  | 'no-current-registration';

export type RuleResult = { ok: true } | { ok: false; code: RuleCode; reason: string };

export const ALLOWED: RuleResult = { ok: true };

export function blocked(code: RuleCode, reason: string): RuleResult {
  return { ok: false, code, reason };
}

/**
 * Thrown (as an Observable error) by services when a rule blocks an action.
 * `message` is the human sentence; components show it in a toast or inline.
 */
export class RuleViolationError extends Error {
  constructor(
    readonly code: RuleCode,
    message: string,
  ) {
    super(message);
    this.name = 'RuleViolationError';
  }
}
