import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type Deck = Schema<"DeckDto">;
export type CreateDeckPayload = Schema<"CreateDeckRequest">;
export type DeckCard = Schema<"DeckCardDto">;
export type AddCardPayload = Schema<"AddCardRequest">;

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
