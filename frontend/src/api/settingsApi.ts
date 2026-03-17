import apiClient from "@/lib/apiClient";

export const settingsApi = {
  get: () => apiClient.request("/api/settings"),
  update: (data: Record<string, unknown>) =>
    apiClient.request("/api/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
