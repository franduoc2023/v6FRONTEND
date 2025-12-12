// src/app/ai-pairings/ai-pairings.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonSpinner } from '@ionic/angular/standalone';

import { AiPairingsService } from 'src/app/services/ai-pairings.service';
import {
  AiPairingRequest,
  AiPairingResponse
} from 'src/app/core/models/ai-pairings.model';

import {
  CatalogService,
  WineDto,
  CheeseDto
} from 'src/app/services/catalog.service';

type SelectionMode = 'wine' | 'cheese';

@Component({
  selector: 'app-ai-pairings',
  standalone: true,
  templateUrl: './ai-pairings.page.html',
  styleUrls: ['./ai-pairings.page.scss'],
  imports: [CommonModule, FormsModule, NgIf, NgForOf, IonSpinner],
})
export class AiPairingsPage implements OnInit {

  // Catálogo
  mode: SelectionMode = 'wine';
  wines: WineDto[] = [];
  cheeses: CheeseDto[] = [];
  loadingCatalog = false;

  selectedWineId: string | null = null;
  selectedCheeseId: string | null = null;

  // IA
  message = '';
  locale: 'en' | 'es' | 'fr' = 'en';
  loadingAi = false;

  // Resultado
  lastResponse: AiPairingResponse | null = null;
  recommendedWines: WineDto[] = [];
  recommendedCheeses: CheeseDto[] = [];

  resultSource: 'catalog' | 'chat' | null = null;

  errorMsg = '';

  constructor(
    private aiPairingsService: AiPairingsService,
    private catalogService: CatalogService
  ) {}

  ngOnInit(): void {
    this.loadCatalog();
  }

  private loadCatalog(): void {
    this.loadingCatalog = true;

    this.catalogService.getWines().subscribe(w => this.wines = w);
    this.catalogService.getCheeses().subscribe({
      next: c => {
        this.cheeses = c;
        this.loadingCatalog = false;
      },
      error: () => this.loadingCatalog = false
    });
  }

  setMode(mode: SelectionMode): void {
    this.mode = mode;
    this.selectedWineId = null;
    this.selectedCheeseId = null;
    this.resetResults();
  }

  searchFromSelection(): void {
    const selectedWineIds =
      this.mode === 'wine' && this.selectedWineId ? [this.selectedWineId] : null;

    const selectedCheeseIds =
      this.mode === 'cheese' && this.selectedCheeseId ? [this.selectedCheeseId] : null;

    if (!selectedWineIds && !selectedCheeseIds) {
      this.errorMsg = 'Please select a product.';
      return;
    }

    const message =
      this.mode === 'wine'
        ? 'The user selected a wine from the catalog and wants ONLY cheese recommendations that pair well with this wine. Do NOT recommend any wines.'
        : 'The user selected a cheese from the catalog and wants ONLY wine recommendations that pair well with this cheese. Do NOT recommend any cheeses.';

    const request: AiPairingRequest = {
      message,
      locale: this.locale,
      selectedWineIds,
      selectedCheeseIds
    };

    this.resultSource = 'catalog';
    this.callAi(request);
  }

  sendPrompt(): void {
    if (!this.message.trim()) return;

    const request: AiPairingRequest = {
      message: this.message,
      locale: this.locale,
      selectedWineIds: null,
      selectedCheeseIds: null
    };

    this.resultSource = 'chat';
    this.callAi(request);
  }

  private callAi(request: AiPairingRequest): void {
    this.loadingAi = true;
    this.errorMsg = '';
    this.resetResults();

    this.aiPairingsService.chat(request).subscribe({
      next: (res) => {
        this.lastResponse = res;
        this.recommendedWines = this.resolveWines(res.recommendedWineIds);
        this.recommendedCheeses = this.resolveCheeses(res.recommendedCheeseIds);
        this.loadingAi = false;
      },
      error: () => {
        this.errorMsg = 'Error contacting AI service.';
        this.loadingAi = false;
      }
    });
  }

  private resolveWines(ids?: string[] | null): WineDto[] {
    return ids ? this.wines.filter(w => ids.includes(w.id)) : [];
  }

  private resolveCheeses(ids?: string[] | null): CheeseDto[] {
    return ids ? this.cheeses.filter(c => ids.includes(c.id)) : [];
  }

  private resetResults(): void {
    this.lastResponse = null;
    this.recommendedWines = [];
    this.recommendedCheeses = [];
  }
}
