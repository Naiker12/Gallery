import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class WidgetService {

  constructor() {}

  /**
   * Actualiza la información que se muestra en el widget
   * @param imageUrl Ruta de la imagen (puede ser un path local o URL)
   * @param description Texto descriptivo para mostrar en el widget
   */
  async updateWidgetInfo(imageUrl: string, description: string): Promise<void> {
    try {
      // Guardar la URL de la imagen
      await Preferences.set({
        key: 'widget_image',
        value: imageUrl
      });
      
      // Guardar la descripción
      await Preferences.set({
        key: 'widget_description',
        value: description
      });
      
      console.log('Información del widget actualizada correctamente');
    } catch (error) {
      console.error('Error al actualizar el widget:', error);
    }
  }
  
  /**
   * Obtiene la información actual del widget
   */
  async getWidgetInfo(): Promise<{imageUrl: string, description: string}> {
    const imageResult = await Preferences.get({ key: 'widget_image' });
    const descriptionResult = await Preferences.get({ key: 'widget_description' });
    
    return {
      imageUrl: imageResult.value || '',
      description: descriptionResult.value || 'Sin descripción'
    };
  }
}