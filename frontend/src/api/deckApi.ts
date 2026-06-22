import apiClient from "@/lib/apiClient";

export interface Deck {
  id: number;
  userId: number;
  title: string;
  description?: string | null;
  visibility: string;
  sourceLanguage?: string | null;
  targetLanguage?: string | null;
  totalCards: number;
  favoriteCount: number;
  updatedAt?: string | null;
}

export interface CreateDeckPayload {
  title: string;
  description?: string;
  visibility?: string;
}

export interface DeckCard {
  flashcardId: number;
  front: string;
  back: string;
  hint?: string | null;
  orderIndex: number;
}

export interface AddCardPayload {
  front: string;
  back: string;
  hint?: string;
}

export const deckApi = {
  listMine: () => apiClient.get<Deck[]>("/api/decks/mine"),
  listPublic: () => apiClient.get<Deck[]>("/api/decks/public"),
  get: (id: number) => apiClient.get<Deck>(`/api/decks/${id}`),
  create: (payload: CreateDeckPayload) => apiClient.post<Deck>("/api/decks", payload),
  listCards: (deckId: number) => apiClient.get<DeckCard[]>(`/api/decks/${deckId}/cards`),
  addCard: (deckId: number, payload: AddCardPayload) =>
    apiClient.post<DeckCard>(`/api/decks/${deckId}/cards`, payload),
  deleteCard: (deckId: number, flashcardId: number) =>
    apiClient.del<void>(`/api/decks/${deckId}/cards/${flashcardId}`),
};

export default deckApi;
