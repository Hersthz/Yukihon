import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type GrammarDto = Schema<"GrammarDto">;

export const grammarApi = {
  getAll: () => apiClient.get<GrammarDto[]>("/api/grammar"),
  getById: (id: number) => apiClient.get<GrammarDto>(`/api/grammar/${id}`),
  getByLevel: (level: string) => apiClient.get<GrammarDto[]>(`/api/grammar/level/${level}`),
  getLevels: () => apiClient.get<string[]>("/api/grammar/levels"),
  create: (data: Record<string, unknown>) => apiClient.post<GrammarDto>("/api/grammar", data),
  update: (id: number, data: Record<string, unknown>) =>
    apiClient.put<GrammarDto>(`/api/grammar/${id}`, data),
  delete: (id: number) => apiClient.del<void>(`/api/grammar/${id}`),
};
