import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class CustomToastService {
  constructor(private toastController: ToastController) {}

  async success(message: string, duration: number = 2000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'success',
      position: 'bottom',
      icon: 'checkmark-circle'
    });
    await toast.present();
  }

  async error(message: string, duration: number = 3000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'danger',
      position: 'bottom',
      icon: 'alert-circle'
    });
    await toast.present();
  }

  async warning(message: string, duration: number = 3000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'warning',
      position: 'bottom',
      icon: 'warning'
    });
    await toast.present();
  }

  async info(message: string, duration: number = 2000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'primary',
      position: 'bottom',
      icon: 'information-circle'
    });
    await toast.present();
  }
}