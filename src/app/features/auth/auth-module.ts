import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { AuthLayout } from './auth-layout/auth-layout';
import { AuthRoutingModule } from './auth-routing-module';
import { Login } from './login/login';
import { Register } from './register/register';

/** AuthModule — lazy-loaded sign-in and sign-up pages (signed-out visitors only). */
@NgModule({
  declarations: [AuthLayout, Login, Register],
  imports: [SharedModule, AuthRoutingModule],
})
export class AuthModule {}
