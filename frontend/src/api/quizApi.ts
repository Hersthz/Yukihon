import apiClient from "@/lib/apiClient";

export const quizApi = {
  getAll: () => apiClient.request("/api/quizzes"),
  getById: (id: number) => apiClient.request(`/api/quizzes/${id}`),
  getByLevel: (level: string) => apiClient.request(`/api/quizzes/level/${level}`),
  getByDifficulty: (difficulty: string) => apiClient.request(`/api/quizzes/difficulty/${difficulty}`),
  create: (data: Record<string, unknown>) => apiClient.request("/api/quizzes", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) => apiClient.request(`/api/quizzes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => apiClient.request(`/api/quizzes/${id}`, { method: "DELETE" }),
};
