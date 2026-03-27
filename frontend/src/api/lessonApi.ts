import apiClient from "@/lib/apiClient";

export const lessonApi = {
  getAll: () => apiClient.request("/api/lessons"),
  getPublished: () => apiClient.request("/api/lessons/published"),
  getById: (id: number) => apiClient.request(`/api/lessons/${id}`),
  getVersions: (id: number) => apiClient.request(`/api/lessons/${id}/versions`),
  getByLevel: (level: string) => apiClient.request(`/api/lessons/published/level/${level}`),
  getByCategory: (category: string) => apiClient.request(`/api/lessons/published/category/${category}`),
  create: (data: Record<string, unknown>) => apiClient.request("/api/lessons", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) => apiClient.request(`/api/lessons/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => apiClient.request(`/api/lessons/${id}`, { method: "DELETE" }),
};
