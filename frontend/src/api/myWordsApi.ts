import apiClient from "@/lib/apiClient";

interface SaveWordPayload {
  vocabularyId: number;
  folderName?: string;
  personalNote?: string;
}

type SavedStatusResponse = Record<string, boolean>;

type ReviewRating = "AGAIN" | "HARD" | "GOOD" | "EASY";

export interface MyWordsStats {
  totalSaved: number;
  masteredCount: number;
  dueTodayCount: number;
  kanjiDueTodayCount: number;
  vocabularyDueTodayCount: number;
  folders: string[];
}

export const myWordsApi = {
  getAll: (folder?: string) => {
    const params = folder ? `?folder=${encodeURIComponent(folder)}` : "";
    return apiClient.request(`/api/my-words${params}`);
  },
  getMastered: (mastered = true) => apiClient.request(`/api/my-words/mastered?mastered=${mastered}`),
  getReviewQueue: (mode = "ALL", dueOnly = true) =>
    apiClient.request(`/api/my-words/review?mode=${encodeURIComponent(mode)}&dueOnly=${dueOnly}`),
  saveWord: (data: SaveWordPayload) =>
    apiClient.request("/api/my-words", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  toggleMastered: (id: number) => apiClient.request(`/api/my-words/${id}/toggle-mastered`, { method: "POST" }),
  reviewWord: (id: number, rating: ReviewRating) =>
    apiClient.request(`/api/my-words/${id}/review`, {
      method: "POST",
      body: JSON.stringify({ rating }),
    }),
  updateNote: (id: number, note: string) =>
    apiClient.request(`/api/my-words/${id}/note`, {
      method: "PUT",
      body: JSON.stringify({ note }),
    }),
  removeWord: (id: number) => apiClient.request(`/api/my-words/${id}`, { method: "DELETE" }),
  isWordSaved: (vocabularyId: number) => apiClient.request(`/api/my-words/check/${vocabularyId}`),
  getSavedStatuses: (vocabularyIds: number[]) => {
    if (vocabularyIds.length === 0) {
      return Promise.resolve({});
    }
    const params = vocabularyIds.map((id) => `vocabularyIds=${encodeURIComponent(String(id))}`).join("&");
    return apiClient.request<SavedStatusResponse>(`/api/my-words/check?${params}`);
  },
  getStats: () => apiClient.request<MyWordsStats>("/api/my-words/stats"),
};
