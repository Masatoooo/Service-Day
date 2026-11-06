import { Component, input, model } from '@angular/core';

let nextId = 0;

/**
 * Pill-shaped search input with a visually hidden label and a clear button.
 * Two-way bindable: <app-search-field [(value)]="query" label="Search activities" />
 */
@Component({
  selector: 'app-search-field',
  standalone: false,
  templateUrl: './search-field.html',
  styleUrl: './search-field.css',
})
export class SearchField {
  readonly label = input.required<string>();
  readonly placeholder = input('Search');
  readonly value = model('');

  protected readonly inputId = `search-field-${nextId++}`;

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
