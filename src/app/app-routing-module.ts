import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { homeRedirectGuard } from './core/guards/guest-guard';
import { roleGuard } from './core/guards/role-guard';
import { NotFound } from './layout/not-found/not-found';

/**
 * Root routes. Feature modules are lazy-loaded (loadChildren), so their code
 * is only downloaded when the user first visits that area.
 * Guards: authGuard → signed in; roleGuard → right role; guestGuard (inside AuthModule) → signed out.
 */
const routes: Routes = [
  // `/` → /app, /admin or /login depending on the session.
  { path: '', pathMatch: 'full', canActivate: [homeRedirectGuard], children: [] },
  {
    path: 'app',
    canActivate: [authGuard, roleGuard('employee')],
    loadChildren: () => import('./features/employee/employee-module').then((m) => m.EmployeeModule),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('admin')],
    loadChildren: () => import('./features/admin/admin-module').then((m) => m.AdminModule),
  },
  {
    // Dev only: not linked anywhere in the app.
    path: 'styleguide',
    loadChildren: () => import('./features/dev/dev-module').then((m) => m.DevModule),
  },
  // /login and /register (AuthModule's own routes).
  { path: '', loadChildren: () => import('./features/auth/auth-module').then((m) => m.AuthModule) },
  { path: '**', component: NotFound, title: 'Page not found · Service Day' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
