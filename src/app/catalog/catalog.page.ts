// src/app/catalog/catalog.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { forkJoin } from 'rxjs';

// Ionic standalone
import {
  IonSearchbar,
  IonButton,
  IonCard,IonSpinner

} from '@ionic/angular/standalone';

// Router para usar [routerLink] en el HTML
import { RouterLink } from '@angular/router';

import {
  CatalogService,
  WineDto,
  CheeseDto
} from '../services/catalog.service';

import { UserService } from '../services/user.service';
import { AuthService } from '../auth/auth.service';

interface WishlistItem {
  id: string;
  productId: string;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  templateUrl: './catalog.page.html',
  styleUrls: ['./catalog.page.scss'],
  imports: [
    CommonModule,
    NgIf,
    NgForOf,
    IonSearchbar,
    IonButton,
    IonCard,       
    RouterLink ,    
    IonSpinner

  ]
})
export class CatalogPage implements OnInit {

  wines: WineDto[] = [];
  cheeses: CheeseDto[] = [];

  selectedType: 'wines' | 'cheeses' = 'wines';
  searchTerm: string = '';
loading = true;

  pageSize = 4;
  currentPage = 1;

  /** productos que están mostrando el mensaje "login to add" */
  loginHintSet: Set<string> = new Set<string>();

  /** productId -> wishlistItemId */
  wishlistMap: Map<string, string> = new Map<string, string>();

  constructor(
    private catalogService: CatalogService,
    private userService: UserService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadWishlist();
  }

 
  loadData(): void {
    this.loading = true;

    forkJoin({
      wines: this.catalogService.getWines(),
      cheeses: this.catalogService.getCheeses()
    }).subscribe({
      next: ({ wines, cheeses }) => {
        this.wines = wines;
        this.cheeses = cheeses;
      },
      error: (err) => {
         
       },
      complete: () => {
        this.loading = false;  
      }
    });
  }

 
  private loadWishlist(): void {
    if (!this.auth.isAuthenticated()) {
      return;
    }

    this.userService.getMyWishlist().subscribe({
      next: (items: WishlistItem[]) => {
        this.wishlistMap = new Map(
          items.map(it => [it.productId, it.id])
        );
      },
      error: () => {
       
      }
    });
  }
 
  get baseList() {
    return this.selectedType === 'wines' ? this.wines : this.cheeses;
  }

  get filteredList() {
    const text = this.searchTerm.toLowerCase().trim();
    if (!text) return this.baseList;

    return this.baseList.filter(item =>
      item.nameEn.toLowerCase().includes(text) ||
      item.origin.toLowerCase().includes(text)
    );
  }

  get paginatedList() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end   = start + this.pageSize;
    return this.filteredList.slice(start, end);
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filteredList.length / this.pageSize));
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  private resetPage() {
    this.currentPage = 1;
  }

  onSelect(type: 'wines' | 'cheeses') {
    this.selectedType = type;
    this.resetPage();
  }

  onSearch(event: any) {
    this.searchTerm = event.detail.value || '';
    this.resetPage();
  }

 
  isInWishlist(productId: string): boolean {
    return this.wishlistMap.has(productId);
  }

 
  toggleWishlist(item: WineDto | CheeseDto) {

    const productId = item.id;

    if (!this.auth.isAuthenticated()) {
      this.loginHintSet.add(productId);

      setTimeout(() => {
        this.loginHintSet.delete(productId);
      }, 1500);

      return;
    }

    const exists = this.isInWishlist(productId);

    if (exists) {
      const wishlistItemId = this.wishlistMap.get(productId)!;

      this.userService.removeFromWishlist(wishlistItemId).subscribe({
        next: () => {
          this.wishlistMap.delete(productId);
        },
        error: () => {
         }
      });

    } else {

      this.userService.addToWishlist(productId).subscribe({
        next: (saved: WishlistItem) => {
          this.wishlistMap.set(productId, saved.id);
        },
        error: () => {
         }
      });
    }
  }

}



