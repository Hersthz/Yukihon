import apiClient from "@/lib/apiClient";
import type { KanjiReviewRating, KanjiSrsRecord } from "@/lib/kanjiSrs";

export interface KanjiSrsServerRecord extends KanjiSrsRecord {
  id: number;
  dueForReview: boolean;
  mastered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KanjiSrsWeakKanji {
  character: string;
  intervalDays: number;
  easeFactor: number;
  repetitionCount: number;
  reviewCount: number;
  nextReviewAt?: string;
  reason: string;
}

export interface KanjiSrsRetentionPoint {
  date: string;
  reviewCount: number;
  retainedCount: number;
  forgottenCount: number;
  retentionRate: number;
}

export interface KanjiSrsDashboard {
  deckCount: number;
  dueTodayCount: number;
  overdueCount: number;
  masteredCount: number;
  learningCount: number;
  weakCount: number;
  reviewStreakDays: number;
  totalReviews: number;
  retentionRate: number;
  weakKanji: KanjiSrsWeakKanji[];
  retentionTrend: KanjiSrsRetentionPoint[];
}

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
