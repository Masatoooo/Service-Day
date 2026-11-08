import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, combineLatest, finalize, map } from 'rxjs';
import { ActivityView, SERVICE_TYPES } from '../../../core/models';
import { RuleViolationError, canDeleteActivity } from '../../../core/rules';
import { ActivityAdminService } from '../../../core/services/activity-admin-service';
import { ActivityService } from '../../../core/services/activity-service';
import { AuthService } from '../../../core/services/auth-service';
import { ToastService } from '../../../core/services/toast-service';
import { AdminActivityFilters, NO_FILTERS, filterAdminActivities, isFiltered } from './admin-activity-filters';
import { PendingAction, dialogFor, rowMenu } from './row-actions';

/**
 * Admin activities table (UC1). Controller: filters the live list and runs row
 * actions through ActivityAdminService; destructive ones go through a confirm dialog.
 */
@Component({
  selector: 'app-activities-list',
  standalone: false,
  templateUrl: './activities-list.html',
  styleUrl: './activities-list.css',
})
export class ActivitiesList {
  private readonly admin = inject(ActivityAdminService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly adminId = inject(AuthService).session?.userId ?? '';
  private readonly activities = inject(ActivityService);

  protected readonly serviceTypes = SERVICE_TYPES;
  /** Filter state as a stream (BehaviorSubject keeps the latest value for new subscribers). */
  private readonly filters$ = new BehaviorSubject<AdminActivityFilters>(NO_FILTERS);
  protected readonly pending = signal<PendingAction | null>(null);
  protected readonly busy = signal(false);
  protected readonly loadFailed$ = this.activities.loadFailed$;

  protected readonly vm$ = combineLatest([this.activities.liveWithTime$(), this.filters$]).pipe(
    map(([{ views, now }, filters]) => ({
      now,
      filters,
      filtered: isFiltered(filters),
      total: views.length,
      rows: filterAdminActivities(views, filters).map((view) => ({ view, menu: rowMenu(view) })),
      ngos: [...new Map(views.map((v) => [v.ngoId, v.ngo])).values()].sort((a, b) => a.name.localeCompare(b.name)),
    })),
  );

  protected setFilter(key: keyof AdminActivityFilters, value: string): void {
    this.filters$.next({ ...this.filters$.value, [key]: value });
  }

  protected clearFilters(): void {
    this.filters$.next(NO_FILTERS);
  }

  protected inputValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected publish(view: ActivityView): void {
    this.runAction(this.admin.setStatus(view, 'published'), `Published ${view.title}. Employees will see it within 10 seconds.`);
  }

  private unpublish(view: ActivityView): void {
    this.runAction(this.admin.setStatus(view, 'draft'), `${view.title} is a draft again and hidden from employees.`);
  }

  protected onMenu(view: ActivityView, action: string): void {
    if (action === 'unpublish') this.unpublish(view);
    if (action === 'cancel') this.pending.set({ kind: 'cancel', view });
    if (action === 'delete') this.askDelete(view);
  }

  protected askDelete(view: ActivityView): void {
    const result = canDeleteActivity(view.taken, view.status);
    this.pending.set(result.ok ? { kind: 'delete', view } : { kind: 'blocked', view, reason: result.reason });
  }

  protected readonly dialogFor = dialogFor;

  protected confirm(p: PendingAction): void {
    if (p.kind === 'delete') {
      this.runAction(this.admin.remove(p.view), `Deleted ${p.view.title}.`);
    } else if (p.kind === 'cancel' || p.view.status !== 'cancelled') {
      this.runAction(this.admin.cancel(p.view, this.adminId), `Cancelled ${p.view.title}. Everyone registered has been notified.`);
    } else {
      this.pending.set(null);
    }
  }

  protected closeDialog(open: boolean): void {
    if (!open && !this.busy()) this.pending.set(null);
  }

  private runAction(action$: Observable<unknown>, success: string): void {
    if (this.busy()) return; // one action at a time (also stops double clicks)
    this.busy.set(true);
    action$
      .pipe(
        finalize(() => {
          this.busy.set(false);
          this.pending.set(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.toast.success(success),
        error: (error: unknown) => error instanceof RuleViolationError && this.toast.error(error.message),
      });
  }
}
