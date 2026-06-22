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
