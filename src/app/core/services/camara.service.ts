import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { CustomToastService } from './custom-toast.service';

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  constructor(private toastService: CustomToastService) {}

  /**
   * Toma una foto con la cámara o selecciona una de la galería
   * @param source Origen de la imagen (cámara o galería)
   * @returns Promise con la imagen seleccionada y su URL para preview
   */
  async takePicture(source: 'camera' | 'gallery' = 'gallery'): Promise<{
    dataUrl: string;
    blob: Blob;
  } | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
        correctOrientation: true
      });

      if (!image || !image.dataUrl) {
        return null;
      }

      // Convertir dataUrl a blob de manera más segura
      const blob = this.dataUrlToBlob(image.dataUrl);
      if (!blob) {
        this.toastService.error('Formato de imagen no válido');
        return null;
      }
      
      return {
        dataUrl: image.dataUrl,
        blob: blob
      };
    } catch (error: any) { // Usar 'any' para poder acceder a propiedades del error
      console.error('Error al tomar/seleccionar imagen:', error);
      
      // Detectar cancelación de manera más robusta
      const errorMsg = error?.message?.toLowerCase() || '';
      if (errorMsg.includes('cancel') || 
          errorMsg.includes('cancelled') || 
          errorMsg.includes('denied') || 
          errorMsg.includes('permission')) {
        console.log('Usuario canceló la selección o denegó permisos');
        return null;
      }
      
      this.toastService.error('Error al acceder a la cámara o galería');
      return null;
    }
  }

  /**
   * Comprueba si el dispositivo tiene cámara disponible
   */
  isCameraAvailable(): boolean {
    return Capacitor.isPluginAvailable('Camera');
  }

  /**
   * Convierte un DataURL a Blob de manera segura
   * @param dataUrl DataURL a convertir
   * @returns Blob resultante o null si hay error
   */
  private dataUrlToBlob(dataUrl: string): Blob | null {
    try {
      const arr = dataUrl.split(',');
      if (arr.length !== 2) {
        console.error('Formato de dataUrl inválido');
        return null;
      }
      
      // Extraer el tipo MIME de manera más segura
      let mime = 'image/jpeg'; // Valor por defecto
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (mimeMatch && mimeMatch.length > 1) {
        mime = mimeMatch[1];
      } else {
        // Intentar detectar el tipo por extensiones comunes en el dataUrl
        if (arr[0].includes('image/png')) {
          mime = 'image/png';
        } else if (arr[0].includes('image/jpeg') || arr[0].includes('image/jpg')) {
          mime = 'image/jpeg';
        } else if (arr[0].includes('image/gif')) {
          mime = 'image/gif';
        } else if (arr[0].includes('image/webp')) {
          mime = 'image/webp';
        }
      }
      
      // Decodificar base64
      let bstr;
      try {
        bstr = atob(arr[1]);
      } catch (e) {
        console.error('Error al decodificar base64:', e);
        return null;
      }
      
      const n = bstr.length;
      const u8arr = new Uint8Array(n);
      
      for (let i = 0; i < n; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }
      
      return new Blob([u8arr], { type: mime });
    } catch (e) {
      console.error('Error al convertir dataUrl a Blob:', e);
      return null;
    }
  }

  /**
   * Convierte un Blob a un archivo File
   * @param blob Blob a convertir
   * @param fileName Nombre del archivo
   * @returns File resultante
   */
  blobToFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName, { type: blob.type });
  }
}