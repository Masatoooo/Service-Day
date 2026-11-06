import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { LayoutModule } from '../layout-module';
import { AreaShell } from './area-shell';

/**
 * AreaShellModule — the routed shell for the signed-in areas. Imported only by
 * the lazy EmployeeModule and AdminModule, so AreaShell and the services it uses
 * (notifications, live activities) load with those areas, not with the sign-in page.
 */
@NgModule({
  declarations: [AreaShell],
  imports: [SharedModule, LayoutModule],
  exports: [AreaShell],
})
export class AreaShellModule {}
