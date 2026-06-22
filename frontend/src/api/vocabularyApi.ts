import apiClient from "@/lib/apiClient";

export const vocabularyApi = {
  getAll: () => apiClient.get("/api/vocabulary"),
  getById: (id: number) => apiClient.get(`/api/vocabulary/${id}`),
  getByLevel: (level: string) => apiClient.get(`/api/vocabulary/level/${level}`),
  getLevels: () => apiClient.get<string[]>("/api/vocabulary/levels"),
  create: (data: Record<string, unknown>) => apiClient.post("/api/vocabulary", data),
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.put(`/api/vocabulary/${id}`, data),
  delete: (id: number) => apiClient.del(`/api/vocabulary/${id}`),
};
