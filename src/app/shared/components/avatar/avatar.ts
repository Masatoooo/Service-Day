import { Component, computed, input } from '@angular/core';

const TINT_COUNT = 6;

/**
 * Initials avatar on a soft tint (PLAN §8.5). The tint is chosen
 * deterministically from `seed` (e.g. the NGO id), so the same NGO always
 * gets the same colour and cards stay distinguishable without stock images.
 */
@Component({
  selector: 'app-avatar',
  standalone: false,
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
})
export class Avatar {
  readonly name = input.required<string>();
  /** Stable id used to pick the tint; falls back to the name. */
  readonly seed = input<string>();
  /** 'tile' (rounded square) for organisations, 'circle' for people. */
  readonly shape = input<'circle' | 'tile'>('circle');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  /** Decorative when the name is printed next to it (the usual case). */
  readonly decorative = input(true);

  protected readonly tint = computed(() => {
    const key = this.seed() ?? this.name();
    let sum = 0;
    for (const char of key) {
      sum += char.charCodeAt(0);
    }
    return (sum % TINT_COUNT) + 1;
  });
}
