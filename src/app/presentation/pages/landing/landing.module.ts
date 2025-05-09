import { NgModule } from '@angular/core';
import { LandingPageRoutingModule } from './landing-routing.module';
import { LandingPage } from './landing.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    LandingPageRoutingModule,
    SharedModule
  ],
  declarations: [LandingPage]
})
export class LandingPageModule {}
