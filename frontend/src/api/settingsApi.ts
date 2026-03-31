import apiClient from "@/lib/apiClient";

export interface UserSettingsResponse {
  theme: string;
  language: string;
  dailyGoalMinutes: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  showFurigana: boolean;
  showRomaji: boolean;
  autoPlayAudio: boolean;
  quizDifficulty: string;
  targetJlptLevel: string;
  jlptDeadlineDate: string | null;
}

export interface UpdateUserSettingsPayload extends Partial<UserSettingsResponse> {
  jlptDeadlineDate?: string;
}

export const settingsApi = {
  get: () => apiClient.request<UserSettingsResponse>("/api/settings"),
  update: (data: UpdateUserSettingsPayload) =>
    apiClient.request<UserSettingsResponse>("/api/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
