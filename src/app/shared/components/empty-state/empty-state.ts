import { Component, input } from '@angular/core';

/**
 * Empty state that teaches the next step: what is missing and what to do.
 * Actions (buttons/links) are projected as content.
 */
@Component({
  selector: 'app-empty-state',
  standalone: false,
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyState {
  readonly heading = input.required<string>();
  readonly message = input.required<string>();
  /** Lucide icon name registered in SharedModule. */
  readonly icon = input('inbox');
}
