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
  getUsers: (page = 0, size = 20) => apiClient.request(`/api/admin/users?page=${page}&size=${size}`),
  getUserById: (userId: number) => apiClient.request(`/api/admin/users/${userId}`),
  searchUsers: (query: string) => apiClient.request(`/api/admin/users/search?query=${encodeURIComponent(query)}`),
  updateUserRoles: (userId: number, roles: string[]) =>
    apiClient.request(`/api/admin/users/${userId}/roles`, {
      method: "PUT",
      body: JSON.stringify({ roles }),
    }),
  updateUserStatus: (userId: number, enabled: boolean) =>
    apiClient.request(`/api/admin/users/${userId}/status`, {
      method: "PUT",
      body: JSON.stringify({ enabled }),
    }),
  promoteToAdmin: (userId: number) =>
    apiClient.request(`/api/admin/users/${userId}/promote`, {
      method: "POST",
    }),
  demoteFromAdmin: (userId: number) =>
    apiClient.request(`/api/admin/users/${userId}/demote`, {
      method: "POST",
    }),
  deleteUser: (userId: number) =>
    apiClient.request(`/api/admin/users/${userId}`, {
      method: "DELETE",
    }),
  uploadMedia: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.fetchWithAuth("/api/admin/media/upload", {
      method: "POST",
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    });
  },
  getSystemStats: () => apiClient.request("/api/admin/stats"),
  getContentOverview: () => apiClient.request("/api/admin/content/overview"),
  getQuizAnalytics: () => apiClient.request<QuizAnalytics>("/api/admin/quiz-analytics"),
  exportQuizAnalyticsCsv: async () => {
    const response = await apiClient.fetchWithAuth("/api/admin/quiz-analytics/export");
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response.blob();
  },
};
