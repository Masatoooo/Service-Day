import { NgModule } from '@angular/core';
import { LayoutModule } from '../../layout/layout-module';
import { SharedModule } from '../../shared/shared-module';
import { DevRoutingModule } from './dev-routing-module';
import { Styleguide } from './styleguide/styleguide';

/** DevModule — lazy-loaded at /styleguide. Development reference only, never linked in the app. */
@NgModule({
  declarations: [Styleguide],
  imports: [SharedModule, LayoutModule, DevRoutingModule],
})
export class DevModule {}
