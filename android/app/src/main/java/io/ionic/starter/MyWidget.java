package io.ionic.starter;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.util.Log;
import android.widget.RemoteViews;

import java.io.File;

public class MyWidget extends AppWidgetProvider {
  private static final String TAG = "MyWidget";

  static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
    try {
      RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.my_widget);

      // Obtener datos desde SharedPreferences (comparte con Capacitor)
      SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
      String imageUrl = prefs.getString("widget_image", "");
      String description = prefs.getString("widget_description", "Sin descripción");

      // Actualizar el texto de descripción
      views.setTextViewText(R.id.widget_description, description);

      // Cargar imagen si existe
      if (!imageUrl.isEmpty()) {
        try {
          // Comprobar si la imagen es un archivo local
          File imageFile = new File(imageUrl);
          if (imageFile.exists()) {
            Bitmap bitmap = BitmapFactory.decodeFile(imageFile.getAbsolutePath());
            if (bitmap != null) {
              views.setImageViewBitmap(R.id.widget_image, bitmap);
              Log.d(TAG, "Imagen cargada desde archivo local: " + imageUrl);
            } else {
              Log.e(TAG, "No se pudo decodificar la imagen: " + imageUrl);
            }
          } else {
            // Intentar cargar como URI
            views.setImageViewUri(R.id.widget_image, Uri.parse(imageUrl));
            Log.d(TAG, "Imagen cargada desde URI: " + imageUrl);
          }
        } catch (Exception e) {
          Log.e(TAG, "Error al cargar la imagen: " + e.getMessage());
        }
      }

      // Configurar intent para actualizar al hacer clic en el widget
      Intent updateIntent = new Intent(context, MyWidget.class);
      updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
      PendingIntent pendingUpdate = PendingIntent.getBroadcast(
        context, appWidgetId, updateIntent, PendingIntent.FLAG_IMMUTABLE);
      views.setOnClickPendingIntent(R.id.widget_image, pendingUpdate);

      // Actualizar el widget
      appWidgetManager.updateAppWidget(appWidgetId, views);
      Log.d(TAG, "Widget actualizado correctamente, ID: " + appWidgetId);
    } catch (Exception e) {
      Log.e(TAG, "Error en updateAppWidget: " + e.getMessage());
    }
  }

  @Override
  public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
    // Actualizar todos los widgets
    for (int appWidgetId : appWidgetIds) {
      updateAppWidget(context, appWidgetManager, appWidgetId);
    }

    // Configurar el refresco automático
    startTimer(context);
    Log.d(TAG, "onUpdate completado para " + appWidgetIds.length + " widgets");
  }

  @Override
  public void onEnabled(Context context) {
    // Se llama cuando se añade el primer widget
    super.onEnabled(context);
    Log.d(TAG, "Primer widget habilitado");
  }

  @Override
  public void onDisabled(Context context) {
    // Se llama cuando se elimina el último widget
    super.onDisabled(context);

    // Detener el timer
    try {
      Intent intent = new Intent(context, MyWidget.class);
      PendingIntent pendingIntent = PendingIntent.getBroadcast(
        context, 0, intent, PendingIntent.FLAG_IMMUTABLE);

      AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
      alarmManager.cancel(pendingIntent);
      Log.d(TAG, "Timer detenido, último widget deshabilitado");
    } catch (Exception e) {
      Log.e(TAG, "Error en onDisabled: " + e.getMessage());
    }
  }

  private void startTimer(Context context) {
    try {
      Intent intent = new Intent(context, MyWidget.class);
      intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);

      PendingIntent pendingIntent = PendingIntent.getBroadcast(
        context, 0, intent, PendingIntent.FLAG_IMMUTABLE
      );

      AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
      alarmManager.setRepeating(
        AlarmManager.RTC_WAKEUP,
        System.currentTimeMillis(),
        60000, // 1 minuto (en lugar de 5 segundos)
        pendingIntent
      );
      Log.d(TAG, "Timer iniciado para actualizar cada 60 segundos");
    } catch (Exception e) {
      Log.e(TAG, "Error en startTimer: " + e.getMessage());
    }
  }
}
