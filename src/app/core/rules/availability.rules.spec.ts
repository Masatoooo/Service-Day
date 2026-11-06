import { Activity } from '../models';
import {
  canDeleteActivity,
  canDeleteNgo,
  canRegister,
  canSwitch,
  canUnpublish,
  canWithdraw,
  getAvailability,
  isCutoffBeforeStart,
  isEndAfterStart,
  validateActivityEdit,
} from './availability.rules';

/** Fixed clock: Tue 10 Nov 2026, 10:00 local. */
const NOW = new Date(2026, 10, 10, 10, 0);
const THRESHOLD = 2;

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: 'a1',
    ngoId: 'n1',
    title: 'Reading Buddies',
    serviceType: 'Education',
    description: '',
    location: '',
    date: '2026-11-21',
    startTime: '09:00',
    endTime: '12:00',
    maxSlots: 12,
    cutoffAt: '2026-11-16T17:00:00', // local time, 6 days after NOW
    status: 'published',
    checkInCode: null,
    createdAt: '2026-11-01T09:00:00',
    updatedAt: '2026-11-01T09:00:00',
    ...overrides,
  };
}

describe('getAvailability (rule 1)', () => {
  it('is open with plenty of slots and a distant cut-off', () => {
    expect(getAvailability(makeActivity(), 3, NOW, THRESHOLD)).toBe('open');
  });

  it('is cancelled before anything else, even when full', () => {
    expect(getAvailability(makeActivity({ status: 'cancelled' }), 12, NOW, THRESHOLD)).toBe('cancelled');
  });

  it('is draft when not published', () => {
    expect(getAvailability(makeActivity({ status: 'draft' }), 0, NOW, THRESHOLD)).toBe('draft');
  });

  it('is closed exactly at the cut-off', () => {
    const activity = makeActivity({ cutoffAt: '2026-11-10T10:00:00' });
    expect(getAvailability(activity, 0, NOW, THRESHOLD)).toBe('closed');
  });

  it('prefers closed over full', () => {
    const activity = makeActivity({ cutoffAt: '2026-11-09T17:00:00' });
    expect(getAvailability(activity, 12, NOW, THRESHOLD)).toBe('closed');
  });

  it('is full when every slot is taken', () => {
    expect(getAvailability(makeActivity(), 12, NOW, THRESHOLD)).toBe('full');
  });

  it('is last-slots when remaining equals the threshold', () => {
    expect(getAvailability(makeActivity(), 10, NOW, THRESHOLD)).toBe('last-slots');
  });

  it('is not last-slots one slot above the threshold', () => {
    expect(getAvailability(makeActivity(), 9, NOW, THRESHOLD)).toBe('open');
  });

  it('prefers last-slots over closing-soon', () => {
    const activity = makeActivity({ cutoffAt: '2026-11-11T09:00:00' });
    expect(getAvailability(activity, 11, NOW, THRESHOLD)).toBe('last-slots');
  });

  it('is closing-soon when the cut-off is exactly 48 hours away', () => {
    const activity = makeActivity({ cutoffAt: '2026-11-12T10:00:00' });
    expect(getAvailability(activity, 0, NOW, THRESHOLD)).toBe('closing-soon');
  });

  it('is open when the cut-off is just over 48 hours away', () => {
    const activity = makeActivity({ cutoffAt: '2026-11-12T10:01:00' });
    expect(getAvailability(activity, 0, NOW, THRESHOLD)).toBe('open');
  });
});

describe('canRegister (rule 2)', () => {
  it('allows a published, open activity for someone without a place', () => {
    expect(canRegister(makeActivity(), 3, NOW, false)).toEqual({ ok: true });
  });

  it('blocks a cancelled activity', () => {
    expect(canRegister(makeActivity({ status: 'cancelled' }), 0, NOW, false)).toMatchObject({ ok: false, code: 'cancelled' });
  });

  it('blocks a draft activity', () => {
    expect(canRegister(makeActivity({ status: 'draft' }), 0, NOW, false)).toMatchObject({ ok: false, code: 'not-published' });
  });

  it('blocks after the cut-off and names the date', () => {
    const result = canRegister(makeActivity({ cutoffAt: '2026-11-09T17:00:00' }), 0, NOW, false);
    expect(result).toEqual({ ok: false, code: 'closed', reason: 'Registration closed on 9 Nov, 17:00.' });
  });

  it('blocks a full activity', () => {
    expect(canRegister(makeActivity(), 12, NOW, false)).toMatchObject({ ok: false, code: 'full' });
  });

  it('blocks a second registration in the same season', () => {
    expect(canRegister(makeActivity(), 3, NOW, true)).toMatchObject({ ok: false, code: 'already-registered' });
  });
});

