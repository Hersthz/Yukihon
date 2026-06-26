import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type Deck = Schema<"DeckDto">;
export type CreateDeckPayload = Schema<"CreateDeckRequest">;
export type DeckCard = Schema<"DeckCardDto">;
export type AddCardPayload = Schema<"AddCardRequest">;
export type FavoriteToggle = Schema<"FavoriteToggleResult">;

export const deckApi = {
  listMine: () => apiClient.get<Deck[]>("/api/decks/mine"),
  listPublic: (params?: { search?: string; sort?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.sort) qs.set("sort", params.sort);
    const suffix = qs.toString();
    return apiClient.get<Deck[]>(`/api/decks/public${suffix ? `?${suffix}` : ""}`);
  },
  listFavorites: () => apiClient.get<Deck[]>("/api/decks/favorites"),
  toggleFavorite: (id: number) => apiClient.post<FavoriteToggle>(`/api/decks/${id}/favorite`, {}),
  get: (id: number) => apiClient.get<Deck>(`/api/decks/${id}`),
  create: (payload: CreateDeckPayload) => apiClient.post<Deck>("/api/decks", payload),
  clone: (id: number) => apiClient.post<Deck>(`/api/decks/${id}/clone`, {}),
  listCards: (deckId: number) => apiClient.get<DeckCard[]>(`/api/decks/${deckId}/cards`),
  addCard: (deckId: number, payload: AddCardPayload) =>
    apiClient.post<DeckCard>(`/api/decks/${deckId}/cards`, payload),
  deleteCard: (deckId: number, flashcardId: number) =>
    apiClient.del<void>(`/api/decks/${deckId}/cards/${flashcardId}`),
};

export default deckApi;
