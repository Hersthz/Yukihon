import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

/** FE-side union (DTO field is a plain string in the schema). */
export type QuizletStatus = "NOT_STUDIED" | "STUDYING" | "MASTERED";

export type QuizletCardProgress = Schema<"QuizletCardProgressDto">;

export type QuizletAnswer = Schema<"QuizletAnswerRequest">;

export type QuizletSession = Schema<"QuizletSessionDto">;

export type StartSession = Schema<"StartSessionRequest">;

export type SessionAnswer = Schema<"SessionAnswerRequest">;

export const quizletApi = {
  getProgress: (deckId: number) =>
    apiClient.get<QuizletCardProgress[]>(`/api/quizlet/study/${deckId}/progress`),
  answer: (body: QuizletAnswer) =>
    apiClient.post<QuizletCardProgress>("/api/quizlet/study/answer", body),

  startSession: (body: StartSession) =>
    apiClient.post<QuizletSession>("/api/quizlet/study/sessions", body),
  sessionAnswer: (sessionId: number, body: SessionAnswer) =>
    apiClient.post<QuizletSession>(`/api/quizlet/study/sessions/${sessionId}/answer`, body),
  completeSession: (sessionId: number) =>
    apiClient.post<QuizletSession>(`/api/quizlet/study/sessions/${sessionId}/complete`, {}),
  listSessions: (deckId: number) =>
    apiClient.get<QuizletSession[]>(`/api/quizlet/study/sessions?deckId=${deckId}`),
};

export default quizletApi;
