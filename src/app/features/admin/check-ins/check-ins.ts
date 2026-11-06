import { Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { format, isSameDay } from 'date-fns';
import { EMPTY, combineLatest, distinctUntilChanged, finalize, map, of, switchMap } from 'rxjs';
import { activityStart } from '../../../core/rules';
import { ActivityService } from '../../../core/services/activity-service';
import { ArrivalsView, CheckInService } from '../../../core/services/check-in-service';
import { ClockService } from '../../../core/services/clock-service';
import { ToastService } from '../../../core/services/toast-service';
import { checkInOptions, defaultOption } from './check-in-options';
import { downloadCsv, downloadQrPoster, slug } from './downloads';

/**
 * Check-ins (/admin/check-ins, UC6). Controller: picks the activity (URL ?activity=),
 * shows its QR code and live arrivals (CheckInService polls every 5 s), and runs
 * generate / regenerate, PNG download and CSV export.
 */
@Component({
  selector: 'app-check-ins',
  standalone: false,
  templateUrl: './check-ins.html',
  styleUrl: './check-ins.css',
})
export class CheckIns {
  private readonly checkIns = inject(CheckInService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly clock = inject(ClockService);

  /** Colours for the QR code: the darkest ink on white, read from the tokens. */
  protected readonly qrDark = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
  protected readonly qrLight = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim();
  protected readonly busy = signal(false);
  protected readonly confirmOpen = signal(false);
  protected readonly loadFailed$ = this.checkIns.loadFailed$;

  protected readonly options$ = inject(ActivityService)
    .liveWithTime$()
    .pipe(map(({ views, now }) => checkInOptions(views, now)));

  private readonly requested = toSignal(this.route.queryParamMap.pipe(map((p) => p.get('activity'))));
  protected readonly selectedId = toSignal(
    combineLatest([this.options$, toObservable(this.requested)]).pipe(
      map(([options, requested]) => defaultOption(options, requested ?? null)),
      distinctUntilChanged(),
    ),
  );

  protected readonly vm$ = toObservable(this.selectedId).pipe(
    switchMap((id) => (id ? this.checkIns.arrivals$(id) : id === null ? of(null) : EMPTY)),
    map(
      (view) =>
        view && {
          ...view,
          rows: view.rows.map((row) => ({ ...row, time: row.checkedInAt ? format(new Date(row.checkedInAt), 'HH:mm') : null })),
          url: view.activity.checkInCode ? this.checkIns.checkInUrl(view.activity.checkInCode) : null,
          when: this.when(view),
          today: isSameDay(activityStart(view.activity), this.clock.now()),
        },
    ),
  );

  protected select(id: string): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { activity: id } });
  }

  protected inputValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }

  /** Generate (no code yet) or regenerate (after the confirm step): the old code stops working. */
  protected generate(view: ArrivalsView): void {
    this.busy.set(true);
    this.checkIns
      .generateCode(view.activity.id)
      .pipe(
        finalize(() => {
          this.busy.set(false);
          this.confirmOpen.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((code) => this.toast.success(`New check-in code for ${view.activity.title}: ${code}.${view.activity.checkInCode ? ' The old code no longer works.' : ''}`));
  }

  protected copyLink(url: string): void {
    navigator.clipboard
      .writeText(url)
      .then(() => this.toast.success('Check-in link copied.'))
      .catch(() => this.toast.error("Couldn't copy the link. Select it and copy it by hand."));
  }

  protected downloadPng(view: ArrivalsView & { when: string }): void {
    const canvas = this.host.nativeElement.querySelector<HTMLCanvasElement>('.qr canvas');
    if (!canvas || !view.activity.checkInCode) return;
    downloadQrPoster(canvas, { title: view.activity.title, when: view.when, code: view.activity.checkInCode }, `check-in-${slug(view.activity.title)}.png`);
  }

  protected exportCsv(view: ArrivalsView): void {
    downloadCsv(this.checkIns.toCsv(view), `attendance-${slug(view.activity.title)}-${view.activity.date}.csv`);
    this.toast.success(`Attendance for ${view.activity.title} downloaded (${view.expected} rows).`);
  }

  protected closeConfirm(open: boolean): void {
    if (!open && !this.busy()) this.confirmOpen.set(false);
  }

  private when(view: ArrivalsView): string {
    return `${format(activityStart(view.activity), 'EEEE d MMMM')} · ${view.activity.startTime}–${view.activity.endTime}`;
  }
}
