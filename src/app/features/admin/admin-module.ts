import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AreaShellModule } from '../../layout/area-shell/area-shell-module';
import { SharedModule } from '../../shared/shared-module';
import { ActivitiesList } from './activities-list/activities-list';
import { ActivityAdminDetail } from './activity-admin-detail/activity-admin-detail';
import { ActivityForm } from './activity-form/activity-form';
import { AdminRoutingModule } from './admin-routing-module';
import { Ngos } from './ngos/ngos';
import { AdminOverview } from './overview/overview';

/** AdminModule — lazy-loaded admin area at /admin (authGuard + roleGuard('admin')). */
@NgModule({
  declarations: [AdminOverview, ActivitiesList, ActivityForm, ActivityAdminDetail, Ngos],
  imports: [SharedModule, ReactiveFormsModule, AreaShellModule, AdminRoutingModule],
})
export class AdminModule {}
