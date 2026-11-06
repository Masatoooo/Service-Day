import { Component, computed, input } from '@angular/core';

/**
 * Loading placeholder shaped like the content it replaces.
 * Hidden from screen readers; the container it sits in sets aria-busy.
 */
@Component({
  selector: 'app-skeleton',
  standalone: false,
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.css',
  host: { 'aria-hidden': 'true' },
})
export class Skeleton {
  readonly shape = input<'text' | 'block' | 'circle'>('text');
  /** Number of text lines; the last one is shorter, like a real paragraph. */
  readonly lines = input(1);
  /** CSS length for block/circle, e.g. '100%' or '120px'. */
  readonly width = input('100%');
  readonly height = input('96px');

  protected readonly lineList = computed(() => Array.from({ length: this.lines() }, (_, i) => i));
}
