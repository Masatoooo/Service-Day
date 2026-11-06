import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { AdminRoutingModule } from './admin-routing-module';
import { AdminOverview } from './overview/overview';

/** AdminModule — lazy-loaded admin area at /admin (authGuard + roleGuard('admin')). */
@NgModule({
  declarations: [AdminOverview],
  imports: [SharedModule, AdminRoutingModule],
})
export class AdminModule {}
