import { Pipe, PipeTransform } from '@angular/core';
import { Availability } from '../../core/models';

const LABELS: Record<Availability, string> = {
  open: 'Open',
  'last-slots': 'Last slots',
  'closing-soon': 'Closing soon',
  full: 'Full',
  closed: 'Closed',
  cancelled: 'Cancelled',
  draft: 'Draft',
};

/** 'last-slots' → "Last slots" (sentence case, as everywhere in the UI). */
@Pipe({ name: 'availabilityLabel', standalone: false })
export class AvailabilityLabelPipe implements PipeTransform {
  transform(value: Availability | null | undefined): string {
    return value ? LABELS[value] : '';
  }
}
