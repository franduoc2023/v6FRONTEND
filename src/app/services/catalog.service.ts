import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';

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

export type WineType = 'RED' | 'WHITE' | 'ROSE' | 'SPARKLING';
export type WineFlavor =
  | 'FRUITY' | 'FLORAL' | 'DRY' | 'ACIDIC' | 'SWEET' | 'OAKY'
  | 'SOFT_TANNINS' | 'MEDIUM_TANNINS' | 'HIGH_TANNINS' | 'MINERAL';

export interface WineDto {
  id: string;
  nameEn: string;
  nameFr: string;
  descriptionEn: string;
  descriptionFr: string;
  imageUrl: string;
  origin: string;
  grape: string;
  type: WineType;
  flavors: WineFlavor[];
  sweetnessLevel: number;
  body: number;
  price: number;
  available: boolean;
  alcoholPercentage: number;
  servingTemperature: string;
}

export type CheeseType = 'SOFT' | 'SEMI_SOFT' | 'SEMI_HARD' | 'HARD' | 'BLUE' | 'FRESH';
export type CheeseFlavor =
  | 'CREAMY' | 'MILD' | 'STRONG' | 'SALTY' | 'SMOKY'
  | 'BUTTERY' | 'DAIRY' | 'EARTHY' | 'FRUITY';

export interface CheeseDto {
  id: string;
  nameEn: string;
  nameFr: string;
  descriptionEn: string;
  descriptionFr: string;
  imageUrl: string;
  origin: string;
  type: CheeseType;
  flavors: CheeseFlavor[];
  intensity: number;
  price: number;
  available: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private baseUrl = environment.catalogApiBaseUrl;

  constructor(private http: HttpClient) {}

  getWines(): Observable<WineDto[]> {
    return this.http
      .get<ApiResponse<WineDto[]>>(`${this.baseUrl}/wines`)
      .pipe(map(res => res.data));
  }

  getCheeses(): Observable<CheeseDto[]> {
    return this.http
      .get<ApiResponse<CheeseDto[]>>(`${this.baseUrl}/cheeses`)
      .pipe(map(res => res.data));
  }
}
