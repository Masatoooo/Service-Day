import { Component, computed, input } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { FillByNgoDataset } from '../../../../core/services/participation-stats-service';

/** Reads a design token (CSS custom property) so the chart uses the same colours as the CSS. */
function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * "Fill by NGO" (UC4): one horizontal bar per NGO. The capacity bar is a quiet
 * track (--hairline) and the taken bar is drawn over it in --accent, so
 * each row reads like a fill gauge. chart.js via ng2-charts (PLAN §8.7).
 */
@Component({
  selector: 'app-fill-chart',
  standalone: false,
  templateUrl: './fill-chart.html',
  styleUrl: './fill-chart.css',
})
export class FillChart {
  readonly dataset = input.required<FillByNgoDataset>();

  private readonly colors = {
    taken: token('--accent'),
    // --hairline, not --surface-sunken: the sunken tint is almost invisible on a white card.
    capacity: token('--hairline'),
    grid: token('--hairline'),
    text: token('--ink-muted'),
    font: token('--font-sans') || 'system-ui',
  };
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Room for every NGO row (the canvas fills this height). */
  protected readonly height = computed(() => Math.max(this.dataset().labels.length, 1) * 48 + 32);

  protected readonly data = computed<ChartConfiguration<'bar'>['data']>(() => ({
    labels: this.dataset().labels,
    datasets: [
      // order: the higher number is drawn first, so "Taken" sits on top of "Capacity".
      { label: 'Taken', data: this.dataset().taken, backgroundColor: this.colors.taken, order: 1 },
      { label: 'Capacity', data: this.dataset().capacity, backgroundColor: this.colors.capacity, order: 2 },
    ],
  }));

  protected readonly options: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: this.reducedMotion ? false : { duration: 400 },
    datasets: { bar: { grouped: false, barThickness: 14, borderRadius: 7, borderSkipped: false } },
    scales: {
      x: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: this.colors.grid },
        ticks: { color: this.colors.text, font: { family: this.colors.font, size: 12 }, precision: 0 },
      },
      y: {
        border: { display: false },
        grid: { display: false },
        ticks: {
          color: this.colors.text,
          font: { family: this.colors.font, size: 13 },
          // Narrow cards (phones): shorten long NGO names; the tooltip and the table keep the full name.
          callback(value) {
            const label = this.getLabelForValue(Number(value));
            const max = this.chart.width < 480 ? 16 : 40;
            return label.length > max ? `${label.slice(0, max - 1).trimEnd()}…` : label;
          },
        },
      },
    },
    plugins: {
      legend: { display: false }, // the HTML legend in the card header replaces it
      tooltip: {
        callbacks: {
          label: (item) => {
            const i = item.dataIndex;
            return ` ${this.dataset().taken[i]} of ${this.dataset().capacity[i]} places taken`;
          },
        },
        filter: (item) => item.datasetIndex === 0,
      },
    },
  };
}
