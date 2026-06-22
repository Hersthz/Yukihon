import apiClient from "@/lib/apiClient";
import type { KanjiReviewRating, KanjiSrsRecord } from "@/lib/kanjiSrs";
import type { Schema } from "@/api/types";

export type KanjiSrsServerRecord = Schema<"KanjiSrsDto">;

export type KanjiSrsWeakKanji = Schema<"KanjiSrsWeakKanjiDto">;

export type KanjiSrsRetentionPoint = Schema<"KanjiSrsRetentionPointDto">;

export type KanjiSrsDashboard = Schema<"KanjiSrsDashboardDto">;

export const kanjiSrsApi = {
  getAll: () => apiClient.get<KanjiSrsServerRecord[]>("/api/kanji-srs"),
  getDashboard: () => apiClient.get<KanjiSrsDashboard>("/api/kanji-srs/dashboard"),
  add: (character: string) => apiClient.post<KanjiSrsServerRecord>("/api/kanji-srs", { character }),
  importRecords: (records: KanjiSrsRecord[]) =>
    apiClient.post<KanjiSrsServerRecord[]>("/api/kanji-srs/import", { records }),
  review: (character: string, rating: KanjiReviewRating) =>
    apiClient.post<KanjiSrsServerRecord>(`/api/kanji-srs/${encodeURIComponent(character)}/review`, {
      rating,
    }),
  remove: (character: string) => apiClient.del(`/api/kanji-srs/${encodeURIComponent(character)}`),
};
