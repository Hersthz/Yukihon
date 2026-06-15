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

export const deckApi = {
  listMine: () => apiClient.request<Deck[]>("/api/decks/mine"),
  listPublic: () => apiClient.request<Deck[]>("/api/decks/public"),
  get: (id: number) => apiClient.request<Deck>(`/api/decks/${id}`),
  create: (payload: CreateDeckPayload) =>
    apiClient.request<Deck>("/api/decks", { method: "POST", body: JSON.stringify(payload) }),
};

export default deckApi;
