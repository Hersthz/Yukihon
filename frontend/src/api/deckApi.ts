import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type Deck = Schema<"DeckDto">;
export type CreateDeckPayload = Schema<"CreateDeckRequest">;
export type DeckCard = Schema<"DeckCardDto">;
export type AddCardPayload = Schema<"AddCardRequest">;
export type CardDetail = Schema<"CardDetailDto">;
export type FlashcardSide = Schema<"FlashcardSideDto">;
export type RenderedCard = Schema<"RenderedCardDto">;

export interface CardBlockInput {
  side: "FRONT" | "BACK" | "HINT";
  label?: string;
  contentType: string;
  contentValue: string;
}
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
  getCardDetail: (deckId: number, flashcardId: number) =>
    apiClient.get<CardDetail>(`/api/decks/${deckId}/cards/${flashcardId}`),
  renderCard: (deckId: number, flashcardId: number) =>
    apiClient.get<RenderedCard>(`/api/decks/${deckId}/cards/${flashcardId}/render`),
  setTemplate: (deckId: number, templateId: number | null) =>
    apiClient.put<Deck>(`/api/decks/${deckId}/template`, { templateId }),
  saveCardSides: (deckId: number, flashcardId: number, blocks: CardBlockInput[]) =>
    apiClient.put<CardDetail>(`/api/decks/${deckId}/cards/${flashcardId}/sides`, { blocks }),
  addCard: (deckId: number, payload: AddCardPayload) =>
    apiClient.post<DeckCard>(`/api/decks/${deckId}/cards`, payload),
  deleteCard: (deckId: number, flashcardId: number) =>
    apiClient.del<void>(`/api/decks/${deckId}/cards/${flashcardId}`),
};

export default deckApi;
