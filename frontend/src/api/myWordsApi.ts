import apiClient from "@/lib/apiClient";

interface SaveWordPayload {
  vocabularyId: number;
  folderName?: string;
  personalNote?: string;
}

export const myWordsApi = {
  getAll: (folder?: string) => {
    const params = folder ? `?folder=${encodeURIComponent(folder)}` : "";
    return apiClient.request(`/api/my-words${params}`);
  },
  getMastered: (mastered = true) => apiClient.request(`/api/my-words/mastered?mastered=${mastered}`),
  saveWord: (data: SaveWordPayload) =>
    apiClient.request("/api/my-words", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  toggleMastered: (id: number) => apiClient.request(`/api/my-words/${id}/toggle-mastered`, { method: "POST" }),
  updateNote: (id: number, note: string) =>
    apiClient.request(`/api/my-words/${id}/note`, {
      method: "PUT",
      body: JSON.stringify({ note }),
    }),
  removeWord: (id: number) => apiClient.request(`/api/my-words/${id}`, { method: "DELETE" }),
  isWordSaved: (vocabularyId: number) => apiClient.request(`/api/my-words/check/${vocabularyId}`),
  getStats: () => apiClient.request("/api/my-words/stats"),
};
