// supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { CustomToastService } from './custom-toast.service';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private readonly BUCKET = 'gallery';

  constructor(private toastService: CustomToastService) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async uploadImage(file: File, path: string): Promise<{ url: string; path: string }> {
    try {
      const { data, error } = await this.supabase.storage.from(this.BUCKET).upload(path, file);
      if (error) throw error;

      // Obtener URL pública
      const { data: publicUrlData } = this.supabase
        .storage
        .from(this.BUCKET)
        .getPublicUrl(path);

      const url = publicUrlData?.publicUrl ?? '';

      return { url, path };
    } catch (err) {
      console.error('Upload error:', err);
      await this.toastService.error('Error al subir imagen');
      throw err;
    }
  }

  async deleteImage(path: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage.from(this.BUCKET).remove([path]);
      if (error) throw error;
    } catch (err) {
      console.error('Delete error:', err);
      await this.toastService.error('Error al eliminar imagen');
      throw err;
    }
  }

  async createBucketIfNotExists(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.storage.createBucket(this.BUCKET, { public: true });
      if (error && !error.message.includes('already exists')) throw error;
      return true;
    } catch (err) {
      console.error('Bucket error:', err);
      return false;
    }
  }
}
