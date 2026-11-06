import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AreaShell, ShellRouteData } from '../../layout/area-shell/area-shell';
import { AdminOverview } from './overview/overview';

/** /admin/* — every admin page renders inside the shell (AreaShell). */
const routes: Routes = [
  {
    path: '',
    component: AreaShell,
    children: [
      {
        path: '',
        component: AdminOverview,
        title: 'Overview · Service Day',
        data: { greeting: true } satisfies ShellRouteData,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
