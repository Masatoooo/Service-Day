import { Component, inject, signal } from '@angular/core';
import { addDays, addHours, addMinutes, subDays } from 'date-fns';
import { AVAILABILITIES } from '../../../core/models';
import { ClockService } from '../../../core/services/clock-service';
import { ToastService } from '../../../core/services/toast-service';
import {
  COLOR_GROUPS,
  NGOS,
  NOTIFICATION_TABS,
  PREVIEW_ADMIN,
  PREVIEW_EMPLOYEE,
  RADIUS_TOKENS,
  SERVICE_TYPES,
  SPACE_TOKENS,
  TYPE_SCALE,
} from './styleguide-data';

/**
 * Dev-only styleguide (/styleguide, not linked anywhere): every token and
 * every shared component in its states, plus the shell in both nav variants.
 */
@Component({
  selector: 'app-styleguide',
  standalone: false,
  templateUrl: './styleguide.html',
  styleUrl: './styleguide.css',
})
export class Styleguide {
  private readonly toast = inject(ToastService);
  protected readonly now = inject(ClockService).now();

  protected readonly colorGroups = COLOR_GROUPS;
  protected readonly typeScale = TYPE_SCALE;
  protected readonly spaceTokens = SPACE_TOKENS;
  protected readonly radiusTokens = RADIUS_TOKENS;
  protected readonly availabilities = AVAILABILITIES;
  protected readonly ngos = NGOS;
  protected readonly serviceTypes = SERVICE_TYPES;
  protected readonly notificationTabs = NOTIFICATION_TABS;
  protected readonly employee = PREVIEW_EMPLOYEE;
  protected readonly admin = PREVIEW_ADMIN;

  /** Sample timestamps relative to now, for the cut-off and relative-time pipes. */
  protected readonly dates = {
    inTwoDays: addDays(this.now, 2),
    inFiveHours: addHours(this.now, 5),
    closedYesterday: subDays(this.now, 1),
    tenMinutesAgo: addMinutes(this.now, -10),
    threeDaysAgo: subDays(this.now, 3),
  };

  protected readonly query = signal('');
  protected readonly serviceType = signal<string | null>('education');
  protected readonly tab = signal('schedule');
  protected readonly confirmOpen = signal(false);
  protected readonly dangerOpen = signal(false);
  protected readonly drawerOpen = signal(false);
  protected readonly busy = signal(false);

  protected showToast(tone: 'success' | 'error' | 'info'): void {
    const messages = {
      success: "You're in: Reading Buddies, Little Readers Library, Sat 21 Nov, 09:00.",
      error: "Can't reach the Service Day server. Is `npm run api` running?",
      info: 'Registration for Lunch Service closes tomorrow at 12:00.',
    };
    this.toast[tone](messages[tone]);
  }

  /** Simulates a slow action so the busy state of the dialog is visible. */
  protected confirmRegister(): void {
    this.busy.set(true);
    setTimeout(() => {
      this.busy.set(false);
      this.confirmOpen.set(false);
      this.showToast('success');
    }, 900);
  }
}
