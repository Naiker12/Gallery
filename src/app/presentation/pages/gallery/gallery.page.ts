import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { Firestore, collection, addDoc, Timestamp, getDocs, query, orderBy, doc, deleteDoc } from '@angular/fire/firestore';
import { CameraService } from 'src/app/core/services/camara.service';
import { AlertController, IonContent, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface GalleryItem {
  id: string;
  description: string;
  imageUrl: string;
  createdAt: any;
}

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
  galleryItems: GalleryItem[] = [];
  isLoading: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private cameraService: CameraService,
    private supabaseService: SupabaseService,
    private firestore: Firestore,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private sanitizer: DomSanitizer
  ) {
    this.form = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit() {
    this.loadGalleryItems();
  }

  async loadGalleryItems() {
    this.isLoading = true;
    try {
      const galleryRef = collection(this.firestore, 'gallery');
      const q = query(galleryRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      this.galleryItems = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          description: data['description'] || 'Sin descripción',
          imageUrl: data['imageUrl'] || '',
          createdAt: data['createdAt'] || null
        } as GalleryItem;
      });
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      this.presentToast('Error al cargar los datos. Intente nuevamente.', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async pickImage() {
    try {
      const imagePath = await this.cameraService.captureImage();
      const response = await fetch(imagePath);
      const blob = await response.blob();
      this.imageFile = new File([blob], `photo_${Date.now()}.jpg`, { type: blob.type });
      
      const objectUrl = URL.createObjectURL(blob);
      this.imagePreview = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      this.presentToast('Error al seleccionar la imagen', 'danger');
    }
  }

  async onSubmit() {
    if (!this.imageFile || this.form.invalid) return;

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
      

      await this.loadGalleryItems();
      
      this.form.reset();
      this.imageFile = null;
      this.imagePreview = null;
      
      this.presentToast('¡Registro guardado correctamente!', 'success');
  
      setTimeout(() => {
        this.scrollToGallery();
      }, 500);
    } catch (error) {
      console.error('Error al guardar:', error);
      this.presentToast('Error al guardar el registro', 'danger');
    } finally {
      loading.dismiss();
      this.isLoading = false;
    }
  }
  
  async viewDetails(item: GalleryItem) {
    const alert = await this.alertCtrl.create({
      header: item.description,
      message: `
        <div style="text-align: center;">
          <img src="${item.imageUrl}" style="max-width: 100%; max-height: 300px; border-radius: 8px; margin-bottom: 10px;">
          <p>Fecha: ${item.createdAt?.toDate().toLocaleString() || 'No disponible'}</p>
        </div>
      `,
      buttons: ['Cerrar']
    });
    
    await alert.present();
  }
  
  async confirmDelete(item: GalleryItem) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro que deseas eliminar este registro?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Eliminar',
          handler: () => {
            this.deleteItem(item);
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  async deleteItem(item: GalleryItem) {
    this.isLoading = true;
    
    try {

      const itemRef = doc(this.firestore, 'gallery', item.id);
      await deleteDoc(itemRef);
      
  
      
      this.galleryItems = this.galleryItems.filter(i => i.id !== item.id);
      this.presentToast('Registro eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error al eliminar:', error);
      this.presentToast('Error al eliminar el registro', 'danger');
    } finally {
      this.isLoading = false;
    }
  }
  
  handleImageError(event: any) {
    const imgElement = event.target;
    imgElement.src = 'assets/placeholder-image.png';
  }
  
  scrollToTop() {
    this.content.scrollToTop(500);
  }
  
  scrollToGallery() {
    const galleryElement = document.querySelector('.gallery-card');
    if (galleryElement) {
      this.content.scrollToPoint(0, galleryElement.getBoundingClientRect().top, 500);
    }
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