import { Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core';
import { InboxItem } from '../../core/services/notification-service';
import { placeUnder } from '../../shared/popover-position';

/**
 * Top-bar bell. Employees: a button with an unread badge that opens the latest
 * notices (native popover: Esc / click outside close it). Admins have no inbox,
 * so for them it is a link to the notification centre (`items` is null).
 */
@Component({
  selector: 'app-notification-bell',
  standalone: false,
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.css',
})
export class NotificationBell {
  readonly inboxPath = input.required<string>();
  readonly unreadCount = input(0);
  /** Latest notices for the dropdown; null = link mode. */
  readonly items = input<InboxItem[] | null>(null);
  readonly now = input<Date>(new Date());
  readonly markAllRead = output<void>();

  protected readonly panelId = 'notification-panel';
  protected readonly isOpen = signal(false);
  protected readonly label = computed(() =>
    this.unreadCount() > 0 ? `Notifications, ${this.unreadCount()} unread` : 'Notifications',
  );
  /** Badge text: exact up to 9. */
  protected readonly badge = computed(() => (this.unreadCount() > 9 ? '9+' : String(this.unreadCount())));
  private readonly trigger = viewChild<ElementRef<HTMLElement>>('trigger');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  protected onToggle(event: Event): void {
    const open = (event as ToggleEvent).newState === 'open';
    this.isOpen.set(open);
    const trigger = this.trigger()?.nativeElement;
    const panel = this.panel()?.nativeElement;
    if (open && trigger && panel) {
      placeUnder(trigger, panel, 8);
      panel.querySelector<HTMLElement>('a, button')?.focus();
    }
  }

  protected close(): void {
    this.panel()?.nativeElement.hidePopover();
  }
}
