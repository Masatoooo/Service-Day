import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFound } from './layout/not-found/not-found';

/**
 * Root routes. Feature modules are lazy-loaded (loadChildren), so their code
 * is only downloaded when the user first visits that area.
 * Auth, employee and admin areas arrive in Phases 3–8.
 */
const routes: Routes = [
  {
    path: 'styleguide',
    loadChildren: () => import('./features/dev/dev-module').then((m) => m.DevModule),
  },
  // Temporary until Phase 3 adds role-based redirects (/ → /app or /admin).
  { path: '', pathMatch: 'full', redirectTo: 'styleguide' },
  { path: '**', component: NotFound, title: 'Page not found · Service Day' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
