import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Styleguide } from './styleguide/styleguide';

const routes: Routes = [{ path: '', component: Styleguide, title: 'Styleguide · Service Day' }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DevRoutingModule {}
