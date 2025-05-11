import { Component, OnInit, ViewChild } from '@angular/core';
import { Firestore, collection, getDocs, query, orderBy, doc, deleteDoc } from '@angular/fire/firestore';
import { AlertController, IonContent, LoadingController, ToastController } from '@ionic/angular';

interface GalleryItem {
  id: string;
  description: string;
  imageUrl: string;
  createdAt: any;
}

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  standalone: false
})
export class ListPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;
  
  galleryItems: GalleryItem[] = [];
  filteredItems: GalleryItem[] = [];
  isLoading: boolean = true;
  searchTerm: string = '';
  viewMode: 'grid' | 'list' = 'grid';

  constructor(
    private firestore: Firestore,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadGalleryItems();
  }

  ionViewWillEnter() {
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
          description: data['description'] || '',
          imageUrl: data['imageUrl'] || '',
          createdAt: data['createdAt'] || null
        } as GalleryItem;
      });
      
      this.filteredItems = [...this.galleryItems];
      
    } catch (error) {
      console.error('Error loading gallery:', error);
      this.showToast('Error al cargar la galería', 'danger');
    } finally {
      this.isLoading = false;
    }
  }
  
  filterItems(event: any) {
    const searchTerm = (event.detail?.value || '').toLowerCase();
    this.filteredItems = this.galleryItems.filter(item => 
      item.description.toLowerCase().includes(searchTerm)
    );
  }
  
  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }
  
  async viewDetails(item: GalleryItem) {
    const alert = await this.alertCtrl.create({
      header: item.description || 'Sin título',
      cssClass: 'image-alert',
      message: `
        <div style="text-align: center;">
          <img src="${item.imageUrl}" style="max-width: 100%; max-height: 60vh; border-radius: 12px; margin: 10px 0; object-fit: contain;">
          <p style="font-size: 14px; color: #666; margin-top: 10px;">
            <ion-icon name="calendar-outline" style="vertical-align: middle; margin-right: 5px;"></ion-icon>
            ${item.createdAt?.toDate().toLocaleDateString() || 'Sin fecha'}
          </p>
        </div>
      `,
      buttons: [
        {
          text: 'Eliminar',
          cssClass: 'alert-danger-button',
          handler: () => this.confirmDelete(item)
        },
        {
          text: 'Cerrar',
          cssClass: 'alert-primary-button'
        }
      ]
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
          role: 'cancel',
          cssClass: 'alert-medium-button'
        }, {
          text: 'Eliminar',
          cssClass: 'alert-danger-button',
          handler: () => this.deleteItem(item)
        }
      ]
    });
    
    await alert.present();
  }
  
  async deleteItem(item: GalleryItem) {
    const loading = await this.loadingCtrl.create({
      message: 'Eliminando registro...',
      spinner: 'crescent',
      duration: 1500
    });
    await loading.present();
    
    try {
      const itemRef = doc(this.firestore, 'gallery', item.id);
      await deleteDoc(itemRef);
      
      this.galleryItems = this.galleryItems.filter(i => i.id !== item.id);
      this.filteredItems = this.filteredItems.filter(i => i.id !== item.id);
      this.showToast('Registro eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error al eliminar:', error);
      this.showToast('Error al eliminar el registro', 'danger');
    }
  }
  
  handleImageError(event: any) {
    event.target.src = 'assets/placeholder-image.png';
  }
  
  scrollToTop() {
    this.content.scrollToTop(500);
  }
  
  private async showToast(message: string, color: string = 'success') {
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