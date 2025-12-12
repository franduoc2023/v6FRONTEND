// src/app/auth/auth.service.ts
import { Injectable, inject } from '@angular/core';
import {
  MsalService,
  MsalBroadcastService
} from '@azure/msal-angular';

import {
  AccountInfo,
  AuthenticationResult,
  InteractionStatus
} from '@azure/msal-browser';

import { filter } from 'rxjs/operators';
import { loginRequest } from './msal-angular.config';

import { NativeAuthService, UserProfile } from './native-auth.service';
import { Capacitor } from '@capacitor/core';
import { isNative, isWeb } from '../core/platform.util';

import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private msal = inject(MsalService);
  private broadcast = inject(MsalBroadcastService);
  private nativeAuth = inject(NativeAuthService);
  private router = inject(Router);

  currentUser: AccountInfo | null = null;
  userProfile: UserProfile | null = null;

  private readonly useWebMsal = isWeb();

  constructor() {
    console.log('[AuthService] Platform:', Capacitor.getPlatform());
    console.log('[AuthService] useWebMsal:', this.useWebMsal);

    if (this.useWebMsal) {
      this.setupWebMsal();
    } else if (isNative()) {
      this.nativeAuth.userProfile$.subscribe(profile => {
        this.userProfile = profile;
      });
    }
  }

  // ===================================
  // WEB LOGIN (MSAL)
  // ===================================
  private setupWebMsal() {
    const msal = this.msal;
    const broadcast = this.broadcast;

    // Captura retorno de redirect B2C
    msal.handleRedirectObservable().subscribe({
      next: (result: AuthenticationResult | null) => {
        if (result) {
          console.log('[AuthService] Login redirect result:', result);
          msal.instance.setActiveAccount(result.account);
          this.setProfileFromAccount(result.account);

          // Redirigir a returnUrl
          const returnUrl = localStorage.getItem('returnUrl') || '/home';
          localStorage.removeItem('returnUrl');
          this.router.navigate([returnUrl]);
        }
      },
      error: err => console.error('[AuthService] redirect error', err)
    });

    broadcast.inProgress$
      .pipe(filter(status => status === InteractionStatus.None))
      .subscribe(() => {
        const accounts = msal.instance.getAllAccounts();

        if (accounts.length > 0) {
          this.currentUser = accounts[0];
          this.setProfileFromAccount(this.currentUser);
        } else {
          this.currentUser = null;
          this.userProfile = null;
        }
      });
  }

  private setProfileFromAccount(account: AccountInfo | null) {
    if (!account || !account.idTokenClaims) {
      this.userProfile = null;
      return;
    }

    const claims: any = account.idTokenClaims;

    const email =
      Array.isArray(claims.emails) && claims.emails.length > 0
        ? claims.emails[0]
        : claims.email ?? null;

    this.userProfile = {
      name: claims.given_name ?? claims.name ?? null,
      email,
      oid: claims.oid ?? claims.sub ?? null
    };

    console.log('[AuthService] Profile loaded:', this.userProfile);
  }

  // ===================================
  // Login
  // ===================================
  async login(): Promise<void> {
    if (this.useWebMsal) {
      console.log('[AuthService] loginRedirect');
      await this.msal.loginRedirect(loginRequest);
    } else {
      await this.nativeAuth.login();
    }
  }

  // ===================================
  // Logout
  // ===================================
  async logout(): Promise<void> {
    if (this.useWebMsal) {
      this.currentUser = null;
      this.userProfile = null;
      await this.msal.logoutRedirect();
    } else {
      await this.nativeAuth.logout();
      this.userProfile = null;
    }
  }

  // ===================================
  // Estado autenticación
  // ===================================
  isAuthenticated(): boolean {
    if (this.useWebMsal) {
      const accounts = this.msal.instance.getAllAccounts();
      const isLogged = accounts.length > 0;

      if (isLogged && !this.currentUser) {
        this.currentUser = accounts[0];
        this.setProfileFromAccount(this.currentUser);
      }

      return isLogged;
    }

    return this.nativeAuth.isAuthenticated();
  }
}
