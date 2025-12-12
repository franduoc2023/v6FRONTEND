import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

import { environmentAndroid } from '../../environments/environment.android';

export interface UserProfile {
  name?: string;
  email?: string;
  oid?: string;
}

@Injectable({ providedIn: 'root' })
export class NativeAuthService {

  private accessToken: string | null = null;
  private idToken: string | null = null;
  private refreshToken: string | null = null;

  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  userProfile$ = this.profileSubject.asObservable();

  constructor(
    private http: HttpClient,
    private zone: NgZone          // 👈 importante para refrescar la UI
  ) {
    console.log('[NativeAuth] Constructor: registrando listener appUrlOpen...');
    this.initAppUrlListener();
  }

  get userProfile(): UserProfile | null {
    return this.profileSubject.value;
  }

  isAuthenticated(): boolean {
    return this.profileSubject.value != null;
  }

  private initAppUrlListener() {
    App.addListener('appUrlOpen', (data) => {
      // 👇 Todo lo que cambia estado Angular va dentro de zone.run
      this.zone.run(async () => {
        console.log('[NativeAuth] appUrlOpen recibido:', JSON.stringify(data));

        const callbackUrl = data.url ?? '';
        const redirectUri = environmentAndroid.azureB2C.redirectUri;

        console.log('[NativeAuth] redirectUri esperado:', redirectUri);
        console.log('[NativeAuth] callbackUrl:', callbackUrl);

        if (!callbackUrl.startsWith(redirectUri)) {
          console.warn('[NativeAuth] URL no coincide con redirectUri, se ignora');
          return;
        }

        try {
          await Browser.close();
        } catch (e) {
          console.warn('[NativeAuth] Error al cerrar Browser:', e);
        }

        const queryString = callbackUrl.split('?')[1] ?? '';
        const params = new URLSearchParams(queryString);
        const code = params.get('code');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        console.log('[NativeAuth] code:', code);
        console.log('[NativeAuth] error:', error);
        console.log('[NativeAuth] error_description:', errorDescription);

        if (error) {
          console.error('[NativeAuth] Error devuelto por B2C:', error, errorDescription);
          return;
        }

        if (!code) {
          console.error('[NativeAuth] No se recibió "code" en el callback');
          return;
        }

        await this.exchangeCodeForTokens(code);
      });
    });
  }

  async login(): Promise<void> {
    const azure = environmentAndroid.azureB2C;

    const authorizeUrl = new URL(
      `https://${azure.authorityDomain}/${azure.tenantName}/${azure.signInSignUpPolicy}/oauth2/v2.0/authorize`
    );

    const scopes = [
      'openid',
      'profile',
      'email',
      ...azure.apiScopes
    ].join(' ');

    authorizeUrl.searchParams.set('client_id', azure.clientId);
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('redirect_uri', azure.redirectUri);
    authorizeUrl.searchParams.set('scope', scopes);
    authorizeUrl.searchParams.set('response_mode', 'query');
    authorizeUrl.searchParams.set('state', crypto.randomUUID());

    console.log('[NativeAuth] Login URL:', authorizeUrl.toString());

    await Browser.open({
      url: authorizeUrl.toString(),
      presentationStyle: 'fullscreen'
    });
  }

  async logout(): Promise<void> {
    const azure = environmentAndroid.azureB2C;

    this.accessToken = null;
    this.idToken = null;
    this.refreshToken = null;
    this.profileSubject.next(null);

    const logoutUrl = new URL(
      `https://${azure.authorityDomain}/${azure.tenantName}/${azure.signInSignUpPolicy}/oauth2/v2.0/logout`
    );
    logoutUrl.searchParams.set('post_logout_redirect_uri', azure.redirectUri);

    console.log('[NativeAuth] Logout URL:', logoutUrl.toString());

    await Browser.open({ url: logoutUrl.toString() });
  }

  private async exchangeCodeForTokens(code: string): Promise<void> {
    const azure = environmentAndroid.azureB2C;

    const tokenUrl =
      `https://${azure.authorityDomain}/${azure.tenantName}/${azure.signInSignUpPolicy}/oauth2/v2.0/token`;

    console.log('[NativeAuth] Intercambiando code por tokens en:', tokenUrl);

    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', azure.clientId)
      .set('code', code)
      .set('redirect_uri', azure.redirectUri)
      .set('scope', [
        'openid',
        'profile',
        'email',
        ...azure.apiScopes
      ].join(' '));

    try {
      const resp: any = await firstValueFrom(
        this.http.post(tokenUrl, body.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
      );

      console.log('[NativeAuth] Respuesta de token OK:', resp);

      this.accessToken = resp['access_token'] ?? null;
      this.idToken = resp['id_token'] ?? null;
      this.refreshToken = resp['refresh_token'] ?? null;

      if (this.idToken) {
        const profile = this.decodeIdToken(this.idToken);
        console.log('[NativeAuth] Perfil decodificado:', profile);
        this.profileSubject.next(profile);
        console.log('[NativeAuth] profileSubject.value ahora:', this.profileSubject.value);
      } else {
        console.warn('[NativeAuth] No se recibió id_token');
      }
    } catch (err) {
      console.error('[NativeAuth] Error al intercambiar code por tokens:', err);
    }
  }

  private decodeIdToken(idToken: string): UserProfile {
    try {
      const payload = idToken.split('.')[1];
      const decoded = JSON.parse(
        atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      );

      const emailFromArray =
        Array.isArray(decoded.emails) && decoded.emails.length > 0
          ? decoded.emails[0]
          : null;

      return {
        name: decoded.given_name ?? decoded.name ?? null,
        email: emailFromArray ?? decoded.email ?? null,
        oid: decoded.oid ?? decoded.sub ?? null
      };
    } catch (e) {
      console.error('[NativeAuth] Error decodificando id_token', e);
      return {};
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }
}
