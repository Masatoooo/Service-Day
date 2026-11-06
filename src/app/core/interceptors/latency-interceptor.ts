import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap, timer } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Adds a random 250–600 ms delay to every request in development, so loading
 * skeletons are visible against the local mock API. Off in production (max = 0).
 */
@Injectable()
export class LatencyInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const { min, max } = environment.mockLatency;
    if (max <= 0) {
      return next.handle(request);
    }
    const delayMs = min + Math.random() * (max - min);
    return timer(delayMs).pipe(switchMap(() => next.handle(request)));
  }
}
