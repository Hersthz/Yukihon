import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type QuizQuestionAnalytics = Schema<"QuizQuestionAnalyticsDto">;

export type QuizPatternAnalytics = Schema<"QuizPatternAnalyticsDto">;

export type QuizCohortAccuracy = Schema<"QuizCohortAccuracyDto">;

export type QuizAnalytics = Schema<"QuizAnalyticsDto">;

export const adminApi = {
  getUsers: (page = 0, size = 20) => apiClient.get(`/api/admin/users`, { page, size }),
  getUserById: (userId: number) => apiClient.get(`/api/admin/users/${userId}`),
  searchUsers: (query: string) => apiClient.get(`/api/admin/users/search`, { query }),
  updateUserRoles: (userId: number, roles: string[]) =>
    apiClient.put(`/api/admin/users/${userId}/roles`, { roles }),
  updateUserStatus: (userId: number, enabled: boolean) =>
    apiClient.put(`/api/admin/users/${userId}/status`, { enabled }),
  promoteToAdmin: (userId: number) => apiClient.post(`/api/admin/users/${userId}/promote`),
  demoteFromAdmin: (userId: number) => apiClient.post(`/api/admin/users/${userId}/demote`),
  deleteUser: (userId: number) => apiClient.del(`/api/admin/users/${userId}`),
  uploadMedia: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient
      .fetchWithAuth("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await response.text());
        }
        return response.json();
      });
  },
  getSystemStats: () => apiClient.get("/api/admin/stats"),
  getContentOverview: () => apiClient.get("/api/admin/content/overview"),
  getQuizAnalytics: () => apiClient.get<QuizAnalytics>("/api/admin/quiz-analytics"),
  exportQuizAnalyticsCsv: async () => {
    const response = await apiClient.fetchWithAuth("/api/admin/quiz-analytics/export");
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.blob();
  },
};
