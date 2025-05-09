import { NgModule } from '@angular/core';
import { GalleryPageRoutingModule } from './gallery-routing.module';

import { GalleryPage } from './gallery.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    GalleryPageRoutingModule,
    SharedModule
  ],
  declarations: [GalleryPage]
})
export class GalleryPageModule {}
