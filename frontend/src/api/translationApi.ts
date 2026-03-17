import { request } from "@/api/httpClient";

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
  translate(data: { sourceLang: string; targetLang: string; text: string }) {
    return request<{
      sourceLang: string;
      targetLang: string;
      sourceText: string;
      translatedText: string;
      detectedLang?: string;
      historyId: number;
    }>("/api/translation/translate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getHistory(page = 0, size = 20) {
    return request<{
      content: TranslationHistoryItem[];
      totalElements: number;
      totalPages: number;
      number: number;
    }>(`/api/translation/history?page=${page}&size=${size}`);
  },

  getBookmarks() {
    return request<TranslationHistoryItem[]>("/api/translation/bookmarks");
  },

  toggleBookmark(historyId: number) {
    return request<TranslationHistoryItem>(`/api/translation/history/${historyId}/bookmark`, {
      method: "POST",
    });
  },

  deleteHistory(historyId: number) {
    return request(`/api/translation/history/${historyId}`, { method: "DELETE" });
  },

  clearHistory() {
    return request("/api/translation/history", { method: "DELETE" });
  },

  getStats() {
    return request<{ totalTranslations: number; totalBookmarks: number }>("/api/translation/stats");
  },
};
