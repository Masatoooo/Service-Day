import { NgModule, Optional, SkipSelf } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ErrorInterceptor } from './interceptors/error-interceptor';
import { LatencyInterceptor } from './interceptors/latency-interceptor';

/**
 * CoreModule — app-wide singletons (HttpClient, services, guards, interceptors).
 * Imported exactly once, by AppModule.
 *
 * Modules: `withInterceptorsFromDi()` lets class-based interceptors registered with
 * the HTTP_INTERCEPTORS token run on every HttpClient request. They run in the order
 * listed: ErrorInterceptor is outermost, so it also sees failures after the delay.
 * Services use `providedIn: 'root'`, so they are singletons without being listed here.
 * AuthInterceptor exists for Assignment 2 and is intentionally not registered.
 */
@NgModule({
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LatencyInterceptor, multi: true },
  ],
})
export class CoreModule {
  // Re-import guard: a second CoreModule would create duplicate singletons.
  constructor(@Optional() @SkipSelf() parentModule?: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it only in AppModule.');
    }
  }
}
