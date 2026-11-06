import { NgModule, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { App } from './app';
import { AppRoutingModule } from './app-routing-module';
import { CoreModule } from './core/core-module';
import { LayoutModule } from './layout/layout-module';
import { SharedModule } from './shared/shared-module';

/**
 * AppModule — the root module. CoreModule (singletons) is imported once here;
 * LayoutModule provides the app frame; SharedModule supplies the toast stack.
 * Feature modules are lazy-loaded by AppRoutingModule.
 */
@NgModule({
  declarations: [App],
  imports: [BrowserModule, CoreModule, SharedModule, LayoutModule, AppRoutingModule],
  providers: [provideBrowserGlobalErrorListeners(), provideZoneChangeDetection({ eventCoalescing: true })],
  bootstrap: [App],
})
export class AppModule {}
