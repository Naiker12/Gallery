import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    loadChildren: () => import('./presentation/pages/landing/landing.module').then( m => m.LandingPageModule)
  },
  {
    path: 'gallery',
    loadChildren: () => import('./presentation/pages/gallery/gallery.module').then( m => m.GalleryPageModule)
  },  {
    path: 'list',
    loadChildren: () => import('./presentation/pages/list/list.module').then( m => m.ListPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
