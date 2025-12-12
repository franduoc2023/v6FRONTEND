// src/app/auth/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Si ya está autenticado → permitir acceso
  if (auth.isAuthenticated()) {
    return true;
  }

  // Guardar returnUrl
  localStorage.setItem('returnUrl', state.url);

  // Redirigir a /login
  router.navigate(['/login']);

  return false;
};
