import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoadingController, ActionSheetController } from '@ionic/angular';
import { GalleryService } from 'src/app/core/services/gallery.service';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { Foto } from 'src/app/core/models/foto';
import { CameraService } from 'src/app/core/services/camara.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.page.html',
  styleUrls: ['./gallery.page.scss'],
  standalone: false
})
export class GalleryPage implements OnInit, OnDestroy {
  selectedFile: File | null = null;
  description = '';
  previewUrl: string | ArrayBuffer | null = null;
  fotos: Foto[] = [];
  isLoading = false;
  hasCamera = false;
  subscription: Subscription | null = null;

  constructor(
    private galleryService: GalleryService,
    private toastService: CustomToastService,
    private cameraService: CameraService,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController
  ) {}

  ngOnInit() {
    this.hasCamera = this.cameraService.isCameraAvailable();
    this.loadImages();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  loadImages() {
    this.isLoading = true;
    this.subscription = this.galleryService.getImages().subscribe({
      next: images => {
        this.fotos = images;
        this.isLoading = false;
      },
      error: err => {
        console.error(err);
        this.toastService.error('Error cargando las imágenes');
        this.isLoading = false;
      }
    });
  }

  async presentImageOptions() {
    const buttons = [
      {
        text: 'Seleccionar de galería',
        icon: 'images',
        handler: () => this.captureImage('gallery')
      }
    ];

    if (this.hasCamera) {
      buttons.unshift({
        text: 'Tomar una foto',
        icon: 'camera',
        handler: () => this.captureImage('camera')
      });
    }

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Selecciona una opción',
      buttons: [...buttons, { text: 'Cancelar', icon: 'close', role: 'cancel' }]
    });
    await actionSheet.present();
  }

  async captureImage(source: 'camera' | 'gallery') {
    const imageData = await this.cameraService.takePicture(source);
    if (imageData) {
      const fileName = `image_${Date.now()}.${this.getFileExtension(imageData.blob.type)}`;
      this.selectedFile = this.cameraService.blobToFile(imageData.blob, fileName);
      this.createPreview(this.selectedFile);
    }
  }

  private createPreview(file: File) {
    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result);
    reader.readAsDataURL(file);
  }

  private getFileExtension(mimeType: string): string {
    const map: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp'
    };
    return map[mimeType] || 'jpg';
  }

  async onSaveImage() {
    if (!this.selectedFile) {
      this.toastService.warning('Selecciona una imagen');
      return;
    }

    if (!this.description.trim()) {
      this.toastService.warning('Agrega una descripción');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Subiendo imagen...',
      spinner: 'circles'
    });
    await loading.present();

    try {
      await this.galleryService.uploadImage(this.selectedFile, this.description.trim());
      this.resetForm();
    } catch (error) {
      console.error(error);
    } finally {
      await loading.dismiss();
    }
  }

  async deleteImage(foto: Foto) {
    const loading = await this.loadingCtrl.create({
      message: 'Eliminando imagen...',
      spinner: 'circles'
    });
    await loading.present();

    try {
      await this.galleryService.deleteImage(foto);
    } catch (error) {
      console.error(error);
    } finally {
      await loading.dismiss();
    }
  }

  resetForm() {
    this.selectedFile = null;
    this.description = '';
    this.previewUrl = null;
  }
}
