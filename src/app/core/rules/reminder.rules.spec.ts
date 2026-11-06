import { ReminderSettings } from '../models';
import { upcomingReminders } from './reminder.rules';

const NOW = new Date(2026, 10, 10, 10, 0); // Tue 10 Nov 2026, 10:00
const settings: ReminderSettings = { enabled: true, offsetsDays: [7, 3, 1], sendTime: '09:00', lastSlotsThreshold: 2 };

const activities = [
  { id: 'a', title: 'Pack & Deliver', date: '2026-11-21', status: 'published' as const },
  { id: 'h', title: 'STEM Craft Workshop', date: '2026-11-21', status: 'draft' as const },
  { id: 'e', title: 'Lunch Service', date: '2026-11-12', status: 'published' as const },
];

describe('upcomingReminders (rule 9)', () => {
  it('lists future reminders for published activities, soonest first', () => {
    const result = upcomingReminders(activities, settings, NOW);
    expect(result.map((r) => `${r.activityId}-${r.offsetDays}`)).toEqual(['e-1', 'a-7', 'a-3', 'a-1']);
    expect(result[0].sendAt).toEqual(new Date(2026, 10, 11, 9, 0));
  });

  it('skips reminders whose send time has passed', () => {
    // Lunch Service 7 and 3 days before (5 and 9 Nov) are in the past.
    expect(upcomingReminders(activities, settings, NOW).some((r) => r.activityId === 'e' && r.offsetDays > 1)).toBe(false);
  });

  it('returns nothing when reminders are disabled', () => {
    expect(upcomingReminders(activities, { ...settings, enabled: false }, NOW)).toEqual([]);
  });

  it('respects the limit', () => {
    expect(upcomingReminders(activities, settings, NOW, 2)).toHaveLength(2);
  });
});
