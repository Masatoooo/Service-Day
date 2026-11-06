import { NgModule } from '@angular/core';
import { AreaShellModule } from '../../layout/area-shell/area-shell-module';
import { SharedModule } from '../../shared/shared-module';
import { ActivityDetail } from './activity-detail/activity-detail';
import { EmployeeRoutingModule } from './employee-routing-module';
import { EmployeeHome } from './home/home';
import { Inbox } from './inbox/inbox';
import { MyRegistrations } from './my-registrations/my-registrations';
import { Opportunities } from './opportunities/opportunities';
import { RegistrationFlow } from './registration-flow';

/**
 * EmployeeModule — lazy-loaded employee area at /app (authGuard + roleGuard('employee')).
 * RegistrationFlow is provided here: one instance shared by the employee pages only.
 */
@NgModule({
  declarations: [EmployeeHome, Opportunities, ActivityDetail, MyRegistrations, Inbox],
  imports: [SharedModule, AreaShellModule, EmployeeRoutingModule],
  providers: [RegistrationFlow],
})
export class EmployeeModule {}
