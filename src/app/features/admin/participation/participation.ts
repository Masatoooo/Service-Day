import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, finalize, map } from 'rxjs';
import { PublicUser } from '../../../core/models';
import { ActivityService } from '../../../core/services/activity-service';
import { AuthService } from '../../../core/services/auth-service';
import { NotificationService } from '../../../core/services/notification-service';
import { Kpis, ParticipationStatsService } from '../../../core/services/participation-stats-service';
import { ToastService } from '../../../core/services/toast-service';

const percent = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

/** The reminder an unregistered employee receives (specific numbers, one clear next step). */
function reminderCopy(kpis: Kpis): { title: string; message: string } {
  return {
    title: 'Pick your Service Day activity',
    message: `You haven't picked a Service Day activity yet. ${kpis.slotsRemaining} places are still open across ${kpis.openActivities} activities. Choose one in Opportunities before registration closes.`,
  };
}

/**
 * Participation (/admin/participation, UC4). Controller: shapes the live stats for
 * the distribution cards and tables, keeps the search + selection, and sends
 * reminders through NotificationService (one per-user reminder notice each).
 */
@Component({
  selector: 'app-participation',
  standalone: false,
  templateUrl: './participation.html',
  styleUrl: './participation.css',
})
export class Participation {
  private readonly notifications = inject(NotificationService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly adminId = inject(AuthService).session?.userId ?? '';

  protected readonly query = signal('');
  protected readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly selectedCount = computed(() => this.selected().size);
  protected readonly confirmOpen = signal(false);
  protected readonly busy = signal(false);
  protected readonly loadFailed$ = inject(ActivityService).loadFailed$;

  protected readonly vm$ = combineLatest([inject(ParticipationStatsService).overview$(), toObservable(this.query)]).pipe(
    map(([o, query]) => {
      const q = query.trim().toLowerCase();
      const shown = o.unregistered.filter((e) => !q || `${e.name} ${e.department} ${e.email}`.toLowerCase().includes(q));
      return {
        ...o,
        shown,
        byNgo: o.fillByNgo.labels.map((name, i) => ({
          name,
          taken: o.fillByNgo.taken[i],
          capacity: o.fillByNgo.capacity[i],
          percent: percent(o.fillByNgo.taken[i], o.fillByNgo.capacity[i]),
        })),
        utilisation: o.utilisation.map((view) => ({ view, percent: percent(view.taken, view.maxSlots) })),
      };
    }),
  );

  protected isSelected(id: string): boolean {
    return this.selected().has(id);
  }

  protected toggle(id: string): void {
    const next = new Set(this.selected());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selected.set(next);
  }

  /** Header checkbox: select every employee currently shown, or clear them. */
  protected toggleAll(shown: PublicUser[]): void {
    const allOn = shown.every((e) => this.selected().has(e.id));
    const next = new Set(this.selected());
    shown.forEach((e) => (allOn ? next.delete(e.id) : next.add(e.id)));
    this.selected.set(next);
  }

  protected allSelected(shown: PublicUser[]): boolean {
    return shown.length > 0 && shown.every((e) => this.selected().has(e.id));
  }

  /** Only people who are still unregistered get the reminder. */
  protected sendReminder(unregistered: PublicUser[], kpis: Kpis): void {
    if (this.busy()) return;
    const stillOpen = new Set(unregistered.map((e) => e.id));
    const recipientIds = [...this.selected()].filter((id) => stillOpen.has(id));
    this.busy.set(true);
    this.notifications
      .broadcast({ audience: 'unregistered', type: 'reminder', urgent: false, sentBy: this.adminId, recipientIds, ...reminderCopy(kpis) })
      .pipe(
        finalize(() => {
          this.busy.set(false);
          this.confirmOpen.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ recipientCount }) => {
        this.selected.set(new Set());
        this.toast.success(`Reminder sent to ${recipientCount === 1 ? '1 person' : recipientCount + ' people'}. It's in their notifications now.`);
      });
  }

  protected closeConfirm(open: boolean): void {
    if (!open && !this.busy()) this.confirmOpen.set(false);
  }
}
