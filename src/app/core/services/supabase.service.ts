import { Injectable } from '@angular/core';
import { supabase, SUPABASE_BUCKET_NAME } from '../firebase/supabase-config';
import { CustomToastService } from './custom-toast.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  constructor(private toastService: CustomToastService) {
    // Ya no inicializamos el bucket automáticamente
  }

  /**
   * Método público para crear el bucket si es necesario
   * Puedes llamar a este método desde tu componente principal (por ejemplo, AppComponent)
   */
  async createBucketIfNotExists(): Promise<boolean> {
    try {
      // Intentar crear el bucket directamente
      // La mayoría de las APIs de Supabase manejan el caso cuando el bucket ya existe
      const { data, error } = await supabase.storage.createBucket(SUPABASE_BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024
      });
      
      if (error) {
        // Si el error es porque el bucket ya existe, no es realmente un error
        if (error.message && (
            error.message.includes('already exists') || 
            error.message.includes('ya existe')
          )) {
          console.log('El bucket ya existe:', SUPABASE_BUCKET_NAME);
          return true;
        }
        
        console.error('Error al crear bucket:', error);
        return false;
      }
      
      console.log('Bucket creado correctamente:', SUPABASE_BUCKET_NAME);
      return true;
    } catch (error) {
      console.error('Error inesperado al crear bucket:', error);
      return false;
    }
  }

  /**
   * Sube una imagen al bucket de Supabase
   * @param file Imagen a subir
   * @param path Ruta dentro del bucket
   * @returns URL pública de la imagen
   */
  async uploadImage(file: File, path: string): Promise<{ url: string, path: string }> {
    try {
      // Subir imagen a Supabase
      const { data, error } = await supabase.storage
        .from(SUPABASE_BUCKET_NAME)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from(SUPABASE_BUCKET_NAME)
        .getPublicUrl(data.path);

      return { 
        url: urlData.publicUrl, 
        path: data.path 
      };
    } catch (error) {
      console.error('Error al subir imagen a Supabase:', error);
      this.toastService.error('Error al subir imagen a Supabase');
      throw error;
    }
  }

  /**
   * Elimina una imagen del bucket de Supabase
   * @param path Ruta de la imagen a eliminar
   */
  async deleteImage(path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(SUPABASE_BUCKET_NAME)
        .remove([path]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error al eliminar imagen de Supabase:', error);
      this.toastService.error('Error al eliminar imagen de Supabase');
      throw error;
    }
  }
}