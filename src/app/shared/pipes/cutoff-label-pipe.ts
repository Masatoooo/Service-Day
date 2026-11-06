import { Pipe, PipeTransform } from '@angular/core';
import { format, formatDistanceStrict, isBefore } from 'date-fns';

/**
 * Cut-off label, relative and absolute together (PLAN §8.5):
 *   before → "Closes in 2 days · 18 Nov, 17:00"
 *   after  → "Closed 18 Nov, 17:00"
 */
@Pipe({ name: 'cutoffLabel', standalone: false })
export class CutoffLabelPipe implements PipeTransform {
  transform(cutoffAt: string | Date | null | undefined, now: Date): string {
    if (!cutoffAt) {
      return '';
    }
    const cutoff = new Date(cutoffAt);
    const absolute = format(cutoff, 'd MMM, HH:mm');
    if (!isBefore(now, cutoff)) {
      return `Closed ${absolute}`;
    }
    return `Closes in ${formatDistanceStrict(cutoff, now)} · ${absolute}`;
  }
}
