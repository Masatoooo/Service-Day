import { Component, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map } from 'rxjs';
import { NotificationType } from '../../../../core/models';
import { NotificationService } from '../../../../core/services/notification-service';
import { PillOption } from '../../../../shared/components/pill-filter/pill-filter';
import { AUDIENCE_LABEL, NOTICE_TYPE_LABEL } from '../../../../shared/notice-meta';

/**
 * History (UC5): every original notice (system and admin), newest first, with how
 * many people it reached and who sent it. Per-user copies of a broadcast are folded
 * into their original. Live: re-polls every 15 s and after each send.
 */
@Component({
  selector: 'app-history-tab',
  standalone: false,
  templateUrl: './history-tab.html',
  styleUrl: './history-tab.css',
})
export class HistoryTab {
  private readonly notifications = inject(NotificationService);
  protected readonly audienceLabel = AUDIENCE_LABEL;
  protected readonly type = signal<NotificationType | null>(null);
  protected readonly loadFailed$ = this.notifications.loadFailed$;

  protected readonly vm$ = combineLatest([this.notifications.historyLive$(), toObservable(this.type)]).pipe(
    map(([rows, type]) => {
      const counts = new Map<NotificationType, number>();
      rows.forEach((row) => counts.set(row.notice.type, (counts.get(row.notice.type) ?? 0) + 1));
      const filters: PillOption[] = [...counts.entries()].map(([value, count]) => ({ value, label: NOTICE_TYPE_LABEL[value], count }));
      return { total: rows.length, rows: type ? rows.filter((row) => row.notice.type === type) : rows, filters, now: new Date() };
    }),
  );

  protected setType(value: string | null): void {
    this.type.set(value as NotificationType | null);
  }
}
