import apiClient from "@/lib/apiClient";

export interface LessonDto {
  id: number;
  title: string;
  description?: string;
  content?: string;
  jlptLevel?: string;
  category?: string;
  status?: string;
  orderIndex?: number;
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  relatedVocabularyIds?: string;
  relatedGrammarIds?: string;
  relatedQuizIds?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LessonVersionDto {
  id: number;
  lessonId: number;
  versionNumber: number;
  changeAction: string;
  title: string;
  createdAt?: string;
}

export const lessonApi = {
  getAll: () => apiClient.request<LessonDto[]>("/api/lessons"),
  getPublished: () => apiClient.request<LessonDto[]>("/api/lessons/published"),
  getById: (id: number) => apiClient.request<LessonDto>(`/api/lessons/${id}`),
  getVersions: (id: number) => apiClient.request<LessonVersionDto[]>(`/api/lessons/${id}/versions`),
  getByLevel: (level: string) =>
    apiClient.request<LessonDto[]>(`/api/lessons/published/level/${level}`),
  getByCategory: (category: string) =>
    apiClient.request<LessonDto[]>(`/api/lessons/published/category/${category}`),
  create: (data: Record<string, unknown>) =>
    apiClient.request<LessonDto>("/api/lessons", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.request<LessonDto>(`/api/lessons/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) => apiClient.request<void>(`/api/lessons/${id}`, { method: "DELETE" }),
};
