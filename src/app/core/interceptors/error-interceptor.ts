import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast-service';

/** The same message is shown at most once in this window (polling would repeat it). */
const REPEAT_WINDOW_MS = 10_000;

/** Maps an HTTP failure to a sentence a person can act on. */
function messageFor(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return "Can't reach the Service Day server. Is `npm run api` running?";
  }
  if (error.status === 404) {
    return "We couldn't find that item. It may have been deleted.";
  }
  if (error.status >= 500) {
    return `The server had a problem (${error.status}). Please try again.`;
  }
  return `The server rejected that request (${error.status}).`;
}

/**
 * Shows a friendly toast for any network or HTTP error, then rethrows so the
 * calling service/component can still show its own error state.
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly toast = inject(ToastService);
  private lastMessage = '';
  private lastShownAt = 0;

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          this.show(messageFor(error));
        }
        return throwError(() => error);
      }),
    );
  }

  private show(message: string): void {
    const now = Date.now();
    if (message === this.lastMessage && now - this.lastShownAt < REPEAT_WINDOW_MS) {
      return;
    }
    this.lastMessage = message;
    this.lastShownAt = now;
    this.toast.error(message);
  }
}
