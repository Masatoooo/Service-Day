import { NgModule } from '@angular/core';
import { AreaShellModule } from '../../layout/area-shell/area-shell-module';
import { SharedModule } from '../../shared/shared-module';
import { ActivityDetail } from './activity-detail/activity-detail';
import { EmployeeRoutingModule } from './employee-routing-module';
import { EmployeeHome } from './home/home';
import { Opportunities } from './opportunities/opportunities';

/** EmployeeModule — lazy-loaded employee area at /app (authGuard + roleGuard('employee')). */
@NgModule({
  declarations: [EmployeeHome, Opportunities, ActivityDetail],
  imports: [SharedModule, AreaShellModule, EmployeeRoutingModule],
})
export class EmployeeModule {}
