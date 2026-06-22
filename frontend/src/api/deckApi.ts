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
  listMine: () => apiClient.request<Deck[]>("/api/decks/mine"),
  listPublic: () => apiClient.request<Deck[]>("/api/decks/public"),
  get: (id: number) => apiClient.request<Deck>(`/api/decks/${id}`),
  create: (payload: CreateDeckPayload) =>
    apiClient.request<Deck>("/api/decks", { method: "POST", body: JSON.stringify(payload) }),
  listCards: (deckId: number) => apiClient.request<DeckCard[]>(`/api/decks/${deckId}/cards`),
  addCard: (deckId: number, payload: AddCardPayload) =>
    apiClient.request<DeckCard>(`/api/decks/${deckId}/cards`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteCard: (deckId: number, flashcardId: number) =>
    apiClient.request<void>(`/api/decks/${deckId}/cards/${flashcardId}`, { method: "DELETE" }),
};

export default deckApi;
