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

export const STORY_MODE_PROGRESS_VOCABULARY_ID = -1001;

const buildStoryModePayload = (notes: string): UserProgressPayload => ({
  vocabularyId: STORY_MODE_PROGRESS_VOCABULARY_ID,
  status: "IN_PROGRESS",
  notes,
});

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
  getStoryModeProgress: async () => {
    const progress = await apiClient.request<UserProgress[]>("/api/progress");
    return progress.find((item) => item.vocabularyId === STORY_MODE_PROGRESS_VOCABULARY_ID) ?? null;
  },
  upsertStoryModeProgress: async (params: { userId: number; notes: string; progressId?: number | null }) => {
    const payload = buildStoryModePayload(params.notes);

    if (params.progressId) {
      return apiClient.request<UserProgress>(`/api/progress/${params.progressId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    }

    const existing = await progressApi.getStoryModeProgress();
    if (existing?.id) {
      return apiClient.request<UserProgress>(`/api/progress/${existing.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    }

    return apiClient.request<UserProgress>(`/api/progress/user/${params.userId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
