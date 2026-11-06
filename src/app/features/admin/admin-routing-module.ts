import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { unsavedChangesGuard } from '../../core/guards/unsaved-changes-guard';
import { AreaShell, ShellRouteData } from '../../layout/area-shell/area-shell';
import { ActivitiesList } from './activities-list/activities-list';
import { ActivityAdminDetail } from './activity-admin-detail/activity-admin-detail';
import { ActivityForm } from './activity-form/activity-form';
import { Ngos } from './ngos/ngos';
import { AdminOverview } from './overview/overview';

const activityData = (subheading: string): ShellRouteData => ({ heading: 'Activities', subheading });

/** /admin/* — every admin page renders inside the shell (AreaShell). */
const routes: Routes = [
  {
    path: '',
    component: AreaShell,
    children: [
      { path: '', component: AdminOverview, title: 'Overview · Service Day', data: { greeting: true } satisfies ShellRouteData },
      {
        path: 'activities',
        component: ActivitiesList,
        title: 'Activities · Service Day',
        data: activityData('Create, publish and manage what employees can sign up for.'),
      },
      {
        path: 'activities/new',
        component: ActivityForm,
        canDeactivate: [unsavedChangesGuard],
        title: 'New activity · Service Day',
        data: activityData('New activity'),
      },
      {
        path: 'activities/:id',
        component: ActivityAdminDetail,
        title: 'Activity · Service Day',
        data: activityData('Activity details and participants'),
      },
      {
        path: 'activities/:id/edit',
        component: ActivityForm,
        canDeactivate: [unsavedChangesGuard],
        title: 'Edit activity · Service Day',
        data: activityData('Edit activity'),
      },
      {
        path: 'ngos',
        component: Ngos,
        title: 'NGOs · Service Day',
        data: { heading: 'NGOs', subheading: 'The partner organisations behind every activity.' } satisfies ShellRouteData,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
