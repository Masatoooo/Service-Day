import { Component, ElementRef, effect, input, model, viewChild } from '@angular/core';
import { wrapTab } from '../../focus-wrap';

let nextId = 0;

/**
 * Side panel built on the native <dialog> element.
 * `showModal()` gives focus trapping, Esc-to-close and an inert page for free.
 * Two-way bindable: <app-drawer heading="Edit NGO" [(open)]="editing">…</app-drawer>
 * Footer actions: put them in an element with the `drawer-footer` attribute.
 */
@Component({
  selector: 'app-drawer',
  standalone: false,
  templateUrl: './drawer.html',
  styleUrl: './drawer.css',
})
export class Drawer {
  readonly heading = input.required<string>();
  readonly side = input<'start' | 'end'>('end');
  /** Hide the heading visually (it stays the dialog's accessible name). */
  readonly headingHidden = input(false);
  readonly open = model(false);

  protected readonly headingId = `drawer-heading-${nextId++}`;
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    // Keep the native dialog in sync with the `open` input.
    effect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.open() && !dialog.open) {
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  /** Esc or close(): tell the parent through the two-way binding. */
  protected onClose(): void {
    this.open.set(false);
  }

  /** A click whose target is the <dialog> itself landed on the backdrop. */
  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.open.set(false);
    }
  }

  /** Tab stays inside the dialog (wraps from the last control to the first). */
  protected onKeydown(event: KeyboardEvent): void {
    wrapTab(event, this.dialog().nativeElement);
  }
}
