import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type UserProgress = Schema<"UserProgressDto">;

export type UserProgressPayload = Schema<"UserProgressRequest">;

export const STORY_MODE_PROGRESS_VOCABULARY_ID = -1001;

const buildStoryModePayload = (notes: string): UserProgressPayload => ({
  vocabularyId: STORY_MODE_PROGRESS_VOCABULARY_ID,
  status: "IN_PROGRESS",
  notes,
});

export const progressApi = {
  getMine: () => apiClient.get<UserProgress[]>("/api/progress"),
  createForUser: (userId: number, payload: UserProgressPayload) =>
    apiClient.post<UserProgress>(`/api/progress/user/${userId}`, payload),
  update: (id: number, payload: UserProgressPayload) =>
    apiClient.put<UserProgress>(`/api/progress/${id}`, payload),
  getStoryModeProgress: async () => {
    const progress = await apiClient.get<UserProgress[]>("/api/progress");
    return progress.find((item) => item.vocabularyId === STORY_MODE_PROGRESS_VOCABULARY_ID) ?? null;
  },
  upsertStoryModeProgress: async (params: {
    userId: number;
    notes: string;
    progressId?: number | null;
  }) => {
    const payload = buildStoryModePayload(params.notes);

    if (params.progressId) {
      return apiClient.put<UserProgress>(`/api/progress/${params.progressId}`, payload);
    }

    const existing = await progressApi.getStoryModeProgress();
    if (existing?.id) {
      return apiClient.put<UserProgress>(`/api/progress/${existing.id}`, payload);
    }

    return apiClient.post<UserProgress>(`/api/progress/user/${params.userId}`, payload);
  },
};
