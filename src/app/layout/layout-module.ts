import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { AppShell } from './app-shell/app-shell';
import { AreaShell } from './area-shell/area-shell';
import { NotFound } from './not-found/not-found';
import { Sidebar } from './sidebar/sidebar';
import { Topbar } from './topbar/topbar';

/**
 * LayoutModule — the app frame: shell, sidebar, top bar, not-found page.
 * AreaShell is the routed parent of the employee and admin areas (it wraps
 * AppShell around <router-outlet>). Sidebar and Topbar are internal.
 */
@NgModule({
  declarations: [AppShell, AreaShell, Sidebar, Topbar, NotFound],
  imports: [SharedModule],
  exports: [AppShell, AreaShell, NotFound],
})
export class LayoutModule {}
