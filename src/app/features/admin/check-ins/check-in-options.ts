import { format, isSameDay } from 'date-fns';
import { ActivityView } from '../../../core/models';

/** One entry in the activity picker on the Check-ins page. */
export interface CheckInOption {
  id: string;
  label: string;
  today: boolean;
}

const dayOf = (view: ActivityView) => new Date(`${view.date}T00:00:00`);

/**
 * Published activities for the picker: today's first (check-in is open for them),
 * then by date. Pure function: `now` comes from ClockService.
 */
export function checkInOptions(views: ActivityView[], now: Date): CheckInOption[] {
  return views
    .filter((v) => v.status === 'published')
    .map((v) => {
      const today = isSameDay(dayOf(v), now);
      return { id: v.id, today, label: `${v.title} · ${today ? 'today' : format(dayOf(v), 'EEE d MMM')}`, date: v.date + v.startTime };
    })
    .sort((a, b) => Number(b.today) - Number(a.today) || a.date.localeCompare(b.date))
    .map(({ date: _date, ...option }) => option);
}

/** Default selection: the requested id if it exists, else the first activity happening today, else the next one. */
export function defaultOption(options: CheckInOption[], requested: string | null): string | null {
  return options.find((o) => o.id === requested)?.id ?? options[0]?.id ?? null;
}
