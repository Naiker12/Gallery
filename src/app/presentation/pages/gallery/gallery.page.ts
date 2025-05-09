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
  // Estado para subida de imágenes
  selectedFile: File | null = null;
  description: string = '';
  previewUrl: string | ArrayBuffer | null = null;
  imageBlob: Blob | null = null;
  
  // Lista de imágenes
  fotos: Foto[] = [];
  private subscription: Subscription | null = null;
  isLoading: boolean = true;
  hasCameraCapabilities: boolean = false;

  constructor(
    private galleryService: GalleryService,
    private toastService: CustomToastService,
    private cameraService: CameraService,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController
  ) {
    this.hasCameraCapabilities = this.cameraService.isCameraAvailable();
  }

  ngOnInit() {
    this.loadImages();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Carga las imágenes de la galería
   */
  loadImages() {
    this.isLoading = true;
    this.subscription = this.galleryService.getImages().subscribe({
      next: (images) => {
        this.fotos = images;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar imágenes:', error);
        this.toastService.error('No se pudieron cargar las imágenes');
        this.isLoading = false;
      }
    });
  }

  /**
   * Muestra opciones para seleccionar o tomar una imagen
   */
  async presentImageOptions() {
    const buttons = [
      {
        text: 'Seleccionar de la galería',
        icon: 'images',
        handler: () => {
          this.captureImage('gallery');
        }
      }
    ];

    // Agregar opción de cámara si está disponible
    if (this.hasCameraCapabilities) {
      buttons.unshift({
        text: 'Tomar una foto',
        icon: 'camera',
        handler: () => {
          this.captureImage('camera');
        }
      });
    }

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Selecciona una opción',
      buttons: [
        ...buttons,
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  /**
   * Captura una imagen desde la cámara o galería
   */
  async captureImage(source: 'camera' | 'gallery') {
    const imageData = await this.cameraService.takePicture(source);
    
    if (imageData) {
      this.previewUrl = imageData.dataUrl;
      this.imageBlob = imageData.blob;
      
      // Crear un archivo a partir del blob para poder subirlo después
      const fileName = `image_${new Date().getTime()}.${this.getFileExtension(imageData.blob.type)}`;
      this.selectedFile = this.cameraService.blobToFile(imageData.blob, fileName);
    }
  }

  /**
   * Obtiene la extensión de archivo basada en el MIME type
   */
  private getFileExtension(mimeType: string): string {
    switch (mimeType) {
      case 'image/jpeg':
      case 'image/jpg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/gif':
        return 'gif';
      case 'image/webp':
        return 'webp';
      default:
        return 'jpg';
    }
  }

  /**
   * Maneja el evento de selección de imagen desde input file
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Verificar que sea una imagen
      if (!this.selectedFile.type.startsWith('image/')) {
        this.toastService.error('El archivo seleccionado no es una imagen');
        this.resetForm();
        return;
      }
      
      // Crear preview
      this.createImagePreview();
    }
  }

  /**
   * Crea una vista previa de la imagen seleccionada
   */
  private createImagePreview() {
    if (!this.selectedFile) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(this.selectedFile);
  }

  /**
   * Guarda la imagen en Firebase y Supabase
   */
  async onSaveImage() {
    if (!this.selectedFile) {
      this.toastService.warning('Por favor selecciona una imagen');
      return;
    }
    
    if (!this.description.trim()) {
      this.toastService.warning('Por favor añade una descripción');
      return;
    }
    
    try {
      // Mostrar loading
      const loading = await this.loadingCtrl.create({
        message: 'Subiendo imagen...',
        spinner: 'circles'
      });
      await loading.present();
      
      // Subir imagen
      await this.galleryService.uploadImage(this.selectedFile, this.description.trim());
      
      // Limpiar formulario
      this.resetForm();
      
      // Cerrar loading
      await loading.dismiss();
    } catch (error) {
      console.error('Error al guardar imagen:', error);
      this.loadingCtrl.dismiss();
    }
  }

  /**
   * Elimina una imagen de la galería
   */
  async deleteImage(foto: Foto) {
    try {
      // Mostrar loading
      const loading = await this.loadingCtrl.create({
        message: 'Eliminando imagen...',
        spinner: 'circles'
      });
      await loading.present();
      
      // Eliminar imagen
      await this.galleryService.deleteImage(foto);
      
      // Cerrar loading
      await loading.dismiss();
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      this.loadingCtrl.dismiss();
    }
  }

  /**
   * Reinicia el formulario
   */
  resetForm() {
    this.selectedFile = null;
    this.imageBlob = null;
    this.description = '';
    this.previewUrl = null;
  }
}