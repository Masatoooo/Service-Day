import { Directive, input } from '@angular/core';

/**
 * "Skip to content" link. A plain href="#id" resolves against <base href="/"> and
 * would navigate to the home page, so the click is handled here: focus moves to the
 * target element and the URL stays as it is.
 * Usage: <a class="skip-link" href="#main-content" appSkipLink="main-content">Skip to content</a>
 */
@Directive({
  selector: 'a[appSkipLink]',
  standalone: false,
  host: { '(click)': 'skip($event)' },
})
export class SkipLink {
  readonly appSkipLink = input.required<string>();

  protected skip(event: MouseEvent): void {
    const target = document.getElementById(this.appSkipLink());
    if (!target) return;
    event.preventDefault();
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus();
    target.scrollIntoView({ block: 'start' });
  }
}
