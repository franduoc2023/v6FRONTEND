// src/app/ai-history/ai-history.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonSpinner
} from '@ionic/angular/standalone';

import { AiPairingsService } from '../services/ai-pairings.service';
import { AiPairingHistoryItem } from '../core/models/ai-pairings.model';
import { AuthService } from '../auth/auth.service';

import {
  CatalogService,
  WineDto,
  CheeseDto
} from '../services/catalog.service';

@Component({
  selector: 'app-ai-history',
  standalone: true,
  templateUrl: './ai-history.page.html',
  styleUrls: ['./ai-history.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonChip,
    IonLabel,
    IonSpinner
  ]
})
export class AiHistoryPage implements OnInit {

  private aiService = inject(AiPairingsService);
  private auth = inject(AuthService);
  private catalog = inject(CatalogService);

  loading = false;
  items: AiPairingHistoryItem[] = [];

   wines: WineDto[] = [];
  cheeses: CheeseDto[] = [];
  loadingCatalog = false;

  get isLoggedIn(): boolean {
    return this.auth.isAuthenticated();
  }

  ngOnInit(): void {
    if (!this.isLoggedIn) {
      return;
    }

     this.loadCatalog();
    this.loadHistory();
  }

  private loadCatalog(): void {
    this.loadingCatalog = true;

    this.catalog.getWines().subscribe({
      next: (w) => this.wines = w,
      error: (err) => console.error('[AiHistoryPage] Error loading wines', err)
    });

    this.catalog.getCheeses().subscribe({
      next: (c) => {
        this.cheeses = c;
        this.loadingCatalog = false;
      },
      error: (err) => {
        console.error('[AiHistoryPage] Error loading cheeses', err);
        this.loadingCatalog = false;
      }
    });
  }

  private loadHistory(): void {
    this.loading = true;

    this.aiService.getHistory().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('[AiHistoryPage] Error loading history', err);
        this.loading = false;
      }
    });
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString();
  }

 
  resolveWinesFor(item: AiPairingHistoryItem): WineDto[] {
    if (!item.recommendedWineIds?.length) return [];
    return this.wines.filter(w => item.recommendedWineIds.includes(w.id));
  }

  resolveCheesesFor(item: AiPairingHistoryItem): CheeseDto[] {
    if (!item.recommendedCheeseIds?.length) return [];
    return this.cheeses.filter(c => item.recommendedCheeseIds.includes(c.id));
  }
}
