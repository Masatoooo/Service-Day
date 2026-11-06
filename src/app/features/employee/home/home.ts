import { Component, inject, signal } from '@angular/core';
import { NotificationType } from '../../../core/models';
import { ActivityService } from '../../../core/services/activity-service';
import { AuthService } from '../../../core/services/auth-service';
import { EmployeeHomeService } from '../../../core/services/employee-home-service';
import { ToastService } from '../../../core/services/toast-service';

/** One line icon per notice type (View concern only). */
const NOTICE_ICON: Record<NotificationType, string> = {
  registration: 'circle-check',
  switch: 'arrow-left-right',
  withdrawal: 'log-out',
  'activity-update': 'info',
  reminder: 'clock',
  broadcast: 'megaphone',
  'last-slots': 'hourglass',
};

/**
 * Employee home (/app). Controller: subscribes to the prepared home view
 * (EmployeeHomeService, live) and handles the withdraw confirmation.
 */
@Component({
  selector: 'app-employee-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class EmployeeHome {
  private readonly toast = inject(ToastService);
  protected readonly userId = inject(AuthService).session?.userId ?? '';
  protected readonly home$ = inject(EmployeeHomeService).home$(this.userId);
  protected readonly loadFailed$ = inject(ActivityService).loadFailed$;
  protected readonly noticeIcon = NOTICE_ICON;
  protected readonly withdrawOpen = signal(false);

  /** Phase 4: nothing is saved yet (Phase 5 connects withdraw). */
  protected confirmWithdraw(): void {
    this.withdrawOpen.set(false);
    this.toast.info('Nothing was saved: withdrawing is connected in the next build step.');
  }
}
