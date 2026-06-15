import apiClient from "@/lib/apiClient";

export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  roles: string[];
  permissions?: string[];
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

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string | null;
}

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

  forgotPassword(email: string) {
    return apiClient.request<ForgotPasswordResponse>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword(data: { token: string; newPassword: string }) {
    return apiClient.request<void>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async googleAuth(code: string): Promise<AuthResponse> {
    return apiClient.request<AuthResponse>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ code, redirectUri: GOOGLE_REDIRECT_URI }),
    });
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
