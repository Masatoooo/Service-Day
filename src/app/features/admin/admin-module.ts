import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import { BaseChartDirective, provideCharts } from 'ng2-charts';
import { AreaShellModule } from '../../layout/area-shell/area-shell-module';
import { SharedModule } from '../../shared/shared-module';
import { ActivitiesList } from './activities-list/activities-list';
import { ActivityAdminDetail } from './activity-admin-detail/activity-admin-detail';
import { ActivityForm } from './activity-form/activity-form';
import { AdminRoutingModule } from './admin-routing-module';
import { Ngos } from './ngos/ngos';
import { BroadcastTab } from './notifications-center/broadcast-tab/broadcast-tab';
import { HistoryTab } from './notifications-center/history-tab/history-tab';
import { NotificationsCenter } from './notifications-center/notifications-center';
import { ScheduleTab } from './notifications-center/schedule-tab/schedule-tab';
import { Participation } from './participation/participation';
import { FillChart } from './overview/fill-chart/fill-chart';
import { AdminOverview } from './overview/overview';

/** AdminModule — lazy-loaded admin area at /admin (authGuard + roleGuard('admin')). */
@NgModule({
  declarations: [
    AdminOverview, FillChart, ActivitiesList, ActivityForm, ActivityAdminDetail, Ngos, Participation,
    NotificationsCenter, ScheduleTab, BroadcastTab, HistoryTab,
  ],
  imports: [SharedModule, ReactiveFormsModule, AreaShellModule, AdminRoutingModule, BaseChartDirective],
  // Charts: register only the chart.js pieces a horizontal bar chart needs (smaller lazy chunk).
  providers: [provideCharts({ registerables: [BarController, BarElement, CategoryScale, LinearScale, Tooltip] })],
})
export class AdminModule {}
