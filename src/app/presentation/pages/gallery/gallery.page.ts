import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { Timestamp } from '@angular/fire/firestore';
import { CameraService } from 'src/app/core/services/camara.service';
import { IonContent, NavController, AlertController } from '@ionic/angular';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { GalleryService } from 'src/app/core/services/gallery.service';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { LoadingService } from 'src/app/core/services/Loading.Service';


@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.page.html',
  styleUrls: ['./gallery.page.scss'],
  standalone: false
})
export class GalleryPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;

  form: FormGroup;
  imageFile: File | null = null;
  imagePreview: SafeUrl | null = null;
  isLoading = false; 

  constructor(
    private fb: FormBuilder,
    private cameraService: CameraService,
    private supabaseService: SupabaseService,
    private toastService: CustomToastService,
    private loadingService: LoadingService,
    private sanitizer: DomSanitizer,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private galleryService: GalleryService,
  ) {
    this.form = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit() {}

  async pickImageFromGallery() {
    try {
      const imagePath = await this.cameraService.selectImageFromGallery();
      if (!imagePath) {
        this.toastService.presentToast('No se seleccionó ninguna imagen', 'warning');
        return;
      }

      await this.setImageFromPath(imagePath);
      this.toastService.presentToast('Imagen seleccionada de galería', 'success');
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      this.toastService.presentToast('Error al seleccionar la imagen', 'danger');
    }
  }

  async takePhoto() {
    try {
      const imagePath = await this.cameraService.captureImage();
      if (!imagePath) {
        this.toastService.presentToast('No se tomó ninguna foto', 'warning');
        return;
      }

      await this.setImageFromPath(imagePath);
      this.toastService.presentToast('Foto tomada correctamente', 'success');
    } catch (error) {
      console.error('Error al tomar foto:', error);
      this.toastService.presentToast('Error al tomar la foto', 'danger');
    }
  }

  private async setImageFromPath(path: string) {
    const response = await fetch(path);
    const blob = await response.blob();
    this.imageFile = new File([blob], `photo_${Date.now()}.jpg`, { type: blob.type });
    const objectUrl = URL.createObjectURL(blob);
    this.imagePreview = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
  }

  async onSubmit() {
    if (!this.imageFile || this.form.invalid) {
      this.toastService.presentToast('Debes seleccionar una imagen y escribir una descripción', 'warning');
      return;
    }

    this.isLoading = true; // Actualizar estado de carga
    await this.loadingService.show('Guardando registro...');

    try {
      const path = `multimedia/${Date.now()}_${this.imageFile.name}`;
      const publicUrl = await this.supabaseService.uploadImage(this.imageFile, path);

      if (!publicUrl) {
        throw new Error('Error al subir la imagen a Supabase');
      }

      await this.galleryService.addMediaRecord(
        this.form.value.description,
        publicUrl
      );

      const alert = await this.alertCtrl.create({
        header: '¡Registro guardado!',
        message: '¿Deseas ver la lista de registros o agregar uno nuevo?',
        buttons: [
          {
            text: 'Agregar otro',
            role: 'cancel',
            handler: () => this.resetForm(),
          },
          {
            text: 'Ver lista',
            handler: () => this.navCtrl.navigateForward('/list'),
          },
        ],
      });

      await alert.present();
    } catch (error) {
      console.error('Error al guardar:', error);
      this.toastService.presentToast('Error al guardar el registro', 'danger');
    } finally {
      this.isLoading = false; // Restablecer estado de carga
      await this.loadingService.hide();
    }
  }

  resetForm() {
    this.form.reset();
    this.imageFile = null;
    this.imagePreview = null;
  }
}