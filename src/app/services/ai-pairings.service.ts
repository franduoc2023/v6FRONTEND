// src/app/services/ai-pairings.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  AiPairingRequest,
  AiPairingResponse,
  AiPairingHistoryItem
} from '../core/models/ai-pairings.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AiPairingsService {

  private readonly baseUrl = environment.aiApiBaseUrl;

  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private buildHeadersWithUserId(): HttpHeaders {
    let headers = new HttpHeaders();

    const profile = this.auth.userProfile;
    if (profile?.oid) {
      headers = headers.set('X-User-Id', profile.oid);
    }

    return headers;
  }

  /**
   * Envía un mensaje al BFF, que a su vez llama al MS de IA.
   * Si el usuario está logeado, agregamos X-User-Id con el oid de B2C.
   */
  chat(request: AiPairingRequest): Observable<AiPairingResponse> {
    const headers = this.buildHeadersWithUserId();

    return this.http.post<AiPairingResponse>(
      `${this.baseUrl}/pairings/chat`,
      request,
      { headers }
    );
  }

  /**
   * Obtiene el historial de recomendaciones del usuario.
   * Si no hay userId, el BFF devolverá [].
   */
  getHistory(): Observable<AiPairingHistoryItem[]> {
    const headers = this.buildHeadersWithUserId();

    return this.http.get<AiPairingHistoryItem[]>(
      `${this.baseUrl}/pairings/history`,
      { headers }
    );
  }
}
