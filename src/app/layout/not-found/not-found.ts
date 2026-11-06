import { Component } from '@angular/core';

/** Shown for any unknown URL (route `**`). */
@Component({
  selector: 'app-not-found',
  standalone: false,
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {}
