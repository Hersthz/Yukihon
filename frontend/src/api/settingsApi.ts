import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type UserSettingsResponse = Schema<"UserSettingsDto">;

export type UpdateUserSettingsPayload = Schema<"UpdateSettingsRequest">;

export const settingsApi = {
  get: () => apiClient.get<UserSettingsResponse>("/api/settings"),
  update: (data: UpdateUserSettingsPayload) =>
    apiClient.put<UserSettingsResponse>("/api/settings", data),
};
