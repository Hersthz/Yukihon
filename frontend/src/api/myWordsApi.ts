import { request } from "@/api/httpClient";

export const myWordsApi = {
  getAll(folder?: string) {
    const params = folder ? `?folder=${encodeURIComponent(folder)}` : "";
    return request(`/api/my-words${params}`);
  },

  getMastered(mastered = true) {
    return request(`/api/my-words/mastered?mastered=${mastered}`);
  },

  saveWord(data: { vocabularyId: number; folderName?: string; personalNote?: string }) {
    return request("/api/my-words", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  toggleMastered(id: number) {
    return request(`/api/my-words/${id}/toggle-mastered`, { method: "POST" });
  },

  updateNote(id: number, note: string) {
    return request(`/api/my-words/${id}/note`, {
      method: "PUT",
      body: JSON.stringify({ note }),
    });
  },

  removeWord(id: number) {
    return request(`/api/my-words/${id}`, { method: "DELETE" });
  },

  isWordSaved(vocabularyId: number) {
    return request(`/api/my-words/check/${vocabularyId}`);
  },

  getStats() {
    return request("/api/my-words/stats");
  },
};
