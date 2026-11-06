import { Component, computed, input, output } from '@angular/core';
import { Session } from '../../core/models';
import { InboxItem } from '../../core/services/notification-service';

/**
 * Top bar card: page greeting/title on the left; notifications and the
 * profile chip on the right. Below 900px it also shows the menu button.
 */
@Component({
  selector: 'app-topbar',
  standalone: false,
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  readonly heading = input.required<string>();
  readonly subheading = input<string>();
  readonly session = input.required<Session>();
  readonly inboxPath = input.required<string>();
  readonly unreadCount = input(0);
  /** Latest notices for the bell dropdown (employees); null = the bell is a plain link. */
  readonly notices = input<InboxItem[] | null>(null);
  readonly now = input<Date>(new Date());
  readonly markAllRead = output<void>();
  readonly menuOpen = input(false);
  readonly menuToggle = output<void>();

  protected readonly roleLabel = computed(() =>
    this.session().role === 'admin' ? 'Admin' : this.session().department,
  );
}
