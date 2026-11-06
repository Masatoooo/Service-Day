import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Placeholder for Assignment 2 — NOT registered in CoreModule yet.
 *
 * TODO (Assignment 2): read the JWT that the Express API returns at sign-in and
 * attach it as `Authorization: Bearer <token>` to every request to environment.apiUrl.
 * Then register it in CoreModule with { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request);
  }
}
