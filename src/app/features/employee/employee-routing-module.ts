import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AreaShell, ShellRouteData } from '../../layout/area-shell/area-shell';
import { EmployeeHome } from './home/home';

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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeeRoutingModule {}
