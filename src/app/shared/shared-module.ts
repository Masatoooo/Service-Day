import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideDynamicIcon, provideLucideConfig, provideLucideIcons } from '@lucide/angular';

import { APP_ICONS } from './icons';
import { ActivityCard } from './components/activity-card/activity-card';
import { Avatar } from './components/avatar/avatar';
import { ConfirmDialog } from './components/confirm-dialog/confirm-dialog';
import { Drawer } from './components/drawer/drawer';
import { EmptyState } from './components/empty-state/empty-state';
import { Gauge } from './components/gauge/gauge';
import { KpiCard } from './components/kpi-card/kpi-card';
import { MenuButton } from './components/menu-button/menu-button';
import { NoticeItem } from './components/notice-item/notice-item';
import { PageHeader } from './components/page-header/page-header';
import { PillFilter } from './components/pill-filter/pill-filter';
import { SearchField } from './components/search-field/search-field';
import { Skeleton } from './components/skeleton/skeleton';
import { SlotMeter } from './components/slot-meter/slot-meter';
import { StatusPill } from './components/status-pill/status-pill';
import { Tabs } from './components/tabs/tabs';
import { ToastStack } from './components/toast-stack/toast-stack';
import { ActivityDatePipe } from './pipes/activity-date-pipe';
import { AvailabilityLabelPipe } from './pipes/availability-label-pipe';
import { CutoffLabelPipe } from './pipes/cutoff-label-pipe';
import { InitialsPipe } from './pipes/initials-pipe';
import { SkipLink } from './directives/skip-link';
import { RelativeTimePipe } from './pipes/relative-time-pipe';

const COMPONENTS = [
  ActivityCard,
  Avatar,
  ConfirmDialog,
  Drawer,
  EmptyState,
  Gauge,
  KpiCard,
  MenuButton,
  NoticeItem,
  PageHeader,
  PillFilter,
  SearchField,
  Skeleton,
  SlotMeter,
  StatusPill,
  Tabs,
  ToastStack,
];

const DIRECTIVES = [SkipLink];

const PIPES = [ActivityDatePipe, AvailabilityLabelPipe, CutoffLabelPipe, InitialsPipe, RelativeTimePipe];

/**
 * SharedModule — reusable UI (View layer) for every feature module.
 * Declares presentation components and pipes, and re-exports the Angular
 * modules features need, so a feature imports just SharedModule.
 * LucideDynamicIcon is a third-party standalone component, imported and re-exported.
 * ReactiveFormsModule is NOT exported here: the root shell imports SharedModule, so
 * forms would land in the initial bundle. Only AuthModule and AdminModule (the
 * pages with forms) import it themselves.
 */
@NgModule({
  declarations: [...COMPONENTS, ...DIRECTIVES, ...PIPES],
  imports: [CommonModule, RouterModule, LucideDynamicIcon],
  exports: [CommonModule, RouterModule, LucideDynamicIcon, ...COMPONENTS, ...DIRECTIVES, ...PIPES],
  providers: [
    provideLucideIcons(...APP_ICONS),
    // Thin line icons (PLAN §8.6): stroke 1.75, 18px by default.
    provideLucideConfig({ strokeWidth: 1.75, size: 18 }),
  ],
})
export class SharedModule {}
