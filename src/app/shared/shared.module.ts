import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';


const MODULOS = [CommonModule , FormsModule, IonicModule, ReactiveFormsModule ];


@NgModule({
  declarations: [],
  imports: [
     ...MODULOS
  ],
  exports: [
    ...MODULOS
  ]
})
export class SharedModule { }
