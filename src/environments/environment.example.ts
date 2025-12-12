// src/environments/environment.example.ts
// Copia este archivo a environment.ts y pon tus valores reales.

export const environment = {
  production: false,

  azureB2C: {
    tenantName: 'TU_TENANT.onmicrosoft.com',
    clientId: '00000000-0000-0000-0000-000000000000',

    signInSignUpPolicy: 'B2C_1_susi',
    passwordResetPolicy: 'B2C_1_passwordreset',
    editProfilePolicy: '',

    authorityDomain: 'tu-tenant.b2clogin.com',

    redirectUri: 'http://localhost:8100',
    postLogoutRedirectUri: 'http://localhost:8100',

    apiScopes: ['https://TU_TENANT.onmicrosoft.com/api/demo.read'],
    apiEndpoint: 'http://localhost:8080'
  }
};
