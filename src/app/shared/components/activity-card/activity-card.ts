import { Component, input } from '@angular/core';
import { ActivityView } from '../../../core/models';

/**
 * One activity in a list: NGO, status, title (the link), when and where,
 * slot meter and cut-off label. The whole card is clickable through the title link.
 */
@Component({
  selector: 'app-activity-card',
  standalone: false,
  templateUrl: './activity-card.html',
  styleUrl: './activity-card.css',
})
export class ActivityCard {
  readonly activity = input.required<ActivityView>();
  /** Time used for the cut-off label (the live snapshot's `now`). */
  readonly now = input.required<Date>();
  readonly link = input.required<string | (string | number)[]>();
}
