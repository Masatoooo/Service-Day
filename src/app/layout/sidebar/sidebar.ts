import { Component, input, output } from '@angular/core';
import { NavItem } from '../nav-config';

/**
 * Sidebar content: wordmark, main navigation, help and sign out.
 * Used twice by AppShell: in the desktop <aside> and inside the mobile drawer.
 */
@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  readonly items = input.required<readonly NavItem[]>();
  readonly homePath = input.required<string>();
  /** Styleguide only: mark this path as active without navigating to it. */
  readonly previewActivePath = input<string>();
  /** Fired on any link click, so the mobile drawer can close itself. */
  readonly navigate = output<void>();
  readonly help = output<void>();
  readonly signOut = output<void>();
}
