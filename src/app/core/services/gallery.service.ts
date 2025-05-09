import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomToastService } from './custom-toast.service';
import { SupabaseService } from './supabase.service';
import { Foto } from '../models/foto';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private COLLECTION_NAME = 'gallery';

  constructor(
    private firestore: AngularFirestore,
    private supabaseService: SupabaseService,
    private toastService: CustomToastService
  ) {}

  /**
   * Sube una imagen a Supabase y guarda sus datos en Firestore
   * @param file Archivo de imagen a subir
   * @param description Descripción de la imagen
   * @returns Promise<string> ID del documento creado
   */
  async uploadImage(file: File, description: string): Promise<string> {
    try {
      // Crear un nombre de archivo único basado en timestamp
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = `gallery/${fileName}`;
      
      // Subir imagen a Supabase
      const { url, path } = await this.supabaseService.uploadImage(file, filePath);
      
      // Crear objeto de foto para Firestore
      const fotoData: Foto = {
        url: url,
        description: description,
        timestamp: timestamp,
        fileName: file.name,
        supabasePath: path
      };
      
      // Guardar en Firestore
      const docRef = await this.firestore.collection(this.COLLECTION_NAME).add(fotoData);
      
      // Notificar éxito
      this.toastService.success('Imagen subida correctamente');
      return docRef.id;
    } catch (error) {
      console.error('Error en el proceso de subida:', error);
      this.toastService.error('Error al procesar la imagen');
      throw error;
    }
  }

  /**
   * Obtiene todas las imágenes de la galería
   * @returns Observable<Foto[]> Lista de fotos
   */
  getImages(): Observable<Foto[]> {
    return this.firestore.collection<Foto>(this.COLLECTION_NAME, ref => 
      ref.orderBy('timestamp', 'desc')
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Foto;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  /**
   * Elimina una imagen de Supabase y Firestore
   * @param foto Datos de la foto a eliminar
   * @returns Promise<void>
   */
  async deleteImage(foto: Foto): Promise<void> {
    try {
      if (!foto.id) {
        throw new Error('ID de foto no válido');
      }
      
      // Si tenemos la ruta en Supabase, eliminar la imagen de Supabase
      if (foto.supabasePath) {
        await this.supabaseService.deleteImage(foto.supabasePath);
      }
      
      // Eliminar documento de Firestore
      await this.firestore.collection(this.COLLECTION_NAME).doc(foto.id).delete();
      
      this.toastService.success('Imagen eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      this.toastService.error('Error al eliminar la imagen');
      throw error;
    }
  }
}