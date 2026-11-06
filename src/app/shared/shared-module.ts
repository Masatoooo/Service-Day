import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
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
import { RelativeTimePipe } from './pipes/relative-time-pipe';

const COMPONENTS = [
  ActivityCard,
  Avatar,
  ConfirmDialog,
  Drawer,
  EmptyState,
  Gauge,
  KpiCard,
  PageHeader,
  PillFilter,
  SearchField,
  Skeleton,
  SlotMeter,
  StatusPill,
  Tabs,
  ToastStack,
];

const PIPES = [ActivityDatePipe, AvailabilityLabelPipe, CutoffLabelPipe, InitialsPipe, RelativeTimePipe];

/**
 * SharedModule — reusable UI (View layer) for every feature module.
 * Declares presentation components and pipes, and re-exports the Angular
 * modules features need, so a feature imports just SharedModule.
 * LucideDynamicIcon is a third-party standalone component, imported and re-exported.
 */
@NgModule({
  declarations: [...COMPONENTS, ...PIPES],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideDynamicIcon],
  exports: [CommonModule, ReactiveFormsModule, RouterModule, LucideDynamicIcon, ...COMPONENTS, ...PIPES],
  providers: [
    provideLucideIcons(...APP_ICONS),
    // Thin line icons (PLAN §8.6): stroke 1.75, 18px by default.
    provideLucideConfig({ strokeWidth: 1.75, size: 18 }),
  ],
})
export class SharedModule {}
