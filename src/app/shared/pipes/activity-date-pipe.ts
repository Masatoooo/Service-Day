import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';
import { Activity } from '../../core/models';

/**
 * When an activity happens:
 *   'short' → "Fri 20 Nov · 08:30–12:30"
 *   'long'  → "Friday 20 November · 08:30–12:30"
 */
@Pipe({ name: 'activityDate', standalone: false })
export class ActivityDatePipe implements PipeTransform {
  transform(activity: Pick<Activity, 'date' | 'startTime' | 'endTime'> | null | undefined, style: 'short' | 'long' = 'short'): string {
    if (!activity) {
      return '';
    }
    const day = format(new Date(`${activity.date}T00:00:00`), style === 'long' ? 'EEEE d MMMM' : 'EEE d MMM');
    return `${day} · ${activity.startTime}–${activity.endTime}`;
  }
}
