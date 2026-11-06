import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { AppShell } from './app-shell/app-shell';
import { NotFound } from './not-found/not-found';
import { NotificationBell } from './notification-bell/notification-bell';
import { Sidebar } from './sidebar/sidebar';
import { Topbar } from './topbar/topbar';

/**
 * LayoutModule — the app frame: shell, sidebar, top bar, notification bell, not-found page.
 * Sidebar, Topbar and NotificationBell are internal. The routed AreaShell lives in its own
 * AreaShellModule so it can be lazy-loaded with the employee and admin areas.
 */
@NgModule({
  declarations: [AppShell, Sidebar, Topbar, NotificationBell, NotFound],
  imports: [SharedModule],
  exports: [AppShell, NotFound],
})
export class LayoutModule {}
