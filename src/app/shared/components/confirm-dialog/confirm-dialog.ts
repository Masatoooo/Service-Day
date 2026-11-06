import { Component, ElementRef, effect, input, model, output, viewChild } from '@angular/core';

let nextId = 0;

/**
 * Confirmation step before a consequential action (register, withdraw, delete).
 * Native <dialog> + showModal(): focus is trapped and Esc cancels.
 * The parent closes it (set open=false) once the action has finished.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  readonly heading = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly tone = input<'default' | 'danger'>('default');
  /** True while the confirmed action is running: the confirm button waits. */
  readonly busy = input(false);
  readonly open = model(false);
  readonly confirmed = output<void>();

  protected readonly id = `confirm-${nextId++}`;
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.open() && !dialog.open) {
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  protected onClose(): void {
    this.open.set(false);
  }
}
