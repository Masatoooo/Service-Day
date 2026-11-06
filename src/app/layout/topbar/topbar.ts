import { Component, computed, input, output } from '@angular/core';
import { Session } from '../../core/models';

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
  readonly menuOpen = input(false);
  readonly menuToggle = output<void>();

  protected readonly roleLabel = computed(() =>
    this.session().role === 'admin' ? 'Admin' : this.session().department,
  );
  protected readonly bellLabel = computed(() =>
    this.unreadCount() > 0 ? `Notifications, ${this.unreadCount()} unread` : 'Notifications',
  );
}
