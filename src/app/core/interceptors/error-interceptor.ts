import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, TimeoutError, catchError, throwError, timeout } from 'rxjs';
import { ToastService } from '../services/toast-service';

/** The same message is shown at most once in this window (polling would repeat it). */
const REPEAT_WINDOW_MS = 10_000;
/** A request with no answer after this long fails instead of spinning forever. */
const REQUEST_TIMEOUT_MS = 15_000;

/** Maps an HTTP failure to a sentence a person can act on. */
function messageFor(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return "Can't reach the Service Day server. Is `npm run api` running?";
  }
  if (error.status === 408) {
    return 'The Service Day server is taking too long to answer. Please try again in a moment.';
  }
  if (error.status === 401 || error.status === 403) {
    return "You don't have access to that. Sign out and sign in again.";
  }
  if (error.status === 404) {
    return "We couldn't find that item. It may have been deleted.";
  }
  if (error.status === 409) {
    return 'Someone changed this at the same time. Wait a moment for the latest version, then try again.';
  }
  if (error.status === 400 || error.status === 422) {
    return "The server didn't accept that. Check the form and try again.";
  }
  if (error.status === 429) {
    return 'Too many requests at once. Wait a few seconds and try again.';
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
      timeout(REQUEST_TIMEOUT_MS),
      catchError((error: unknown) => {
        // A timeout becomes an ordinary HTTP error (408) so every caller handles it the same way.
        const httpError =
          error instanceof TimeoutError ? new HttpErrorResponse({ status: 408, statusText: 'Request Timeout', url: request.urlWithParams }) : error;
        if (httpError instanceof HttpErrorResponse) {
          this.show(messageFor(httpError));
        }
        return throwError(() => httpError);
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
