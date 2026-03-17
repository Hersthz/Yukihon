import apiClient from "@/lib/apiClient";

export const grammarApi = {
  getAll: () => apiClient.request("/api/grammar"),
  getById: (id: number) => apiClient.request(`/api/grammar/${id}`),
  getByLevel: (level: string) => apiClient.request(`/api/grammar/level/${level}`),
  getLevels: () => apiClient.request<string[]>("/api/grammar/levels"),
  create: (data: Record<string, unknown>) => apiClient.request("/api/grammar", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) => apiClient.request(`/api/grammar/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => apiClient.request(`/api/grammar/${id}`, { method: "DELETE" }),
};
