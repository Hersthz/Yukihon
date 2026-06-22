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
  getAll: () => apiClient.request<KanjiSrsServerRecord[]>("/api/kanji-srs"),
  getDashboard: () => apiClient.request<KanjiSrsDashboard>("/api/kanji-srs/dashboard"),
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
    apiClient.request<KanjiSrsServerRecord>(
      `/api/kanji-srs/${encodeURIComponent(character)}/review`,
      {
        method: "POST",
        body: JSON.stringify({ rating }),
      }
    ),
  remove: (character: string) =>
    apiClient.request(`/api/kanji-srs/${encodeURIComponent(character)}`, {
      method: "DELETE",
    }),
};
