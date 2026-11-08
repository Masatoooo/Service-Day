import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormControl, NonNullableFormBuilder, Validators } from '@angular/forms';
import { format } from 'date-fns';
import { combineLatest, debounceTime, finalize, map, startWith, switchMap } from 'rxjs';
import { ReminderSettings } from '../../../../core/models';
import { ClockService } from '../../../../core/services/clock-service';
import { ReminderSettingsService } from '../../../../core/services/reminder-settings-service';
import { ToastService } from '../../../../core/services/toast-service';

const MAX_OFFSET = 30;

/**
 * Reminder schedule (UC5): enable, days-before chips, send time, last-slots threshold.
 * Saves with PUT /reminderSettings; the preview re-computes from the unsaved values.
 */
@Component({
  selector: 'app-schedule-tab',
  standalone: false,
  templateUrl: './schedule-tab.html',
  styleUrl: './schedule-tab.css',
})
export class ScheduleTab {
  private readonly settings = inject(ReminderSettingsService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly saving = signal(false);
  protected readonly offsets = signal<number[]>([]);
  protected readonly offsetError = signal<string | null>(null);
  protected readonly offsetsChanged = signal(false);
  protected readonly now = inject(ClockService).now();
  protected readonly maxOffset = MAX_OFFSET;

  protected readonly form = this.fb.group({
    enabled: [true],
    sendTime: ['09:00', Validators.required],
    lastSlotsThreshold: [2, [Validators.required, Validators.min(0), Validators.max(20)]],
  });
  protected readonly newOffset = new FormControl<number | null>(null);

  /** Live preview of the next reminders for the values on screen (debounced). */
  protected readonly preview$ = combineLatest([this.form.valueChanges.pipe(startWith(null)), toObservable(this.offsets)]).pipe(
    debounceTime(250),
    switchMap(() => this.settings.upcoming(8, this.current())),
    map((items) => items.map((r) => ({ ...r, when: format(r.sendAt, 'EEE d MMM, HH:mm') }))),
  );

  constructor() {
    this.load();
  }

  /** Reads the saved schedule; on failure the tab shows an error with Retry (ErrorInterceptor shows the toast). */
  protected load(): void {
    this.loadError.set(false);
    this.settings
      .get()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (saved) => {
          this.form.reset({ enabled: saved.enabled, sendTime: saved.sendTime, lastSlotsThreshold: saved.lastSlotsThreshold });
          this.offsets.set([...saved.offsetsDays].sort((a, b) => b - a));
          this.loading.set(false);
        },
        error: () => this.loadError.set(true),
      });
  }

  protected addOffset(): void {
    const days = Number(this.newOffset.value);
    if (!Number.isInteger(days) || days < 1 || days > MAX_OFFSET) {
      this.offsetError.set(`Enter a whole number of days from 1 to ${MAX_OFFSET}.`);
    } else if (this.offsets().includes(days)) {
      this.offsetError.set(`There is already a reminder ${days} ${days === 1 ? 'day' : 'days'} before.`);
    } else {
      this.offsets.set([...this.offsets(), days].sort((a, b) => b - a));
      this.offsetsChanged.set(true);
      this.newOffset.reset();
      this.offsetError.set(null);
    }
  }

  protected removeOffset(days: number): void {
    if (this.offsets().length === 1) {
      this.offsetError.set('Keep at least one reminder, or switch reminders off.');
      return;
    }
    this.offsets.set(this.offsets().filter((d) => d !== days));
    this.offsetsChanged.set(true);
    this.offsetError.set(null);
  }

  protected save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.settings
      .save(this.current())
      .pipe(finalize(() => this.saving.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.form.markAsPristine();
        this.offsetsChanged.set(false);
        this.toast.success('Reminder schedule saved. The preview shows what goes out next.');
      });
  }

  private current(): ReminderSettings {
    const value = this.form.getRawValue();
    return { ...value, lastSlotsThreshold: Number(value.lastSlotsThreshold), offsetsDays: this.offsets() };
  }
}
