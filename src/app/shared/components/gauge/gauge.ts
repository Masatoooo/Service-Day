import { Component, computed, input } from '@angular/core';

/** Number of short bars that make up the half circle. */
const BAR_COUNT = 20;
/** SVG geometry (viewBox 240 × 136): centre, inner and outer radius of each bar. */
const CX = 120;
const CY = 124;
const INNER = 80;
const OUTER = 106;

interface Bar {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  filled: boolean;
}

/**
 * Participation gauge (PLAN §8.5): a semicircle built from short rounded bars.
 * The number of filled bars is proportional to `value` (0–100).
 * The geometry is presentation only, so it lives here and not in core/rules.
 */
@Component({
  selector: 'app-gauge',
  standalone: false,
  templateUrl: './gauge.html',
  styleUrl: './gauge.css',
})
export class Gauge {
  /** Percentage 0–100. */
  readonly value = input.required<number>();
  readonly label = input.required<string>();

  protected readonly clamped = computed(() => Math.round(Math.min(Math.max(this.value(), 0), 100)));

  protected readonly bars = computed<Bar[]>(() => {
    const filledCount = Math.round((this.clamped() / 100) * BAR_COUNT);
    return Array.from({ length: BAR_COUNT }, (_, i) => {
      // From the left end (180°) to the right end (0°).
      const angle = Math.PI - (i * Math.PI) / (BAR_COUNT - 1);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x1: CX + INNER * cos,
        y1: CY - INNER * sin,
        x2: CX + OUTER * cos,
        y2: CY - OUTER * sin,
        filled: i < filledCount,
      };
    });
  });
}
