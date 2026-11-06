import { Component, input, model } from '@angular/core';

export interface PillOption {
  value: string;
  label: string;
  /** Optional count shown after the label, e.g. matching activities. */
  count?: number;
}

/**
 * A row of toggle pills where one (or none) is selected.
 * Two-way bindable: <app-pill-filter [(selected)]="type" [options]="types" label="Service type" />
 */
@Component({
  selector: 'app-pill-filter',
  standalone: false,
  templateUrl: './pill-filter.html',
  styleUrl: './pill-filter.css',
})
export class PillFilter {
  readonly options = input.required<PillOption[]>();
  /** Accessible name of the group. */
  readonly label = input.required<string>();
  /** When true, clicking the selected pill clears the selection. */
  readonly allowNone = input(true);
  readonly selected = model<string | null>(null);

  protected select(value: string): void {
    const clear = this.allowNone() && this.selected() === value;
    this.selected.set(clear ? null : value);
  }
}