describe('canSwitch (rule 3)', () => {
  const current = makeActivity({ id: 'current', title: 'Pack & Deliver' });

  it('allows a switch while both cut-offs are open', () => {
    expect(canSwitch(current, makeActivity({ id: 'target' }), 3, NOW)).toEqual({ ok: true });
  });

  it('blocks switching to the same activity', () => {
    expect(canSwitch(current, current, 3, NOW)).toMatchObject({ ok: false, code: 'same-activity' });
  });

  it("blocks when the current activity's cut-off has passed", () => {
    const locked = makeActivity({ id: 'current', cutoffAt: '2026-11-09T17:00:00' });
    expect(canSwitch(locked, makeActivity({ id: 'target' }), 0, NOW)).toEqual({
      ok: false,
      code: 'changes-closed',
      reason: 'Changes closed on 9 Nov, 17:00.',
    });
  });

  it('blocks when the target is full', () => {
    expect(canSwitch(current, makeActivity({ id: 'target' }), 12, NOW)).toMatchObject({ ok: false, code: 'full' });
  });

  it('blocks when the target has closed', () => {
    const target = makeActivity({ id: 'target', cutoffAt: '2026-11-09T17:00:00' });
    expect(canSwitch(current, target, 0, NOW)).toMatchObject({ ok: false, code: 'closed' });
  });
});

describe('canWithdraw (rule 4)', () => {
  it('allows withdrawing before the cut-off', () => {
    expect(canWithdraw(makeActivity(), NOW)).toEqual({ ok: true });
  });

  it('blocks withdrawing after the cut-off', () => {
    const result = canWithdraw(makeActivity({ cutoffAt: '2026-11-09T17:00:00' }), NOW);
    expect(result).toEqual({ ok: false, code: 'changes-closed', reason: 'Changes closed on 9 Nov, 17:00.' });
  });
});

describe('admin edits (rule 6)', () => {
  const valid = makeActivity();

  it('accepts a valid edit', () => {
    expect(validateActivityEdit(valid, 5)).toEqual([]);
  });

  it('rejects max slots below current registrations', () => {
    expect(validateActivityEdit({ ...valid, maxSlots: 4 }, 5)).toEqual([
      "Max slots can't go below the 5 people already registered.",
    ]);
  });

  it('rejects a cut-off at or after the start', () => {
    expect(validateActivityEdit({ ...valid, cutoffAt: '2026-11-21T09:00:00' }, 0)).toEqual([
      'The cut-off must be before the activity starts.',
    ]);
  });

  it('rejects an end time before the start time', () => {
    expect(validateActivityEdit({ ...valid, endTime: '08:00' }, 0)).toEqual(['The end time must be after the start time.']);
  });

  it('blocks deleting an activity with registrations', () => {
    expect(canDeleteActivity(3)).toMatchObject({ ok: false, code: 'has-registrations' });
    expect(canDeleteActivity(0)).toEqual({ ok: true });
  });

  it('keeps a cancelled activity that had registrations, with its own reason', () => {
    expect(canDeleteActivity(3, 'cancelled')).toEqual({
      ok: false,
      code: 'has-registrations',
      reason: '3 people had places when it was cancelled. Keep it so their history stays accurate.',
    });
  });

  it('blocks unpublishing an activity people are registered for', () => {
    expect(canUnpublish(1)).toMatchObject({ ok: false, reason: '1 person already registered. Cancel the activity instead so they are told.' });
    expect(canUnpublish(0)).toEqual({ ok: true });
  });

  it('checks end-after-start and cut-off-before-start separately', () => {
    expect(isEndAfterStart('09:00', '09:00')).toBe(false);
    expect(isEndAfterStart('09:00', '12:00')).toBe(true);
    expect(isCutoffBeforeStart({ date: '2026-11-21', startTime: '09:00', cutoffAt: '2026-11-21T08:59:00' })).toBe(true);
  });

  it('blocks deleting an NGO that still has activities', () => {
    expect(canDeleteNgo(2)).toMatchObject({ ok: false, code: 'has-activities' });
    expect(canDeleteNgo(0)).toEqual({ ok: true });
  });
});
