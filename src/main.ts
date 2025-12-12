// src/main.ts
import { APP_INITIALIZER } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline } from 'ionicons/icons';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

import {
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalService,
  MsalGuard,
  MsalInterceptor,
  MsalBroadcastService
} from '@azure/msal-angular';

import {
  IPublicClientApplication,
  PublicClientApplication
} from '@azure/msal-browser';

import {
  msalConfig,
  msalGuardConfig,
  msalInterceptorConfig
} from './app/auth/msal-angular.config';

import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS
} from '@angular/common/http';

// ============================================
// FACTORIES
// ============================================

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig);
}

export function MSALInitializerFactory(msalService: MsalService) {
  return () => msalService.instance.initialize();
}

// ============================================
// BOOTSTRAP
// ============================================
addIcons({
  'person-circle-outline': personCircleOutline
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

    provideIonicAngular(),
    provideRouter(routes),

    provideHttpClient(withInterceptorsFromDi()),

    // MSAL Providers
    { provide: MSAL_INSTANCE, useFactory: MSALInstanceFactory },
    { provide: MSAL_GUARD_CONFIG, useValue: msalGuardConfig },
    { provide: MSAL_INTERCEPTOR_CONFIG, useValue: msalInterceptorConfig },

    //{ provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true },

    MsalService,
    MsalGuard,
    MsalBroadcastService,

    {
      provide: APP_INITIALIZER,
      useFactory: MSALInitializerFactory,
      deps: [MsalService],
      multi: true
    }
  ]



  
});
