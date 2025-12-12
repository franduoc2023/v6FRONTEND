SAVEURS MAISON – APP IONIC + ANGULAR CON AUTENTICACION AZURE B2C
---------------------------------------------------------------

Aplicacion desarrollada en Ionic + Angular (standalone) con login Azure AD B2C.
Compatible con Web y Android.

---------------------------------------------------------------
REQUISITOS
---------------------------------------------------------------
- Node.js 18+
- Ionic CLI (npm install -g @ionic/cli)
- Android Studio (para compilar en Android)
- Cuenta Azure B2C configurada
- Opcional recomendado: Compodoc para documentacion tecnica

---------------------------------------------------------------
CÓMO CLONAR Y EJECUTAR
---------------------------------------------------------------
1. Clonar repositorio:
   git clone https://github.com/franduoc2023/BFFteting
   cd saveurs-maison

2. Instalar dependencias:
   npm install

3. Crear archivo de entorno Android:
   (ruta: src/environments/environment.android.ts)

   export const environmentAndroid = {
     azureB2C: {
       tenantName: 'tutenlab.onmicrosoft.com',
       clientId: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
       authorityDomain: 'tutenlab.b2clogin.com',
       signInSignUpPolicy: 'B2C_1_signin_signup',
       redirectUri: 'com.saveurs.maison://auth',
       apiScopes: ['https://tutenlab.onmicrosoft.com/api/demo.read']
     }
   };

Este archivo queda adjuntado en la documentacion para el docente.

---------------------------------------------------------------
DOCUMENTACION TECNICA (COMPODOC)
---------------------------------------------------------------
Compodoc genera documentacion de:
- Componentes
- Servicios
- Rutas
- Interfaces
- Arquitectura
- Comentarios JSDoc

Instalar:
  npm install --save-dev @compodoc/compodoc

Agregar scripts en package.json:
  "docs": "compodoc -p tsconfig.json -s --port 4201 --theme material",
  "docs:build": "compodoc -p tsconfig.json --theme material"

Ejecutar servidor de documentacion:
  npm run docs
Disponible en:
  http://127.0.0.1:4201

Generar documentacion estatica:
  npm run docs:build

---------------------------------------------------------------
EJECUTAR EN WEB
---------------------------------------------------------------
ionic serve

---------------------------------------------------------------
EJECUTAR EN ANDROID
---------------------------------------------------------------
npm run build
npx cap sync android
npx cap open android

---------------------------------------------------------------
FLUJO DE LOGIN
---------------------------------------------------------------
- Boton Login abre Azure B2C
- Usuario se autentica
- Azure redirige a com.saveurs.maison://auth
- App guarda tokens
- Se carga el perfil
- Logout cierra sesion y limpia tokens
- Icono de logout aparece cuando hay sesion iniciada

---------------------------------------------------------------
ESTRUCTURA DEL PROYECTO
---------------------------------------------------------------
src/
  app/
    home/
    profile/
    catalog/
    wishlist/
    nav/
    footer/
    auth/
  environments/

---------------------------------------------------------------
FUNCIONALIDADES IMPLEMENTADAS
---------------------------------------------------------------
- Componente Nav agregado
- Componente Footer agregado
- app.component integrado con Nav y Footer globales
- Login mediante Azure B2C
- Menu hamburguesa responsivo
- Pagina Catalog con:
    - GET productos
    - Busqueda
    - Filtro wines/cheeses
    - Loading state
    - Empty state
- Pagina Wishlist con:
    - Tarjetas estilo catalogo
    - Boton Add to wishlist
    - Animacion fade-out al eliminar
- Pagina Profile reconstruida con:
    - Formulario reactivo
    - Validaciones elegantes sin alert
    - Mensajes de exito/error en UI
- CSS global corregido para compatibilidad con:
    - Chrome
    - Firefox
    - Brave

---------------------------------------------------------------
TESTEADO EN
---------------------------------------------------------------
- Android Emulator Pixel 6 API 33
- Chrome
- Firefox
- Brave

---------------------------------------------------------------
ISSUES DETECTADOS
---------------------------------------------------------------
- 7 vulnerabilidades pendientes (npm audit)
- Transiciones con detalles visuales
- Bug en menu hamburguesa mobile (CSS global)
- Carpeta "page" mal ubicada (requiere reorganizacion)

---------------------------------------------------------------
AUTORES
---------------------------------------------------------------
Mauricio Mora
Francisco Salinas
Duoc UC – Taller Aplicado de Software




    


