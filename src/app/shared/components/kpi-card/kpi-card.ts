import { Component, input } from '@angular/core';

export type KpiTone = 'accent' | 'success' | 'warning' | 'info';

/**
 * One key number with its label and an icon tile (PLAN §8.4 KPI row).
 * A footnote (delta, context) is projected as content.
 */
@Component({
  selector: 'app-kpi-card',
  standalone: false,
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.css',
})
export class KpiCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  /** Optional unit shown smaller after the value, e.g. "%" or "days". */
  readonly unit = input<string>();
  /** Lucide icon name registered in SharedModule, e.g. 'ticket'. */
  readonly icon = input<string>();
  readonly tone = input<KpiTone>('accent');
  /** Secondary KPIs (e.g. under a hero card): smaller number and padding. */
  readonly compact = input(false);
}
