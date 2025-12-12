// src/app/services/user.service.ts
import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
} from '@angular/common/http';

import { from, map, switchMap, throwError, Observable } from 'rxjs';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo } from '@azure/msal-browser';

import { environment } from '../../environments/environment';
import { loginRequest } from '../auth/msal-angular.config';

// =====================
// DTOs
// =====================

export interface UserProfileDto {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  language?: string | null;
  role?: string | null;
}

export interface UpdateUserProfileRequest {
  firstName: string;
  lastName: string;
  language: string;
}

export interface UserPreferencesDto {
  id: string;
  userId: string;
  preferredLanguage?: string | null;
  favoriteWineTypes?: string[] | null;
  favoriteCheeseTypes?: string[] | null;
  priceRangeMin?: number | null;
  priceRangeMax?: number | null;
}

export interface UpdateUserPreferencesRequest {
  preferredLanguage?: string;
  favoriteWineTypes?: string[];
  favoriteCheeseTypes?: string[];
  priceRangeMin?: number;
  priceRangeMax?: number;
}

export interface WishlistItemDto {
  id: string;
  userId: string;
  productId: string;
  productType: 'WINE' | 'CHEESE';
  createdAt?: string;
}

export interface WishlistItemRequest {
  productId: string;
  productType: 'WINE' | 'CHEESE';
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T> {
  data: T;
  error?: ApiError | null;
  timestamp: string;
  requestId?: string | null;
}


@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private msal = inject(MsalService);

  private baseUrl = environment.userApiBaseUrl;

  private scopes = loginRequest.scopes;

  constructor() {}
  private unwrapData<T>(res: any): T {
    if (res && typeof res === 'object' && 'data' in res) {
      const data = (res as ApiResponse<T>).data;
      console.log('[UserService] unwrapData: usando res.data', data);
      return data as T;
    }

    console.log('[UserService] unwrapData: usando respuesta plana', res);
    return res as T;
  }
  

  private getAccessToken$(): Observable<string> {
    const instance = this.msal.instance;

    let account: AccountInfo | null = instance.getActiveAccount();
    const allAccounts = instance.getAllAccounts();

    if (!account && allAccounts.length > 0) {
      account = allAccounts[0];
    }

    if (!account) {
      console.error('[UserService] No MSAL account found, user not logged in');
      return throwError(() => new Error('User not authenticated'));
    }

    return from(
      instance.acquireTokenSilent({
        scopes: this.scopes,
        account,
      })
    ).pipe(
      map((result) => {
        const access = result.accessToken;
        const id = (result as any).idToken;

        if (access && access.length > 0) {
          console.log('[UserService] Using accessToken');
          return access;
        }

        if (id && id.length > 0) {
          console.log('[UserService] accessToken vacío, usando idToken como Bearer');
          return id;
        }

        throw new Error('No access or id token returned');
      })
    );
  }

  private authHeaders$(additional?: { [k: string]: string }) {
    return this.getAccessToken$().pipe(
      map((token) => {
        const headersInit: { [k: string]: string } = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(additional || {}),
        };
        return new HttpHeaders(headersInit);
      })
    );
  }

  // =====================
  // PERFIL
  // =====================

  getMyProfile(): Observable<UserProfileDto> {
    const url = `${this.baseUrl}/me`;

    return this.authHeaders$().pipe(
      switchMap((headers) =>
        this.http.get<any>(url, { headers })
      ),
      map((res) => this.unwrapData<UserProfileDto>(res))
    );
  }

  updateMyProfile(
    request: UpdateUserProfileRequest
  ): Observable<UserProfileDto> {
    const url = `${this.baseUrl}/me`;

    return this.authHeaders$().pipe(
      switchMap((headers) =>
        this.http.put<any>(url, request, { headers })
      ),
      map((res) => this.unwrapData<UserProfileDto>(res))
    );
  }

  // =====================
  // PREFERENCIAS
  // =====================

  getMyPreferences(): Observable<UserPreferencesDto> {
    const url = `${this.baseUrl}/me/preferences`;

    return this.authHeaders$().pipe(
      switchMap((headers) =>
        this.http.get<any>(url, { headers })
      ),
      map((res) => this.unwrapData<UserPreferencesDto>(res))
    );
  }

  updateMyPreferences(
    request: UpdateUserPreferencesRequest
  ): Observable<UserPreferencesDto> {
    const url = `${this.baseUrl}/me/preferences`;

    return this.authHeaders$().pipe(
      switchMap((headers) =>
        this.http.put<any>(url, request, { headers })
      ),
      map((res) => this.unwrapData<UserPreferencesDto>(res))
    );
  }

  // =====================
  // WISHLIST
  // =====================

  getMyWishlist(): Observable<WishlistItemDto[]> {
    const url = `${this.baseUrl}/me/wishlist`;

    return this.authHeaders$().pipe(
      switchMap((headers) =>
        this.http.get<any>(url, { headers })
      ),
      map((res) => {
        const data = this.unwrapData<WishlistItemDto[] | null>(res);
        return (data ?? []) as WishlistItemDto[];
      })
    );
  }

  addToWishlist(
    productId: string,
    productType: 'WINE' | 'CHEESE' = 'WINE'
  ): Observable<WishlistItemDto> {
    const url = `${this.baseUrl}/me/wishlist`;
    const body: WishlistItemRequest = { productId, productType };

    return this.authHeaders$().pipe(
      switchMap((headers) =>
        this.http.post<any>(url, body, { headers })
      ),
      map((res) => this.unwrapData<WishlistItemDto>(res))
    );
  }

  removeFromWishlist(wishlistItemId: string) {
    const url = `${this.baseUrl}/me/wishlist/${wishlistItemId}`;

    return this.authHeaders$().pipe(
      switchMap((headers) =>
        this.http.delete<void>(url, { headers })
      )
    );
  }
}
