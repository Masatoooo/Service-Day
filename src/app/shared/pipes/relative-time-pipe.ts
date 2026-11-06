import { Pipe, PipeTransform } from '@angular/core';
import { differenceInSeconds, formatDistanceStrict } from 'date-fns';

/**
 * "3 minutes ago", "in 2 days". `now` is passed in (from ClockService via the
 * component), so the pipe stays pure: same inputs, same output.
 */
@Pipe({ name: 'relativeTime', standalone: false })
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date | null | undefined, now: Date): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (Math.abs(differenceInSeconds(date, now)) < 60) {
      return 'just now';
    }
    return formatDistanceStrict(date, now, { addSuffix: true });
  }
}
