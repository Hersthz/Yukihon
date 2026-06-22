import apiClient from "@/lib/apiClient";

export type SrsRating = "AGAIN" | "HARD" | "GOOD" | "EASY";

export interface StudyCard {
  flashcardId: number;
  front: string;
  back: string;
  hint?: string | null;
  explanation?: string | null;
  imageUrl?: string | null;
  audioUrl?: string | null;
  progressId?: number | null;
  state: string;
  easeFactor: number;
  intervalDays: number;
  reviewCount: number;
  lapses: number;
  memoryScore: number;
  nextReviewAt?: string | null;
  againPreview: string;
  hardPreview: string;
  goodPreview: string;
  easyPreview: string;
}

export interface StudyQueue {
  cards: StudyCard[];
  totalNew: number;
  totalLearning: number;
  totalReview: number;
  dueReviewCards: number;
}

export interface ReviewPayload {
  deckId: number;
  flashcardId: number;
  rating: SrsRating;
  score?: number;
  timeTakenMs?: number;
  sourceType?: string;
}

export const srsApi = {
  getQueue: (deckId: number) => apiClient.get<StudyQueue>(`/api/anki/study/${deckId}`),
  review: (payload: ReviewPayload) => apiClient.post<StudyCard>("/api/anki/study/review", payload),
};

export default srsApi;
