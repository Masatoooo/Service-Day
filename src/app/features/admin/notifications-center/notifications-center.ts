import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { TabItem } from '../../../shared/components/tabs/tabs';

type TabId = 'schedule' | 'broadcast' | 'history';
const TAB_IDS: TabId[] = ['schedule', 'broadcast', 'history'];

/**
 * Notification centre (/admin/notifications, UC5): three tabs. The selected tab
 * lives in the URL (?tab=), so links like "Notify participants" open the right one.
 */
@Component({
  selector: 'app-notifications-center',
  standalone: false,
  templateUrl: './notifications-center.html',
  styleUrl: './notifications-center.css',
})
export class NotificationsCenter {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly tabs: TabItem[] = [
    { id: 'schedule', label: 'Schedule' },
    { id: 'broadcast', label: 'Broadcast' },
    { id: 'history', label: 'History' },
  ];

  private readonly tabParam = toSignal(this.route.queryParamMap.pipe(map((params) => params.get('tab'))));
  protected readonly tab = computed<TabId>(() => {
    const id = this.tabParam() as TabId;
    return TAB_IDS.includes(id) ? id : 'schedule';
  });

  /** Switching tabs drops any prefill parameters from the previous link. */
  protected select(id: string): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { tab: id } });
  }
}
