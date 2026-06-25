import apiClient from "@/lib/apiClient";

// NOTE: hand-written until backend rebuild + `npm run gen:api`, then switch to
// Schema<"QuizletCardProgressDto"> / Schema<"QuizletAnswerRequest">.
export type QuizletStatus = "NOT_STUDIED" | "STUDYING" | "MASTERED";

export interface QuizletCardProgress {
  flashcardId: number;
  status: QuizletStatus;
  correctCount: number;
  wrongCount: number;
}

export interface QuizletAnswer {
  deckId: number;
  flashcardId: number;
  correct: boolean;
}

export const quizletApi = {
  getProgress: (deckId: number) =>
    apiClient.get<QuizletCardProgress[]>(`/api/quizlet/study/${deckId}/progress`),
  answer: (body: QuizletAnswer) =>
    apiClient.post<QuizletCardProgress>("/api/quizlet/study/answer", body),
};

export default quizletApi;
