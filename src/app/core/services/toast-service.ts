import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastMessage, ToastTone } from '../models';

/** How long each tone stays on screen (ms). Errors stay longer so they can be read. */
const DURATION: Record<ToastTone, number> = { success: 5000, info: 5000, error: 8000 };

/**
 * Owns the list of visible toasts. Components call success/error/info;
 * ToastStack (shared) renders `toasts$` with the async pipe.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();
  private nextId = 1;

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  dismiss(id: number): void {
    this.toastsSubject.next(this.toastsSubject.value.filter((t) => t.id !== id));
  }

  private show(tone: ToastTone, message: string): void {
    const toast: ToastMessage = { id: this.nextId++, tone, message };
    // Keep at most 3 on screen; the oldest leaves first.
    this.toastsSubject.next([...this.toastsSubject.value, toast].slice(-3));
    setTimeout(() => this.dismiss(toast.id), DURATION[tone]);
  }
}
