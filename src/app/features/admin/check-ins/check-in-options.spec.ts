import { ActivityView } from '../../../core/models';
import { checkInOptions, defaultOption } from './check-in-options';

const view = (id: string, date: string, status: ActivityView['status'] = 'published'): ActivityView =>
  ({ id, title: id, date, startTime: '09:00', status }) as ActivityView;

describe('checkInOptions', () => {
  const now = new Date('2026-11-06T10:00:00');
  const views = [view('later', '2026-11-20'), view('today', '2026-11-06'), view('draft', '2026-11-06', 'draft'), view('soon', '2026-11-13')];

  it("lists published activities, today's first, then by date", () => {
    expect(checkInOptions(views, now).map((o) => o.id)).toEqual(['today', 'soon', 'later']);
  });

  it('labels today and other dates', () => {
    const [today, soon] = checkInOptions(views, now);
    expect(today.label).toBe('today · today');
    expect(soon.label).toBe('soon · Fri 13 Nov');
  });

  it('keeps a requested activity, otherwise picks the first option', () => {
    const options = checkInOptions(views, now);
    expect(defaultOption(options, 'later')).toBe('later');
    expect(defaultOption(options, 'missing')).toBe('today');
    expect(defaultOption([], null)).toBeNull();
  });
});
