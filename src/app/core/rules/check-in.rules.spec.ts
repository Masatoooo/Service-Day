import { Activity, Registration } from '../models';
import { canCheckIn, isLateArrival, isValidCheckInCode, normalizeCheckInCode } from './check-in.rules';

/** Activity day: Sat 21 Nov 2026, 14:00 start. */
const activity: Activity = {
  id: 'f',
  ngoId: 'n6',
  title: 'Memory Lane Afternoon',
  serviceType: 'Elderly Care',
  description: '',
  location: '',
  date: '2026-11-21',
  startTime: '14:00',
  endTime: '17:00',
  maxSlots: 8,
  cutoffAt: '2026-11-19T17:00:00',
  status: 'published',
  checkInCode: 'K7Q2MX9P',
  createdAt: '2026-11-01T09:00:00',
  updatedAt: '2026-11-01T09:00:00',
};

function makeRegistration(overrides: Partial<Registration> = {}): Registration {
  return {
    id: 'r1',
    userId: 'u-marcus',
    activityId: 'f',
    status: 'registered',
    registeredAt: '2026-11-05T10:00:00',
    updatedAt: '2026-11-05T10:00:00',
    checkedInAt: null,
    ...overrides,
  };
}

const ON_THE_DAY = new Date(2026, 10, 21, 13, 50);

describe('canCheckIn (rule 7)', () => {
  it('allows a registered volunteer on the activity date', () => {
    expect(canCheckIn(activity, makeRegistration(), ON_THE_DAY)).toEqual({ ok: true });
  });

  it('allows the whole local day, from 00:00 to 23:59', () => {
    expect(canCheckIn(activity, makeRegistration(), new Date(2026, 10, 21, 0, 0))).toEqual({ ok: true });
    expect(canCheckIn(activity, makeRegistration(), new Date(2026, 10, 21, 23, 59))).toEqual({ ok: true });
  });

  it('blocks someone without a registration', () => {
    expect(canCheckIn(activity, null, ON_THE_DAY)).toMatchObject({ ok: false, code: 'not-registered' });
  });

  it('blocks a withdrawn or switched registration', () => {
    expect(canCheckIn(activity, makeRegistration({ status: 'withdrawn' }), ON_THE_DAY)).toMatchObject({ code: 'not-registered' });
    expect(canCheckIn(activity, makeRegistration({ status: 'switched' }), ON_THE_DAY)).toMatchObject({ code: 'not-registered' });
  });

  it('rejects a second check-in politely, with the first time', () => {
    const result = canCheckIn(activity, makeRegistration({ checkedInAt: '2026-11-21T13:41:00' }), ON_THE_DAY);
    expect(result).toEqual({ ok: false, code: 'already-checked-in', reason: 'You already checked in at 13:41. Enjoy the day!' });
  });

  it('blocks the day before', () => {
    const result = canCheckIn(activity, makeRegistration(), new Date(2026, 10, 20, 23, 59));
    expect(result).toEqual({ ok: false, code: 'too-early', reason: 'Check-in opens on Sat 21 Nov.' });
  });

  it('blocks the day after', () => {
    const result = canCheckIn(activity, makeRegistration(), new Date(2026, 10, 22, 0, 0));
    expect(result).toMatchObject({ ok: false, code: 'too-late' });
  });

  it('blocks a cancelled activity', () => {
    expect(canCheckIn({ ...activity, status: 'cancelled' }, makeRegistration(), ON_THE_DAY)).toMatchObject({ code: 'cancelled' });
  });
});

describe('isLateArrival', () => {
  it('is on time up to and including 15 minutes after the start', () => {
    expect(isLateArrival(activity, new Date(2026, 10, 21, 14, 15))).toBe(false);
  });

  it('is late after 15 minutes', () => {
    expect(isLateArrival(activity, new Date(2026, 10, 21, 14, 16))).toBe(true);
  });

  it('is on time when arriving early', () => {
    expect(isLateArrival(activity, new Date(2026, 10, 21, 13, 30))).toBe(false);
  });
});

describe('check-in codes', () => {
  it('normalises spaces, dashes and case', () => {
    expect(normalizeCheckInCode(' k7q2-mx9p ')).toBe('K7Q2MX9P');
  });

  it('accepts 8 characters from the unambiguous alphabet', () => {
    expect(isValidCheckInCode('K7Q2MX9P')).toBe(true);
  });

  it('rejects ambiguous characters and wrong lengths', () => {
    expect(isValidCheckInCode('K7Q2MX9O')).toBe(false); // letter O
    expect(isValidCheckInCode('K7Q2MX91')).toBe(false); // digit 1
    expect(isValidCheckInCode('K7Q2MX9')).toBe(false);
  });
});
