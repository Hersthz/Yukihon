import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type SrsRating = "AGAIN" | "HARD" | "GOOD" | "EASY";

export type StudyCard = Schema<"AnkiStudyCardDto">;

export type StudyQueue = Schema<"AnkiStudyQueueDto">;

export type ReviewPayload = Schema<"AnkiReviewRequest">;

export const srsApi = {
  getQueue: (deckId: number) => apiClient.get<StudyQueue>(`/api/anki/study/${deckId}`),
  review: (payload: ReviewPayload) => apiClient.post<StudyCard>("/api/anki/study/review", payload),
};

export default srsApi;
