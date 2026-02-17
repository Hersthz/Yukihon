// API Configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const apiClient = {
  baseURL: API_BASE_URL,

  // Get authorization header
  getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem("yukihon_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // Generic fetch wrapper
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
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
        // Token expired or invalid
        localStorage.removeItem("yukihon_token");
        localStorage.removeItem("yukihon_user");
        window.location.href = "/auth";
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  },

  // Auth endpoints
  auth: {
    register(data: { email: string; password: string; displayName: string }) {
      return apiClient.request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    login(data: { email: string; password: string }) {
      return apiClient.request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    googleAuth(code: string, redirectUri: string) {
      return apiClient.request("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ code, redirectUri }),
      });
    },

    getCurrentUser() {
      return apiClient.request("/api/auth/me");
    },
  },

  // Helper to store auth data
  setAuthData(token: string, user: any) {
    localStorage.setItem("yukihon_token", token);
    localStorage.setItem("yukihon_user", JSON.stringify(user));
  },

  // Helper to clear auth data
  clearAuthData() {
    localStorage.removeItem("yukihon_token");
    localStorage.removeItem("yukihon_user");
  },

  // Get stored user
  getStoredUser() {
    const user = localStorage.getItem("yukihon_user");
    return user ? JSON.parse(user) : null;
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem("yukihon_token");
  },
};

export default apiClient;
