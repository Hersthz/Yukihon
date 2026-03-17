import { request } from "@/api/httpClient";

export const lessonsApi = {
  getAll() {
    return request("/api/lessons");
  },

  getPublished() {
    return request("/api/lessons/published");
  },

  getById(id: number) {
    return request(`/api/lessons/${id}`);
  },

  getPublishedByLevel(level: string) {
    return request(`/api/lessons/published/level/${level}`);
  },

  getPublishedByCategory(category: string) {
    return request(`/api/lessons/published/category/${category}`);
  },

  create(data: Record<string, unknown>) {
    return request("/api/lessons", { method: "POST", body: JSON.stringify(data) });
  },

  update(id: number, data: Record<string, unknown>) {
    return request(`/api/lessons/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },

  delete(id: number) {
    return request(`/api/lessons/${id}`, { method: "DELETE" });
  },
};
