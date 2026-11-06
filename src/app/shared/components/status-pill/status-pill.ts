import { Component, computed, input } from '@angular/core';
import { Availability } from '../../../core/models';

export type PillTone = 'success' | 'warning' | 'danger' | 'danger-outline' | 'neutral' | 'info' | 'accent';

/** Status pill mapping from PLAN §8.1. */
const TONE_BY_AVAILABILITY: Record<Availability, PillTone> = {
  open: 'success',
  'last-slots': 'warning',
  'closing-soon': 'warning',
  full: 'danger',
  closed: 'neutral',
  cancelled: 'danger-outline',
  draft: 'info',
};

/**
 * Small status label. Pass an `availability` for activities, or a free
 * `label` + `tone` for other statuses (e.g. "Switched", "Late").
 */
@Component({
  selector: 'app-status-pill',
  standalone: false,
  templateUrl: './status-pill.html',
  styleUrl: './status-pill.css',
})
export class StatusPill {
  readonly availability = input<Availability>();
  readonly label = input<string>();
  readonly tone = input<PillTone>();

  protected readonly resolvedTone = computed<PillTone>(() => {
    const availability = this.availability();
    return this.tone() ?? (availability ? TONE_BY_AVAILABILITY[availability] : 'neutral');
  });
}
