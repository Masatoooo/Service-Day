import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AreaShell, ShellRouteData } from '../../layout/area-shell/area-shell';
import { ActivityDetail } from './activity-detail/activity-detail';
import { EmployeeHome } from './home/home';
import { MyRegistrations } from './my-registrations/my-registrations';
import { Opportunities } from './opportunities/opportunities';

/** /app/* — every employee page renders inside the shell (AreaShell). */
const routes: Routes = [
  {
    path: '',
    component: AreaShell,
    children: [
      {
        path: '',
        component: EmployeeHome,
        title: 'Home · Service Day',
        data: { greeting: true } satisfies ShellRouteData,
      },
      {
        path: 'opportunities',
        component: Opportunities,
        title: 'Opportunities · Service Day',
        data: {
          heading: 'Opportunities',
          subheading: 'Pick one activity for Service Day. Places update live.',
        } satisfies ShellRouteData,
      },
      {
        path: 'registrations',
        component: MyRegistrations,
        title: 'My registrations · Service Day',
        data: {
          heading: 'My registrations',
          subheading: 'Your place for Service Day and every change you made this season.',
        } satisfies ShellRouteData,
      },
      {
        path: 'opportunities/:id',
        component: ActivityDetail,
        title: 'Activity · Service Day',
        data: { heading: 'Opportunities', subheading: 'Activity details' } satisfies ShellRouteData,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeeRoutingModule {}
