import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

type SaveWordPayload = Schema<"SaveWordRequest">;

type SavedStatusResponse = Record<string, boolean>;

type ReviewRating = "AGAIN" | "HARD" | "GOOD" | "EASY";

export type MyWordsStats = Schema<"SavedWordStatsDto">;

export const myWordsApi = {
  getAll: (folder?: string) => apiClient.get(`/api/my-words`, { folder }),
  getMastered: (mastered = true) => apiClient.get(`/api/my-words/mastered`, { mastered }),
  getReviewQueue: (mode = "ALL", dueOnly = true) =>
    apiClient.get(`/api/my-words/review`, { mode, dueOnly }),
  saveWord: (data: SaveWordPayload) => apiClient.post("/api/my-words", data),
  toggleMastered: (id: number) => apiClient.post(`/api/my-words/${id}/toggle-mastered`),
  reviewWord: (id: number, rating: ReviewRating) =>
    apiClient.post(`/api/my-words/${id}/review`, { rating }),
  updateNote: (id: number, note: string) => apiClient.put(`/api/my-words/${id}/note`, { note }),
  removeWord: (id: number) => apiClient.del(`/api/my-words/${id}`),
  isWordSaved: (vocabularyId: number) => apiClient.get(`/api/my-words/check/${vocabularyId}`),
  getSavedStatuses: (vocabularyIds: number[]) => {
    if (vocabularyIds.length === 0) {
      return Promise.resolve({});
    }
    return apiClient.get<SavedStatusResponse>(`/api/my-words/check`, { vocabularyIds });
  },
  getStats: () => apiClient.get<MyWordsStats>("/api/my-words/stats"),
};
