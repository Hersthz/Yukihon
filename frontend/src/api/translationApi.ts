import apiClient from "@/lib/apiClient";

export interface TranslatePayload {
  sourceLang: string;
  targetLang: string;
  text: string;
}

export interface TranslateResponse {
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  translatedText: string;
  detectedLang?: string;
  historyId: number;
}

export interface TranslationHistoryResponse {
  content: TranslationHistoryItem[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface TranslationStats {
  totalTranslations: number;
  totalBookmarks: number;
}

export interface TranslationHistoryItem {
  id: number;
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  translatedText: string;
  bookmarked: boolean;
  createdAt: string;
}

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
