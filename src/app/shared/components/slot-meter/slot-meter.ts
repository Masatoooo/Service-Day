import { Component, computed, input } from '@angular/core';

/** Up to this many slots, every slot gets its own segment; above it the bar is continuous. */
const MAX_SEGMENTS = 20;

/**
 * Signature slot meter (PLAN §8.5): a thin segmented bar + "3 of 12 left".
 * Last slots turn warning, full turns danger. Pure presentation of two numbers.
 */
@Component({
  selector: 'app-slot-meter',
  standalone: false,
  templateUrl: './slot-meter.html',
  styleUrl: './slot-meter.css',
})
export class SlotMeter {
  readonly taken = input.required<number>();
  readonly capacity = input.required<number>();
  /** Remaining slots at or below this count show as "last slots" (ReminderSettings default 2). */
  readonly threshold = input(2);

  protected readonly remaining = computed(() => Math.max(this.capacity() - this.taken(), 0));
  protected readonly segmented = computed(() => this.capacity() <= MAX_SEGMENTS);
  protected readonly segments = computed(() =>
    Array.from({ length: this.capacity() }, (_, i) => i < this.taken()),
  );
  protected readonly percent = computed(() =>
    this.capacity() ? Math.min((this.taken() / this.capacity()) * 100, 100) : 0,
  );
  protected readonly tone = computed(() => {
    if (this.remaining() === 0) return 'full';
    return this.remaining() <= this.threshold() ? 'low' : 'ok';
  });
  protected readonly text = computed(() =>
    this.remaining() === 0
      ? `Full · ${this.capacity()} of ${this.capacity()} taken`
      : `${this.remaining()} of ${this.capacity()} left`,
  );
}
