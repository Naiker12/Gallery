Galley 📸

Aplicación móvil para subir y gestionar fotos, desarrollada con Ionic Angular, Firebase y Supabase.
Mostrar imagen
Características ✨

Captura y selección de imágenes
Edición de fotos antes de guardar
Almacenamiento seguro en la nube
Listado de imágenes con descripciones
Widget nativo de Android (actualización automática)
Interfaz intuitiva y responsive

Tecnologías 🛠️

Frontend:

Ionic Angular
Capacitor
TypeScript


Backend:

Firebase Firestore (datos textuales)
Supabase Storage (imágenes)


Nativo:

Widget Android con Java
Glide para renderizado de imágenes



Pasos de Instalación 💻
Para instalar y ejecutar Galley, sigue estos pasos:

Clonar el repositorio:

bashgit clone https://github.com/tuusuario/galley-app.git
cd galley-app

Instalar dependencias:

bashnpm install

Configurar Firebase y Supabase (ver sección de configuración).
Ejecutar la aplicación:

bashionic serve
Configuración ⚙️
Firebase

Crea un proyecto en Firebase Console
Configura el archivo de entorno en src/environments/environment.ts:

typescriptexport const environment = {
  production: false,
  firebase: {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
  },
  supabase: {
    url: "TU_SUPABASE_URL",
    apiKey: "TU_SUPABASE_API_KEY"
  }
};
Supabase

Crea una cuenta en Supabase
Crea un nuevo proyecto y un bucket para almacenar las imágenes
Añade las credenciales de Supabase al archivo de entorno (como se muestra arriba)

Capacitor
Configura Capacitor para plataformas nativas:
bashnpx cap add android
npx cap add ios
