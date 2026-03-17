const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface StoredAuthUser {
  id: number;
  email: string;
  displayName: string;
  roles: string[];
}

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
};

export const apiClient = {
  baseURL: API_BASE_URL,

  getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem("yukihon_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.getAuthHeader(),
      ...((options.headers as Record<string, string>) || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        this.clearAuthData();
        window.location.href = "/auth";
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `API Error: ${response.status}`);
      }

      return await parseResponse<T>(response);
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  },

  setAuthData(token: string, user: StoredAuthUser) {
    localStorage.setItem("yukihon_token", token);
    localStorage.setItem("yukihon_user", JSON.stringify(user));
  },

  clearAuthData() {
    localStorage.removeItem("yukihon_token");
    localStorage.removeItem("yukihon_user");
  },

  getStoredUser() {
    const user = localStorage.getItem("yukihon_user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("yukihon_token");
  },
};

export default apiClient;
