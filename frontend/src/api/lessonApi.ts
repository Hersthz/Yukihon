import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type LessonDto = Schema<"LessonDto">;

export type LessonVersionDto = Schema<"LessonVersionDto">;

export const lessonApi = {
  getAll: () => apiClient.get<LessonDto[]>("/api/lessons"),
  getPublished: () => apiClient.get<LessonDto[]>("/api/lessons/published"),
  getById: (id: number) => apiClient.get<LessonDto>(`/api/lessons/${id}`),
  getVersions: (id: number) => apiClient.get<LessonVersionDto[]>(`/api/lessons/${id}/versions`),
  getByLevel: (level: string) =>
    apiClient.get<LessonDto[]>(`/api/lessons/published/level/${level}`),
  getByCategory: (category: string) =>
    apiClient.get<LessonDto[]>(`/api/lessons/published/category/${category}`),
  create: (data: Record<string, unknown>) => apiClient.post<LessonDto>("/api/lessons", data),
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.put<LessonDto>(`/api/lessons/${id}`, data),
  delete: (id: number) => apiClient.del<void>(`/api/lessons/${id}`),
};
