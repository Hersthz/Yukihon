import { request } from "@/api/httpClient";

type AuthHeaders = { headers?: Record<string, string> };

const withToken = (token?: string): AuthHeaders => {
  if (!token) return {};

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const get = <T>(endpoint: string, token?: string) => {
  return request<T>(endpoint, withToken(token));
};

const post = <T>(endpoint: string, data: unknown, token?: string) => {
  return request<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
    ...withToken(token),
  });
};

const put = <T>(endpoint: string, data?: unknown, token?: string) => {
  return request<T>(endpoint, {
    method: "PUT",
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    ...withToken(token),
  });
};

export const vocabularyAPI = {
  getAll: (token?: string) => get<unknown[]>("/api/vocabulary", token),
  getById: (id: number, token?: string) => get(`/api/vocabulary/${id}`, token),
  getByLevel: (level: string, token?: string) => get(`/api/vocabulary/level/${level}`, token),
  getAllLevels: (token?: string) => get<string[]>("/api/vocabulary/levels", token),
};

export const lessonAPI = {
  getAll: (token?: string) => get("/api/lessons", token),
  getPublished: (token?: string) => get("/api/lessons/published", token),
  getById: (id: number, token?: string) => get(`/api/lessons/${id}`, token),
  getByLevel: (level: string, token?: string) => get(`/api/lessons/published/level/${level}`, token),
  getByCategory: (category: string, token?: string) => get(`/api/lessons/published/category/${category}`, token),
};

export const grammarAPI = {
  getAll: (token?: string) => get("/api/grammar", token),
  getById: (id: number, token?: string) => get(`/api/grammar/${id}`, token),
  getByLevel: (level: string, token?: string) => get(`/api/grammar/level/${level}`, token),
  getAllLevels: (token?: string) => get<string[]>("/api/grammar/levels", token),
};

export const quizAPI = {
  getAll: (token?: string) => get("/api/quizzes", token),
  getById: (id: number, token?: string) => get(`/api/quizzes/${id}`, token),
  getByLevel: (level: string, token?: string) => get(`/api/quizzes/level/${level}`, token),
  getByDifficulty: (difficulty: string, token?: string) => get(`/api/quizzes/difficulty/${difficulty}`, token),
};

export const progressAPI = {
  getByUserId: (userId: number, token?: string) => get(`/api/progress/user/${userId}`, token),
  getByStatus: (userId: number, status: string, token?: string) => get(`/api/progress/user/${userId}/status/${status}`, token),
  createProgress: (userId: number, data: unknown, token?: string) => post(`/api/progress/user/${userId}`, data, token),
  updateProgress: (id: number, data: unknown, token?: string) => put(`/api/progress/${id}`, data, token),
};

export const statsAPI = {
  getStats: (userId: number, token?: string) => get(`/api/stats/user/${userId}`, token),
  updateTargetLevel: (userId: number, level: string, token?: string) => put(`/api/stats/user/${userId}/target-level/${level}`, undefined, token),
};
