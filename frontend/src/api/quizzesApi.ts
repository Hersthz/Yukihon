import { request } from "@/api/httpClient";

export const quizzesApi = {
  getAll() {
    return request("/api/quizzes");
  },

  getById(id: number) {
    return request(`/api/quizzes/${id}`);
  },

  getByLevel(level: string) {
    return request(`/api/quizzes/level/${level}`);
  },

  getByDifficulty(difficulty: string) {
    return request(`/api/quizzes/difficulty/${difficulty}`);
  },

  create(data: Record<string, unknown>) {
    return request("/api/quizzes", { method: "POST", body: JSON.stringify(data) });
  },

  update(id: number, data: Record<string, unknown>) {
    return request(`/api/quizzes/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },

  delete(id: number) {
    return request(`/api/quizzes/${id}`, { method: "DELETE" });
  },
};
