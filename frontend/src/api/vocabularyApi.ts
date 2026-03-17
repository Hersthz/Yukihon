import { request } from "@/api/httpClient";

export const vocabularyApi = {
  getAll() {
    return request("/api/vocabulary");
  },

  getById(id: number) {
    return request(`/api/vocabulary/${id}`);
  },

  getByLevel(level: string) {
    return request(`/api/vocabulary/level/${level}`);
  },

  getLevels() {
    return request<string[]>("/api/vocabulary/levels");
  },

  create(data: Record<string, unknown>) {
    return request("/api/vocabulary", { method: "POST", body: JSON.stringify(data) });
  },

  update(id: number, data: Record<string, unknown>) {
    return request(`/api/vocabulary/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },

  delete(id: number) {
    return request(`/api/vocabulary/${id}`, { method: "DELETE" });
  },
};
