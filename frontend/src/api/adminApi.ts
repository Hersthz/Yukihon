import apiClient from "@/lib/apiClient";

export interface QuizQuestionAnalytics {
  quizId: number;
  title: string;
  jlptLevel: string;
  difficultyLevel: string;
  quizType: string;
  totalAttempts: number;
  wrongAttempts: number;
  accuracyRate: number;
  topPattern?: string;
}

export interface QuizPatternAnalytics {
  pattern: string;
  wrongAttempts: number;
}

export interface QuizCohortAccuracy {
  dimension: string;
  value: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracyRate: number;
}

export interface QuizAnalytics {
  totalAttempts: number;
  correctAttempts: number;
  wrongAttempts: number;
  overallAccuracy: number;
  mostCommonPattern?: string;
  mostMissedQuestions: QuizQuestionAnalytics[];
  patternBreakdown: QuizPatternAnalytics[];
  cohortAccuracy: QuizCohortAccuracy[];
}

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
