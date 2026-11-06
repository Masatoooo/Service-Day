import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Builds every API URL from `environment.apiUrl`. Switching from json-server to
 * the Assignment 2 Express API means changing that one value.
 */
@Injectable({ providedIn: 'root' })
export class ApiUrlService {
  private readonly base = environment.apiUrl;

  /** url('activities', id) → http://localhost:3000/activities/<id> */
  url(...segments: string[]): string {
    return [this.base, ...segments.map(encodeURIComponent)].join('/');
  }
}
