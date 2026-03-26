import apiClient from "@/lib/apiClient";

export interface UserProgress {
  id: number;
  userId: number;
  lessonId?: number | null;
  quizId?: number | null;
  vocabularyId?: number | null;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progressType?: string | null;
  score?: number | null;
  totalScore?: number | null;
  attemptCount?: number | null;
  notes?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface UserProgressPayload {
  lessonId?: number;
  quizId?: number;
  vocabularyId?: number;
  score?: number;
  totalScore?: number;
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  notes?: string;
}

export const progressApi = {
  getMine: () => apiClient.request<UserProgress[]>("/api/progress"),
  createForUser: (userId: number, payload: UserProgressPayload) =>
    apiClient.request<UserProgress>(`/api/progress/user/${userId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: UserProgressPayload) =>
    apiClient.request<UserProgress>(`/api/progress/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};
