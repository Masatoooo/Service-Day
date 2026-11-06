import { setHours, setMinutes, subDays } from 'date-fns';
import { Activity, ReminderSettings } from '../models';

/**
 * Model: reminder preview (PLAN §5 rule 9). Lists the reminders the schedule
 * *would* send, so UC5 is demonstrable without a real scheduler.
 */

export interface ReminderPreview {
  activityId: string;
  activityTitle: string;
  offsetDays: number;
  sendAt: Date;
}

export function upcomingReminders(
  activities: Pick<Activity, 'id' | 'title' | 'date' | 'status'>[],
  settings: ReminderSettings,
  now: Date,
  limit = 10,
): ReminderPreview[] {
  if (!settings.enabled) {
    return [];
  }
  const [hours, minutes] = settings.sendTime.split(':').map(Number);
  const previews: ReminderPreview[] = [];
  for (const activity of activities.filter((a) => a.status === 'published')) {
    const day = new Date(`${activity.date}T00:00:00`);
    for (const offsetDays of settings.offsetsDays) {
      const sendAt = setMinutes(setHours(subDays(day, offsetDays), hours), minutes);
      if (sendAt.getTime() > now.getTime()) {
        previews.push({ activityId: activity.id, activityTitle: activity.title, offsetDays, sendAt });
      }
    }
  }
  return previews.sort((a, b) => a.sendAt.getTime() - b.sendAt.getTime()).slice(0, limit);
}
