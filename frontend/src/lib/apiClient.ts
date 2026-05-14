const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const ACCESS_TOKEN_KEY = "yukihon_token";
const REFRESH_TOKEN_KEY = "yukihon_refresh_token";
const USER_KEY = "yukihon_user";

interface StoredAuthUser {
  id: number;
  email: string;
  displayName: string;
  roles: string[];
}

interface StoredAuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: StoredAuthUser;
}

let refreshPromise: Promise<StoredAuthResponse | null> | null = null;

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

const parseErrorMessage = async (response: Response): Promise<string> => {
  const fallback = `API Error: ${response.status}`;
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const body = (await response.json()) as { message?: string; error?: string };
      return body.message || body.error || fallback;
    } catch {
      return fallback;
    }
  }

  const text = await response.text();
  return text || fallback;
};

const redirectToAuth = () => {
  const isAuthRoute = window.location.pathname.startsWith("/auth");
  if (isAuthRoute) {
    return;
  }

  const reason = encodeURIComponent("session_expired");
  const from = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `/auth?reason=${reason}&from=${from}`;
};

const isRefreshRequest = (endpoint: string) => endpoint.startsWith("/api/auth/refresh");
const isLoginLikeRequest = (endpoint: string) =>
  endpoint.startsWith("/api/auth/login") ||
  endpoint.startsWith("/api/auth/register") ||
  endpoint.startsWith("/api/auth/google") ||
  endpoint.startsWith("/api/auth/forgot-password") ||
  endpoint.startsWith("/api/auth/reset-password");

export const apiClient = {
  baseURL: API_BASE_URL,

  getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  async refreshAccessToken(): Promise<StoredAuthResponse | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    if (!refreshPromise) {
      refreshPromise = fetch(`${this.baseURL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })
        .then(async (response) => {
          if (!response.ok) {
            return null;
          }

          const data = (await response.json()) as StoredAuthResponse;
          this.setAuthData(data.accessToken, data.user, data.refreshToken);
          return data;
        })
        .catch(() => null)
        .finally(() => {
          refreshPromise = null;
        });
    }

    return refreshPromise;
  },

  async fetchWithAuth(endpoint: string, options: RequestInit = {}, retryOnUnauthorized = true): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      ...this.getAuthHeader(),
      ...((options.headers as Record<string, string>) || {}),
    };

    if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (
      response.status === 401 &&
      retryOnUnauthorized &&
      !isRefreshRequest(endpoint) &&
      !isLoginLikeRequest(endpoint)
    ) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.fetchWithAuth(endpoint, options, false);
      }

      this.clearAuthData();
      redirectToAuth();
    }

    return response;
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await this.fetchWithAuth(endpoint, options);

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      return await parseResponse<T>(response);
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  },

  setAuthData(token: string, user: StoredAuthUser, refreshToken?: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  setStoredUser(user: StoredAuthUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearAuthData() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getStoredUser() {
    const user = localStorage.getItem(USER_KEY);
    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user);
    } catch {
      this.clearAuthData();
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },
};

export default apiClient;
