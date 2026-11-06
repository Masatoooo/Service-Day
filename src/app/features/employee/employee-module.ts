import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { EmployeeRoutingModule } from './employee-routing-module';
import { EmployeeHome } from './home/home';

/** EmployeeModule — lazy-loaded employee area at /app (authGuard + roleGuard('employee')). */
@NgModule({
  declarations: [EmployeeHome],
  imports: [SharedModule, EmployeeRoutingModule],
})
export class EmployeeModule {}
