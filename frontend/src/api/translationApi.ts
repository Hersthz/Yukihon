import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type TranslatePayload = Schema<"TranslateRequest">;

export type TranslateResponse = Schema<"TranslateResponse">;

export type TranslationHistoryResponse = Schema<"PageTranslationHistoryDto">;

export interface TranslationStats {
  totalTranslations: number;
  totalBookmarks: number;
}

export type TranslationHistoryItem = Schema<"TranslationHistoryDto">;

export const translationApi = {
  translate: (data: TranslatePayload) =>
    apiClient.post<TranslateResponse>("/api/translation/translate", data),
  getHistory: (page = 0, size = 20) =>
    apiClient.get<TranslationHistoryResponse>("/api/translation/history", { page, size }),
  getBookmarks: () => apiClient.get<TranslationHistoryItem[]>("/api/translation/bookmarks"),
  toggleBookmark: (historyId: number) =>
    apiClient.post<TranslationHistoryItem>(`/api/translation/history/${historyId}/bookmark`),
  deleteHistory: (historyId: number) => apiClient.del(`/api/translation/history/${historyId}`),
  clearHistory: () => apiClient.del("/api/translation/history"),
  getStats: () => apiClient.get<TranslationStats>("/api/translation/stats"),
};
