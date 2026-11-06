import { Injectable } from '@angular/core';

/**
 * The single place the app asks "what time is it?".
 * Rules and pipes receive `now` as a parameter, so they stay pure and testable.
 */
@Injectable({ providedIn: 'root' })
export class ClockService {
  now(): Date {
    return new Date();
  }
}
