import { Component, inject } from '@angular/core';
import { ToastTone } from '../../../core/models';
import { ToastService } from '../../../core/services/toast-service';

const ICON_BY_TONE: Record<ToastTone, string> = {
  success: 'circle-check',
  error: 'circle-exclamation-point',
  info: 'info',
};

/**
 * Renders the toasts held by ToastService. Placed once in the root template.
 * The container is an aria-live region, so new messages are announced politely.
 */
@Component({
  selector: 'app-toast-stack',
  standalone: false,
  templateUrl: './toast-stack.html',
  styleUrl: './toast-stack.css',
})
export class ToastStack {
  private readonly toastService = inject(ToastService);
  protected readonly toasts$ = this.toastService.toasts$;
  protected readonly icons = ICON_BY_TONE;

  protected dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
