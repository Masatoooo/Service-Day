import { Injectable } from '@angular/core';
import { formatISO } from 'date-fns';

/**
 * The single place the app asks "what time is it?".
 * Rules and pipes receive `now` as a parameter, so they stay pure and testable.
 */
@Injectable({ providedIn: 'root' })
export class ClockService {
  now(): Date {
    return new Date();
  }

  /** Local time with offset, e.g. 2026-11-06T09:30:00+08:00 (same format as the seed). */
  nowIso(): string {
    return formatISO(this.now());
  }
}
