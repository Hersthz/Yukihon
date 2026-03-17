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
    apiClient.request<TranslateResponse>("/api/translation/translate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getHistory: (page = 0, size = 20) =>
    apiClient.request<TranslationHistoryResponse>(`/api/translation/history?page=${page}&size=${size}`),
  getBookmarks: () => apiClient.request<TranslationHistoryItem[]>("/api/translation/bookmarks"),
  toggleBookmark: (historyId: number) =>
    apiClient.request<TranslationHistoryItem>(`/api/translation/history/${historyId}/bookmark`, {
      method: "POST",
    }),
  deleteHistory: (historyId: number) => apiClient.request(`/api/translation/history/${historyId}`, { method: "DELETE" }),
  clearHistory: () => apiClient.request("/api/translation/history", { method: "DELETE" }),
  getStats: () => apiClient.request<TranslationStats>("/api/translation/stats"),
};
