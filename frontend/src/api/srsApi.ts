import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type SrsRating = "AGAIN" | "HARD" | "GOOD" | "EASY";

export type StudyCard = Schema<"AnkiStudyCardDto">;

export type StudyQueue = Schema<"AnkiStudyQueueDto">;

export type ReviewPayload = Schema<"AnkiReviewRequest">;

// NOTE: hand-written until backend is rebuilt + `npm run gen:api` regenerates schema.d.ts,
// then switch to Schema<"AnkiStatsDto"> / Schema<"AnkiSrsSettingDto">.
export interface AnkiStatsBucket {
  label: string;
  count: number;
}

export interface AnkiStats {
  totalCards: number;
  newCards: number;
  learningCards: number;
  relearningCards: number;
  reviewCards: number;
  suspendedCards: number;
  leechCards: number;
  studiedToday: number;
  dueToday: number;
  dueTomorrow: number;
  avgMemoryScore: number;
  avgEaseFactor: number;
  avgIntervalDays: number;
  totalReviews: number;
  totalLapses: number;
  futureReviews: AnkiStatsBucket[];
  intervalBuckets: AnkiStatsBucket[];
  easeBuckets: AnkiStatsBucket[];
}

export interface AnkiSrsSetting {
  algorithmConfigId?: number | null;
  algorithmType?: string;
  targetRetention?: number;
  maxReviewsPerDay?: number;
  maxItemsPerDay?: number;
  maximumIntervalDays?: number;
  suspendLeeches?: boolean;
  leechThreshold?: number;
}

export const srsApi = {
  getQueue: (deckId: number) => apiClient.get<StudyQueue>(`/api/anki/study/${deckId}`),
  review: (payload: ReviewPayload) => apiClient.post<StudyCard>("/api/anki/study/review", payload),
  getStats: (deckId: number) => apiClient.get<AnkiStats>(`/api/anki/study/${deckId}/stats`),
  getSettings: (deckId: number) =>
    apiClient.get<AnkiSrsSetting>(`/api/anki/study/${deckId}/settings`),
  updateSettings: (deckId: number, body: AnkiSrsSetting) =>
    apiClient.put<AnkiSrsSetting>(`/api/anki/study/${deckId}/settings`, body),
  setSuspended: (deckId: number, flashcardId: number, suspended: boolean) =>
    apiClient.post<void>(`/api/anki/study/${deckId}/cards/${flashcardId}/suspend`, { suspended }),
};

export default srsApi;
