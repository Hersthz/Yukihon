import apiClient from "@/lib/apiClient";

export interface GrammarDto {
  id: number;
  title: string;
  pattern: string;
  explanation?: string;
  usage?: string;
  exampleJP?: string;
  exampleEN?: string;
  jlptLevel?: string;
  relatedPatterns?: string;
}

export const grammarApi = {
  getAll: () => apiClient.request<GrammarDto[]>("/api/grammar"),
  getById: (id: number) => apiClient.request<GrammarDto>(`/api/grammar/${id}`),
  getByLevel: (level: string) => apiClient.request<GrammarDto[]>(`/api/grammar/level/${level}`),
  getLevels: () => apiClient.request<string[]>("/api/grammar/levels"),
  create: (data: Record<string, unknown>) => apiClient.request<GrammarDto>("/api/grammar", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) => apiClient.request<GrammarDto>(`/api/grammar/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) => apiClient.request<void>(`/api/grammar/${id}`, { method: "DELETE" }),
};
