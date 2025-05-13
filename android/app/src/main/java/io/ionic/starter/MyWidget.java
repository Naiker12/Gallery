package io.ionic.starter;


import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Log;
import android.widget.RemoteViews;

import android.os.Handler;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URL;

public class MyWidget extends AppWidgetProvider {

  private Handler handler = new Handler();
  private int currentIndex = 0;

  @Override
  public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {

    SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
    String json = prefs.getString("mediaRecords", "[]");
    try{
      JSONArray array = new JSONArray(json);
      Log.d("MyWidget", "Array " + json);
      if (array.length() > 0) {
        updateImage(context, appWidgetManager, appWidgetIds, array);
      }
    }catch (Exception e){
      Log.d("MyWidget", "Error in update " + e);
    }
  }

  private void updateImage(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds, JSONArray array) {
    Runnable runnable = new Runnable() {
      @Override
      public void run() {
        new Thread(() -> {
          try {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.my_widget);
            JSONObject item = array.getJSONObject(currentIndex);
            String msg = item.optString("description");
            String imageUrl = item.optString("imageUrl");

            Log.d("MyWidget", "msg: " + msg + ", image: " + imageUrl);

            Bitmap bitmap = downloadImage(imageUrl);

            views.setTextViewText(R.id.widget_description, msg);
            if (bitmap != null) {
              views.setImageViewBitmap(R.id.widget_image, bitmap);
            }

            for (int id : appWidgetIds) {
              appWidgetManager.updateAppWidget(id, views);
            }

            currentIndex = (currentIndex + 1) % array.length();
            handler.postDelayed(this, 5000);
          } catch (Exception e) {
            Log.d("MyWidget" , "Error em update " + e);
          }
        }).start();
      }
    };
    handler.postDelayed(runnable, 5000);
  }

  public Bitmap downloadImage(String urlString) {
    final int MAX_PIXELS = 400;
    try {
      URL url = new URL(urlString);
      InetAddress address = InetAddress.getByName("wfffmthnzljefqdxfozf.supabase.co");
      HttpURLConnection connection = (HttpURLConnection) url.openConnection();
      connection.setDoInput(true);
      connection.connect();
      InputStream input = connection.getInputStream();

      BitmapFactory.Options options = new BitmapFactory.Options();
      options.inJustDecodeBounds = true;
      BitmapFactory.decodeStream(input, null, options);
      input.close();

      int height = options.outHeight;
      int width = options.outWidth;

      int inSampleSize = 1;
      if (height > MAX_PIXELS || width > MAX_PIXELS) {
        int halfHeight = height / 2;
        int halfWidth = width / 2;

        while ((halfHeight / inSampleSize) >= MAX_PIXELS && (halfWidth / inSampleSize) >= MAX_PIXELS) {
          inSampleSize *= 2;
        }
      }

      options.inSampleSize = inSampleSize;
      options.inJustDecodeBounds = false;

      connection = (HttpURLConnection) url.openConnection();
      connection.setDoInput(true);
      connection.connect();
      input = connection.getInputStream();
      Bitmap scaledBitmap = BitmapFactory.decodeStream(input, null, options);
      input.close();

      return scaledBitmap;
    } catch (Exception e) {
      Log.e("MyWidget", "Error descargando imagen: " + e.getMessage());
      return null;
    }
  }

}
