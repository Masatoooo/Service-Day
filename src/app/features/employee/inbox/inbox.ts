import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Observable, combineLatest, finalize, map } from 'rxjs';
import { AuthService } from '../../../core/services/auth-service';
import { InboxItem, NotificationService } from '../../../core/services/notification-service';
import { ToastService } from '../../../core/services/toast-service';
import { PillOption } from '../../../shared/components/pill-filter/pill-filter';

type Show = 'all' | 'unread';

/**
 * Employee inbox (/app/inbox, UC5). Controller: reads the shared live inbox
 * (polls every 15 s), filters all / unread, and delegates mark-as-read to NotificationService.
 */
@Component({
  selector: 'app-inbox',
  standalone: false,
  templateUrl: './inbox.html',
  styleUrl: './inbox.css',
})
export class Inbox {
  private readonly notifications = inject(NotificationService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly userId = inject(AuthService).session?.userId ?? '';

  protected readonly show = signal<Show>('all');
  protected readonly busy = signal(false);
  protected readonly loadFailed$ = this.notifications.loadFailed$;

  protected readonly vm$ = combineLatest([this.notifications.inboxView$(this.userId), toObservable(this.show)]).pipe(
    map(([view, show]) => ({
      ...view,
      show,
      total: view.items.length,
      shown: show === 'unread' ? view.items.filter((item) => item.unread) : view.items,
      filters: [
        { value: 'all', label: 'All', count: view.items.length },
        { value: 'unread', label: 'Unread', count: view.unread },
      ] satisfies PillOption[],
    })),
  );

  protected setShow(value: string | null): void {
    this.show.set(value === 'unread' ? 'unread' : 'all');
  }

  protected markRead(item: InboxItem): void {
    this.run(this.notifications.markRead(item.notice, this.userId));
  }

  protected markAllRead(): void {
    this.run(this.notifications.markAllRead(this.userId), (count) =>
      this.toast.success(count === 1 ? 'Marked 1 notice as read.' : `Marked ${count} notices as read.`),
    );
  }

  private run<T>(action$: Observable<T>, done?: (result: T) => void): void {
    this.busy.set(true);
    action$
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => done?.(result));
  }
}
