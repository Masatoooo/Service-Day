import { Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { Session } from '../../core/models';
import { HOME_BY_ROLE, INBOX_BY_ROLE, NAV_BY_ROLE } from '../nav-config';

/** Must match the breakpoint in app-shell.css and topbar.css. */
const DESKTOP_QUERY = '(min-width: 900px)';

/**
 * App shell (PLAN §8.4): sidebar + main column (top bar, then page content).
 * The page is projected as content, so the shell works with <router-outlet>
 * and in the styleguide preview. The nav list is chosen by the session role.
 */
@Component({
  selector: 'app-shell',
  standalone: false,
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
  host: { '[class.is-preview]': 'preview()' },
})
export class AppShell {
  readonly session = input.required<Session>();
  readonly heading = input.required<string>();
  readonly subheading = input<string>();
  readonly unreadCount = input(0);
  /** Id of <main>, target of the skip link (must be unique on the page). */
  readonly contentId = input('main-content');
  /** Styleguide: fit inside a frame instead of filling the viewport. */
  readonly preview = input(false);
  /** Styleguide only: which nav item to show as active. */
  readonly previewActivePath = input<string>();
  readonly signOut = output<void>();

  protected readonly navItems = computed(() => NAV_BY_ROLE[this.session().role]);
  protected readonly homePath = computed(() => HOME_BY_ROLE[this.session().role]);
  protected readonly inboxPath = computed(() => INBOX_BY_ROLE[this.session().role]);
  protected readonly navOpen = signal(false);
  protected readonly helpOpen = signal(false);

  constructor() {
    // If the window grows past 900px while the mobile menu is open, close it.
    const desktop = window.matchMedia(DESKTOP_QUERY);
    fromEvent<MediaQueryListEvent>(desktop, 'change')
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((event) => event.matches && this.navOpen.set(false));
  }

  protected openHelp(): void {
    this.navOpen.set(false);
    this.helpOpen.set(true);
  }
}
