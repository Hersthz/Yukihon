import apiClient from "@/lib/apiClient";

export const vocabularyApi = {
  getAll: () => apiClient.request("/api/vocabulary"),
  getById: (id: number) => apiClient.request(`/api/vocabulary/${id}`),
  getByLevel: (level: string) => apiClient.request(`/api/vocabulary/level/${level}`),
  getLevels: () => apiClient.request<string[]>("/api/vocabulary/levels"),
  create: (data: Record<string, unknown>) =>
    apiClient.request("/api/vocabulary", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.request(`/api/vocabulary/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => apiClient.request(`/api/vocabulary/${id}`, { method: "DELETE" }),
};
