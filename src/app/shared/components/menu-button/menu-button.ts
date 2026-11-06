import { Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { placeUnder } from '../../popover-position';

export interface MenuItem {
  id: string;
  label: string;
  tone?: 'default' | 'danger';
}

let nextId = 0;

/**
 * "More actions" button with a small menu, built on the native Popover API:
 * the browser gives Esc and click-outside to close and returns focus to the button.
 * This class only places the menu under the button (placeUnder) and handles arrow keys.
 * Usage: <app-menu-button label="More actions for X" [items]="items" (selected)="run($event)" />
 */
@Component({
  selector: 'app-menu-button',
  standalone: false,
  templateUrl: './menu-button.html',
  styleUrl: './menu-button.css',
})
export class MenuButton {
  /** Accessible name of the trigger, e.g. "More actions for Reading Buddies". */
  readonly label = input.required<string>();
  readonly items = input.required<MenuItem[]>();
  readonly selected = output<string>();

  protected readonly menuId = `menu-${nextId++}`;
  protected readonly isOpen = signal(false);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly menu = viewChild.required<ElementRef<HTMLElement>>('menu');
  private readonly close = () => this.menu().nativeElement.hidePopover();

  protected onToggle(event: Event): void {
    const open = (event as ToggleEvent).newState === 'open';
    this.isOpen.set(open);
    if (open) {
      placeUnder(this.trigger().nativeElement, this.menu().nativeElement);
      this.menuItems()[0]?.focus();
      // A fixed-position menu would drift away from its row: close it on scroll or resize.
      window.addEventListener('scroll', this.close, { capture: true, once: true, passive: true });
      window.addEventListener('resize', this.close, { once: true });
    } else {
      window.removeEventListener('scroll', this.close, { capture: true });
      window.removeEventListener('resize', this.close);
    }
  }

  protected choose(item: MenuItem): void {
    this.close();
    this.selected.emit(item.id);
  }

  /** Up / Down / Home / End move between items (WAI-ARIA menu pattern). */
  protected onKeydown(event: KeyboardEvent): void {
    const items = this.menuItems();
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next: Record<string, number> = {
      ArrowDown: (index + 1) % items.length,
      ArrowUp: (index - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    };
    if (event.key in next) {
      event.preventDefault();
      items[next[event.key]]?.focus();
    } else if (event.key === 'Tab') {
      this.close();
    }
  }

  private menuItems(): HTMLElement[] {
    return [...this.menu().nativeElement.querySelectorAll<HTMLElement>('[role="menuitem"]')];
  }
}
