import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type SrsRating = "AGAIN" | "HARD" | "GOOD" | "EASY";

export type StudyCard = Schema<"AnkiStudyCardDto">;

export type StudyQueue = Schema<"AnkiStudyQueueDto">;

export type ReviewPayload = Schema<"AnkiReviewRequest">;

export type AnkiStatsBucket = Schema<"Bucket">;

export type AnkiStats = Schema<"AnkiStatsDto">;

export type AnkiSrsSetting = Schema<"AnkiSrsSettingDto">;

export type AlgorithmConfig = Schema<"AlgorithmConfigDto">;

export type RescheduleResult = Schema<"RescheduleResultDto">;

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
  getAlgorithms: () => apiClient.get<AlgorithmConfig[]>("/api/anki/study/algorithms"),
  switchAlgorithm: (deckId: number, algorithmType: string) =>
    apiClient.post<AnkiSrsSetting>(`/api/anki/study/${deckId}/algorithm`, { algorithmType }),
  reschedule: (deckId: number, dryRun: boolean) =>
    apiClient.post<RescheduleResult>(`/api/anki/study/${deckId}/reschedule?dryRun=${dryRun}`, {}),
};

export default srsApi;
