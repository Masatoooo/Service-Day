import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/guest-guard';
import { AuthLayout } from './auth-layout/auth-layout';
import { Login } from './login/login';
import { Register } from './register/register';

const routes: Routes = [
  {
    path: '',
    component: AuthLayout,
    canActivateChild: [guestGuard],
    children: [
      { path: 'login', component: Login, title: 'Sign in · Service Day' },
      { path: 'register', component: Register, title: 'Create your account · Service Day' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
