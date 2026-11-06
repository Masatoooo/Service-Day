import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { AppShell } from './app-shell/app-shell';
import { NotFound } from './not-found/not-found';
import { Sidebar } from './sidebar/sidebar';
import { Topbar } from './topbar/topbar';

/**
 * LayoutModule — the app frame: shell, sidebar, top bar, not-found page.
 * Sidebar and Topbar are internal; features only use AppShell.
 */
@NgModule({
  declarations: [AppShell, Sidebar, Topbar, NotFound],
  imports: [SharedModule],
  exports: [AppShell, NotFound],
})
export class LayoutModule {}
