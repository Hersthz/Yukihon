import apiClient from "@/lib/apiClient";

export interface QuizAttemptRequest {
  quizId: number;
  answer: string;
}

export interface QuizAttemptResponse {
  id: number;
  userId: number;
  quizId: number;
  answer: string;
  correct: boolean;
  score: number;
  mistakePattern?: string;
  attemptedAt: string;
}

export interface QuizSessionRequest {
  mode: string;
  totalQuestions: number;
  correctCount: number;
  weakestPattern?: string;
}

export interface QuizSessionResponse {
  id: number;
  userId: number;
  mode: string;
  totalQuestions: number;
  correctCount: number;
  accuracyRate: number;
  weakestPattern?: string;
  startedAt: string;
  completedAt: string;
}

interface QuizAttemptQuery {
  limit?: number;
  correct?: boolean;
}

interface QuizSessionQuery {
  limit?: number;
}

const buildAttemptQuery = (query?: QuizAttemptQuery) => {
  const params = new URLSearchParams();
  if (query?.limit != null) {
    params.set("limit", String(query.limit));
  }
  if (query?.correct != null) {
    params.set("correct", String(query.correct));
  }
  const suffix = params.toString();
  return suffix ? `?${suffix}` : "";
};

const buildSessionQuery = (query?: QuizSessionQuery) => {
  const params = new URLSearchParams();
  if (query?.limit != null) {
    params.set("limit", String(query.limit));
  }
  const suffix = params.toString();
  return suffix ? `?${suffix}` : "";
};

export const quizApi = {
  getAll: <T = unknown>() => apiClient.get<T>("/api/quizzes"),
  getById: (id: number) => apiClient.get(`/api/quizzes/${id}`),
  getByLesson: (lessonId: number) => apiClient.get(`/api/quizzes/lesson/${lessonId}`),
  getByLevel: (level: string) => apiClient.get(`/api/quizzes/level/${level}`),
  getByDifficulty: (difficulty: string) => apiClient.get(`/api/quizzes/difficulty/${difficulty}`),
  recordAttempt: (data: QuizAttemptRequest) =>
    apiClient.post<QuizAttemptResponse>("/api/quiz-attempts", data),
  getRecentAttempts: (query?: QuizAttemptQuery) =>
    apiClient.get<QuizAttemptResponse[]>(`/api/quiz-attempts${buildAttemptQuery(query)}`),
  recordSession: (data: QuizSessionRequest) =>
    apiClient.post<QuizSessionResponse>("/api/quiz-sessions", data),
  getRecentSessions: (query?: QuizSessionQuery) =>
    apiClient.get<QuizSessionResponse[]>(`/api/quiz-sessions${buildSessionQuery(query)}`),
  create: (data: Record<string, unknown>) => apiClient.post("/api/quizzes", data),
  update: (id: number, data: Record<string, unknown>) => apiClient.put(`/api/quizzes/${id}`, data),
  delete: (id: number) => apiClient.del(`/api/quizzes/${id}`),
};
