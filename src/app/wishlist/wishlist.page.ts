// src/app/wishlist/wishlist.page.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonThumbnail,
  IonSpinner
} from '@ionic/angular/standalone';

import {
  UserService,
  WishlistItemDto
} from '../services/user.service';

import {
  CatalogService,
  WineDto,
  CheeseDto
} from '../services/catalog.service';

import { forkJoin } from 'rxjs';

/**
 * Modelo de vista para un ítem en la página de Wishlist.
 * Combina la información básica de la wishlist (id, productId, tipo)
 * con los datos enriquecidos del catálogo (nombre, descripción, imagen, etc.).
 */
export interface WishlistViewItem {
  /** Identificador del registro en la colección de wishlist (backend). */
  wishlistId: string;

  /** Identificador del producto en el catálogo (vino o queso). */
  productId: string;

  /** Tipo de producto resuelto a partir del catálogo (vino o queso). */
  productType: 'WINE' | 'CHEESE' | null;

  /** Fecha de creación en la wishlist (cuando el usuario lo agregó). */
  createdAt?: string;

  /** Nombre del producto mostrado en la tarjeta. */
  name: string;

  /** Descripción corta del producto. */
  description?: string | null;

  /** URL de la imagen del producto. */
  imageUrl?: string | null;

  /** Precio del producto. */
  price?: number | null;

  /** Origen del vino o queso. */
  origin?: string | null;

  /**
   * Flag usado en la animación de eliminación.
   * Si es true, se aplica una clase CSS con efecto de salida (fade-out).
   */
  removing?: boolean;
}

/**
 * Página de Wishlist.
 *
 * - Obtiene los ítems de wishlist del servicio de usuarios.
 * - Enlaza cada ítem con sus datos en el catálogo (vinos y quesos).
 * - Permite eliminar productos de la wishlist con una animación suave.
 */
@Component({
  selector: 'app-wishlist',
  standalone: true,
  templateUrl: './wishlist.page.html',
  styleUrls: ['./wishlist.page.scss'],
  imports: [
    CommonModule,
    NgIf,
    NgForOf,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonThumbnail,
    IonSpinner
  ]
})
export class WishlistPage implements OnInit {

  /** Servicio de usuarios: expone el API de wishlist del backend. */
  private readonly userService = inject(UserService);

  /** Servicio de catálogo: expone las colecciones de vinos y quesos. */
  private readonly catalogService = inject(CatalogService);

  /**
   * Lista de ítems que se muestran en la UI.
   * Se construyen combinando la wishlist con los datos del catálogo.
   */
  items: WishlistViewItem[] = [];

  /** Indica si se está cargando la wishlist y/o el catálogo. */
  loading = false;

  /**
   * Hook de inicialización.
   * Al entrar en la página se dispara la carga de la wishlist.
   */
  ngOnInit(): void {
    this.loadWishlist();
  }

  /**
   * Carga los ítems de wishlist del usuario y los enriquece
   * con la información de vinos y quesos del catálogo.
   *
   * Flujo:
   * 1. Se obtiene la lista de WishlistItemDto del backend.
   * 2. Si está vacía, se limpia el array y se termina.
   * 3. Si hay datos, se traen vinos y quesos (forkJoin).
   * 4. Se resuelve cada productId contra vinos y, si no existe, contra quesos.
   * 5. Se construye un WishlistViewItem por cada entrada.
   */
  loadWishlist(): void {
    this.loading = true;

    this.userService.getMyWishlist().subscribe({
      next: (wishlist: WishlistItemDto[]) => {

        if (!wishlist || wishlist.length === 0) {
          this.items = [];
          this.loading = false;
          return;
        }

        // Traemos en paralelo las listas de vinos y quesos
        forkJoin({
          wines: this.catalogService.getWines(),
          cheeses: this.catalogService.getCheeses()
        }).subscribe({
          next: ({ wines, cheeses }: { wines: WineDto[]; cheeses: CheeseDto[] }) => {

            this.items = wishlist.map((w: WishlistItemDto) => {
              let name = w.productId;
              let description: string | null = null;
              let imageUrl: string | null = null;
              let price: number | null = null;
              let origin: string | null = null;
              let resolvedType: 'WINE' | 'CHEESE' | null = null;

              // 1) Intentar resolver como vino
              const wine = wines.find((x: WineDto) => x.id === w.productId);
              if (wine) {
                resolvedType = 'WINE';
                name = wine.nameEn;
                description = wine.descriptionEn ?? null;
                imageUrl = wine.imageUrl ?? null;
                price = wine.price ?? null;
                origin = wine.origin ?? null;
              } else {
                // 2) Si no es vino, intentar resolver como queso
                const cheese = cheeses.find((x: CheeseDto) => x.id === w.productId);
                if (cheese) {
                  resolvedType = 'CHEESE';
                  name = cheese.nameEn;
                  description = cheese.descriptionEn ?? null;
                  imageUrl = cheese.imageUrl ?? null;
                  price = cheese.price ?? null;
                  origin = cheese.origin ?? null;
                }
              }

              const viewItem: WishlistViewItem = {
                wishlistId: w.id,
                productId: w.productId,
                productType: resolvedType,
                createdAt: w.createdAt,
                name,
                description,
                imageUrl,
                price,
                origin
              };

              return viewItem;
            });

            this.loading = false;
          },
          error: () => {
            // Si falla el catálogo, al menos mostramos los IDs básicos de wishlist
            this.items = wishlist.map((w: WishlistItemDto) => ({
              wishlistId: w.id,
              productId: w.productId,
              productType: null,
              createdAt: w.createdAt,
              name: w.productId,
              description: null,
              imageUrl: null,
              price: null,
              origin: null
            }));

            this.loading = false;
          }
        });
      },
      error: () => {
        // Si falla la carga de wishlist, simplemente marcamos fin de loading
        this.loading = false;
      }
    });
  }

  /**
   * Elimina un ítem de la wishlist con una animación de salida (fade-out).
   *
   * Estrategia:
   * - Se marca el ítem con `removing = true` para aplicar la clase CSS.
   * - Se espera 350 ms para que se vea la animación.
   * - Se realiza un borrado optimista en el array local.
   * - Si el backend responde con error, se restaura el estado anterior.
   *
   * @param item Item de wishlist que se desea eliminar.
   */
  remove(item: WishlistViewItem & { removing?: boolean }): void {
    // Dispara la animación CSS de salida
    item.removing = true;

    setTimeout(() => {
      const backup = [...this.items];

      // Eliminación optimista en la UI
      this.items = this.items.filter(i => i.wishlistId !== item.wishlistId);

      this.userService.removeFromWishlist(item.wishlistId).subscribe({
        next: () => {
          // No se requiere lógica adicional en éxito:
          // la UI ya muestra el elemento eliminado.
        },
        error: () => {
          // Si el backend falla, restauramos la lista
          this.items = backup;
        }
      });
    }, 350);
  }
}
