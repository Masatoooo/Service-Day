import { NgModule, Optional, SkipSelf } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

/**
 * CoreModule — app-wide singletons (HttpClient, services, guards, interceptors).
 * Imported exactly once, by AppModule.
 *
 * Modules: `withInterceptorsFromDi()` keeps class-based interceptors registered with
 * the HTTP_INTERCEPTORS token working (LatencyInterceptor, ErrorInterceptor in Phase 2).
 * Services use `providedIn: 'root'`, so they are singletons without being listed here.
 */
@NgModule({
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class CoreModule {
  // Re-import guard: a second CoreModule would create duplicate singletons.
  constructor(@Optional() @SkipSelf() parentModule?: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it only in AppModule.');
    }
  }
}
