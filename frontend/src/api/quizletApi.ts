import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

/** FE-side union (DTO field is a plain string in the schema). */
export type QuizletStatus = "NOT_STUDIED" | "STUDYING" | "MASTERED";

export type QuizletCardProgress = Schema<"QuizletCardProgressDto">;

export type QuizletAnswer = Schema<"QuizletAnswerRequest">;

export const quizletApi = {
  getProgress: (deckId: number) =>
    apiClient.get<QuizletCardProgress[]>(`/api/quizlet/study/${deckId}/progress`),
  answer: (body: QuizletAnswer) =>
    apiClient.post<QuizletCardProgress>("/api/quizlet/study/answer", body),
};

export default quizletApi;
