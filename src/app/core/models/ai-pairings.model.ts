// src/app/core/models/ai-pairings.model.ts
export interface AiPairingRequest {
  message: string;
  locale: string;
  selectedWineIds: string[] | null;
  selectedCheeseIds: string[] | null;
}

export interface AiPairingResponse {
  answer: string;
  recommendedWineIds: string[];
  recommendedCheeseIds: string[];
}

export interface AiPairingHistoryItem {
  id: string;
  userId: string | null;
  locale: string;
  source: string;
  message: string;
  selectedWineIds: string[] | null;
  selectedCheeseIds: string[] | null;
  answer: string;
  recommendedWineIds: string[];
  recommendedCheeseIds: string[];
  createdAt: string;
}
