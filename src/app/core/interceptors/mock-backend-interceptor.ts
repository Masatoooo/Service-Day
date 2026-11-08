import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MOCK_DB_SEED } from '../mock/mock-db-seed';

const STORAGE_KEY = 'service-day.mock-db';

/**
 * In-browser mock backend (intercepts HttpClient calls when running on static hosts like GitHub Pages).
 * Persists changes to localStorage so all user interactions (login, register, switch, withdraw, admin CRUD)
 * work completely client-side without needing a separate backend server.
 */
@Injectable()
export class MockBackendInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const env = environment as { production?: boolean; useMockBackend?: boolean };
    const isLocalhost = req.url.includes('localhost:3000');
    const shouldIntercept = env.useMockBackend || (env.production && isLocalhost);

    if (!shouldIntercept) {
      return next.handle(req);
    }

    return this.handleRequest(req);
  }

  private handleRequest(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    const db = this.getDb();

    // Parse URL pathname to find collection and optional id
    let pathname = '';
    try {
      const parsed = new URL(req.url, 'http://localhost:3000');
      pathname = parsed.pathname;
    } catch {
      pathname = req.url.split('?')[0];
    }

    const segments = pathname.replace(/^\/+|\/+$/g, '').split('/').filter((s) => s && s !== 'api');
    const collection = segments[0] ?? '';
    const id = segments[1] ? decodeURIComponent(segments[1]) : null;

    let status = 200;
    let body: unknown = null;

    switch (req.method) {
      case 'GET': {
        if (collection === 'reminderSettings') {
          body = db['reminderSettings'];
        } else if (id) {
          const items = (db[collection] as Array<{ id: string }>) || [];
          const item = items.find((x) => String(x.id) === id);
          if (item) {
            body = item;
          } else {
            status = 404;
            body = { error: 'Not found' };
          }
        } else {
          let items: Array<Record<string, unknown>> = [...((db[collection] as Array<Record<string, unknown>>) || [])];
          for (const key of req.params.keys()) {
            const val = req.params.get(key);
            if (val !== null) {
              items = items.filter((item) => {
                const itemVal = item[key];
                if (typeof itemVal === 'string') {
                  return itemVal.toLowerCase() === val.toLowerCase();
                }
                return String(itemVal) === val;
              });
            }
          }
          body = items;
        }
        break;
      }

      case 'POST': {
        status = 201;
        const payload = (req.body as Record<string, unknown>) || {};
        const newId = payload['id'] ? String(payload['id']) : `${collection.slice(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newItem = { ...payload, id: newId };
        if (!Array.isArray(db[collection])) {
          db[collection] = [];
        }
        (db[collection] as Array<Record<string, unknown>>).push(newItem);
        this.saveDb(db);
        body = newItem;
        break;
      }

      case 'PUT': {
        if (collection === 'reminderSettings') {
          db['reminderSettings'] = req.body;
          this.saveDb(db);
          body = db['reminderSettings'];
        } else if (id) {
          const items = (db[collection] as Array<{ id: string }>) || [];
          const idx = items.findIndex((x) => String(x.id) === id);
          const payload = (req.body as Record<string, unknown>) || {};
          if (idx !== -1) {
            items[idx] = { ...payload, id };
            this.saveDb(db);
            body = items[idx];
          } else {
            const newItem = { ...payload, id };
            items.push(newItem);
            this.saveDb(db);
            body = newItem;
          }
        }
        break;
      }

      case 'PATCH': {
        if (id) {
          const items = (db[collection] as Array<{ id: string }>) || [];
          const item = items.find((x) => String(x.id) === id);
          if (item) {
            Object.assign(item, req.body as Record<string, unknown>);
            this.saveDb(db);
            body = item;
          } else {
            status = 404;
            body = { error: 'Not found' };
          }
        }
        break;
      }

      case 'DELETE': {
        if (id && Array.isArray(db[collection])) {
          db[collection] = (db[collection] as Array<{ id: string }>).filter((x) => String(x.id) !== id);
          this.saveDb(db);
        }
        body = {};
        break;
      }

      default:
        status = 405;
        body = { error: 'Method not allowed' };
    }

    return of(new HttpResponse({ status, body })).pipe(delay(40));
  }

  private getDb(): Record<string, unknown> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as Record<string, unknown>;
      }
    } catch {
      // Ignore localStorage errors
    }
    const initial = JSON.parse(JSON.stringify(MOCK_DB_SEED)) as Record<string, unknown>;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch {
      // Ignore
    }
    return initial;
  }

  private saveDb(db: Record<string, unknown>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      // Ignore
    }
  }
}
