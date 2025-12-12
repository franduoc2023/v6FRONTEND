// src/app/auth/msal-angular.config.ts
import { environment } from '../../environments/environment';
import { LogLevel, InteractionType } from '@azure/msal-browser';
import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration
} from '@azure/msal-angular';

const azure = environment.azureB2C;

export const msalConfig = {
  auth: {
    clientId: azure.clientId,
    authority: `https://${azure.authorityDomain}/${azure.tenantName}/${azure.signInSignUpPolicy}`,
    knownAuthorities: [azure.authorityDomain],
    redirectUri: azure.redirectUri,
    postLogoutRedirectUri: azure.postLogoutRedirectUri
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning
    }
  }
};

export const loginRequest = {
  scopes: [
    'openid',
    'profile',
    'email',
    ...azure.apiScopes
  ]
};

export const msalGuardConfig: MsalGuardConfiguration = {
  interactionType: InteractionType.Redirect,
  authRequest: loginRequest
};

// Aunque no usemos el interceptor, dejamos la config lista
export const msalInterceptorConfig: MsalInterceptorConfiguration = {
  interactionType: InteractionType.Redirect,
  protectedResourceMap: new Map([
    [environment.azureB2C.apiEndpoint, azure.apiScopes]
  ])
};
