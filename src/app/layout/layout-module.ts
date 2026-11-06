import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { AppShell } from './app-shell/app-shell';
import { NotFound } from './not-found/not-found';
import { Sidebar } from './sidebar/sidebar';
import { Topbar } from './topbar/topbar';

/**
 * LayoutModule — the app frame: shell, sidebar, top bar, not-found page.
 * Sidebar and Topbar are internal. The routed AreaShell lives in its own
 * AreaShellModule so it can be lazy-loaded with the employee and admin areas.
 */
@NgModule({
  declarations: [AppShell, Sidebar, Topbar, NotFound],
  imports: [SharedModule],
  exports: [AppShell, NotFound],
})
export class LayoutModule {}
