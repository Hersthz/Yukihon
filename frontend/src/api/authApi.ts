import { request } from "@/api/httpClient";

export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  roles: string[];
}

export const authStorage = {
  setAuthData(token: string, user: AuthUser) {
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

  isAuthenticated() {
    return !!localStorage.getItem("yukihon_token");
  },
};

export const authApi = {
  register(data: { email: string; password: string; displayName: string; jlptTargetLevel?: string }) {
    return request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login(data: { email: string; password: string }) {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  googleAuth(code: string, redirectUri: string) {
    return request("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ code, redirectUri }),
    });
  },

  getCurrentUser() {
    return request("/api/auth/me");
  },
};
