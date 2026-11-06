import { Component, input } from '@angular/core';

/**
 * Section heading for a page or card group, with an optional description and
 * an actions slot (projected buttons). View only: no logic.
 */
@Component({
  selector: 'app-page-header',
  standalone: false,
  templateUrl: './page-header.html',
  styleUrl: './page-header.css',
})
export class PageHeader {
  readonly heading = input.required<string>();
  readonly description = input<string>();
  /** 1 for the page title (when the top bar doesn't carry it), 2 for sections. */
  readonly level = input<1 | 2>(2);
}
