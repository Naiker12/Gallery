import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { Firestore, collection, addDoc, Timestamp } from '@angular/fire/firestore';
import { CameraService } from 'src/app/core/services/camara.service';
import { IonContent, LoadingController, ToastController, NavController, AlertController } from '@ionic/angular';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
  imagePreview: string | SafeUrl | null = null;
  isLoading: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private cameraService: CameraService,
    private supabaseService: SupabaseService,
    private firestore: Firestore,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private sanitizer: DomSanitizer,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) {
    this.form = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit() {
  }

  async pickImage() {
    try {
      const imagePath = await this.cameraService.captureImage();
      
      if (!imagePath) {
        this.presentToast('No se seleccionó ninguna imagen', 'warning');
        return;
      }
      
      const response = await fetch(imagePath);
      const blob = await response.blob();
      this.imageFile = new File([blob], `photo_${Date.now()}.jpg`, { type: blob.type });
      
      const objectUrl = URL.createObjectURL(blob);
      this.imagePreview = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      
      this.presentToast('Imagen seleccionada correctamente', 'success');
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      this.presentToast('Error al seleccionar la imagen', 'danger');
    }
  }

  async onSubmit() {
    if (!this.imageFile || this.form.invalid) {
      if (!this.imageFile) {
        this.presentToast('Debes seleccionar una imagen', 'warning');
      }
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Guardando registro...',
      spinner: 'crescent'
    });
    await loading.present();
    
    try {
      const path = `multimedia/${Date.now()}_${this.imageFile.name}`;
      const publicUrl = await this.supabaseService.uploadImage(this.imageFile, path);

      if (!publicUrl) {
        throw new Error('Error al subir la imagen a Supabase');
      }

      const data = {
        description: this.form.value.description,
        imageUrl: publicUrl,
        createdAt: Timestamp.now()
      };

      await addDoc(collection(this.firestore, 'gallery'), data);
      
      const alert = await this.alertCtrl.create({
        header: '¡Registro guardado!',
        message: '¿Deseas ver la lista de registros o agregar uno nuevo?',
        buttons: [
          {
            text: 'Agregar otro',
            role: 'cancel',
            handler: () => {
              this.resetForm();
            }
          },
          {
            text: 'Ver lista',
            handler: () => {
              this.navCtrl.navigateForward('/list');
            }
          }
        ]
      });
      
      await alert.present();
      
    } catch (error) {
      console.error('Error al guardar:', error);
      this.presentToast('Error al guardar el registro', 'danger');
    } finally {
      loading.dismiss();
      this.isLoading = false;
    }
  }
  
  resetForm() {
    this.form.reset();
    this.imageFile = null;
    this.imagePreview = null;
  }
  
  private async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2500,
      position: 'bottom',
      color: color,
      buttons: [
        {
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    
    await toast.present();
  }
}