import { request } from "@/api/httpClient";

export const settingsApi = {
  get() {
    return request("/api/settings");
  },

  update(data: Record<string, unknown>) {
    return request("/api/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};
