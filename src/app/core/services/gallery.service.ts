// gallery.service.ts
import { Injectable, NgZone } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CustomToastService } from './custom-toast.service';
import { SupabaseService } from './supabase.service';
import { Foto } from '../models/foto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private COLLECTION_NAME = 'gallery';

  constructor(
    private firestore: AngularFirestore,
    private supabaseService: SupabaseService,
    private toastService: CustomToastService,
    private ngZone: NgZone
  ) {}

  async uploadImage(file: File, description: string): Promise<string> {
    return this.ngZone.run(async () => {
      try {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const filePath = `gallery/${fileName}`;

        const { url, path } = await this.supabaseService.uploadImage(file, filePath);

        const fotoData: Foto = {
          url,
          description,
          timestamp,
          fileName: file.name,
          supabasePath: path
        };

        const docRef = await this.firestore.collection(this.COLLECTION_NAME).add(fotoData);
        await this.toastService.success('Imagen subida correctamente');
        return docRef.id;
      } catch (error) {
        console.error('Error subiendo imagen:', error);
        await this.toastService.error('Error al subir la imagen');
        throw error;
      }
    });
  }

  getImages(): Observable<Foto[]> {
    return this.firestore
      .collection<Foto>(this.COLLECTION_NAME, ref => ref.orderBy('timestamp', 'desc'))
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data() as Foto;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
  }

  async deleteImage(foto: Foto): Promise<void> {
    try {
      if (!foto.id) throw new Error('ID de foto no válido');

      await this.supabaseService.deleteImage(foto.supabasePath);
      await this.firestore.collection(this.COLLECTION_NAME).doc(foto.id).delete();

      await this.toastService.success('Imagen eliminada correctamente');
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      await this.toastService.error('Error al eliminar la imagen');
      throw error;
    }
  }
}
