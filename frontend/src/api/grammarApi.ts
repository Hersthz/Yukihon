import { request } from "@/api/httpClient";

export const grammarApi = {
  getAll() {
    return request("/api/grammar");
  },

  getById(id: number) {
    return request(`/api/grammar/${id}`);
  },

  getByLevel(level: string) {
    return request(`/api/grammar/level/${level}`);
  },

  getLevels() {
    return request<string[]>("/api/grammar/levels");
  },

  create(data: Record<string, unknown>) {
    return request("/api/grammar", { method: "POST", body: JSON.stringify(data) });
  },

  update(id: number, data: Record<string, unknown>) {
    return request(`/api/grammar/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },

  delete(id: number) {
    return request(`/api/grammar/${id}`, { method: "DELETE" });
  },
};
