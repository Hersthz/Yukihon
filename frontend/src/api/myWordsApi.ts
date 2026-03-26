import apiClient from "@/lib/apiClient";

interface SaveWordPayload {
  vocabularyId: number;
  folderName?: string;
  personalNote?: string;
}

type ReviewRating = "AGAIN" | "HARD" | "GOOD" | "EASY";

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
  getStats: () => apiClient.request("/api/my-words/stats"),
};
