import apiClient from "@/lib/apiClient";
import type { KanjiReviewRating, KanjiSrsRecord } from "@/lib/kanjiSrs";

export interface KanjiSrsServerRecord extends KanjiSrsRecord {
  id: number;
  dueForReview: boolean;
  mastered: boolean;
  createdAt: string;
  updatedAt: string;
}

export const kanjiSrsApi = {
  getAll: () => apiClient.request<KanjiSrsServerRecord[]>("/api/kanji-srs"),
  add: (character: string) =>
    apiClient.request<KanjiSrsServerRecord>("/api/kanji-srs", {
      method: "POST",
      body: JSON.stringify({ character }),
    }),
  importRecords: (records: KanjiSrsRecord[]) =>
    apiClient.request<KanjiSrsServerRecord[]>("/api/kanji-srs/import", {
      method: "POST",
      body: JSON.stringify({ records }),
    }),
  review: (character: string, rating: KanjiReviewRating) =>
    apiClient.request<KanjiSrsServerRecord>(`/api/kanji-srs/${encodeURIComponent(character)}/review`, {
      method: "POST",
      body: JSON.stringify({ rating }),
    }),
  remove: (character: string) =>
    apiClient.request(`/api/kanji-srs/${encodeURIComponent(character)}`, {
      method: "DELETE",
    }),
};
