import apiClient from "@/lib/apiClient";

export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  user: AuthUser;
}

export interface UpdateProfilePayload {
  displayName: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const GOOGLE_REDIRECT_URI = `${window.location.origin}/auth`;

export const authApi = {
  register(data: { email: string; password: string; displayName: string; jlptTargetLevel?: string }) {
    return apiClient.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login(data: { email: string; password: string }) {
    return apiClient.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getCurrentUser() {
    return apiClient.request<AuthUser>("/api/auth/me");
  },

  updateProfile(data: UpdateProfilePayload) {
    return apiClient.request<AuthUser>("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  changePassword(data: ChangePasswordPayload) {
    return apiClient.request<void>("/api/auth/password", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async googleAuth(code: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, redirectUri: GOOGLE_REDIRECT_URI }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Google authentication failed.");
    }

    return (await response.json()) as AuthResponse;
  },

  storeAuthData(response: AuthResponse) {
    apiClient.setAuthData(response.accessToken, response.user, response.refreshToken);
  },

  getGoogleClientId() {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  },

  getGoogleRedirectUri() {
    return GOOGLE_REDIRECT_URI;
  },
};
