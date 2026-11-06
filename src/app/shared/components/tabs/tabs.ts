import { Component, ElementRef, inject, input, model } from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

/**
 * Accessible tab list (WAI-ARIA tabs pattern): arrow keys move between tabs.
 * The parent renders the panel with id `${idPrefix}-panel-${selected}` and
 * aria-labelledby `${idPrefix}-tab-${selected}`.
 */
@Component({
  selector: 'app-tabs',
  standalone: false,
  templateUrl: './tabs.html',
  styleUrl: './tabs.css',
})
export class Tabs {
  readonly tabs = input.required<TabItem[]>();
  readonly label = input.required<string>();
  readonly idPrefix = input.required<string>();
  readonly selected = model.required<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected onKeydown(event: KeyboardEvent): void {
    const ids = this.tabs().map((tab) => tab.id);
    const current = ids.indexOf(this.selected());
    const next = {
      ArrowRight: (current + 1) % ids.length,
      ArrowLeft: (current - 1 + ids.length) % ids.length,
      Home: 0,
      End: ids.length - 1,
    }[event.key];
    if (next === undefined) {
      return;
    }
    event.preventDefault();
    this.selected.set(ids[next]);
    this.host.nativeElement.querySelector<HTMLElement>(`#${this.idPrefix()}-tab-${ids[next]}`)?.focus();
  }
}
