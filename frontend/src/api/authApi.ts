import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type AuthUser = Schema<"UserDto">;

export type AuthResponse = Schema<"AuthResponse">;

export type UpdateProfilePayload = Schema<"UpdateProfileRequest">;

export type ChangePasswordPayload = Schema<"ChangePasswordRequest">;

export type ForgotPasswordResponse = Schema<"ForgotPasswordResponse">;

const GOOGLE_REDIRECT_URI = `${window.location.origin}/auth`;

export const authApi = {
  register(data: {
    email: string;
    password: string;
    displayName: string;
    jlptTargetLevel?: string;
  }) {
    return apiClient.post<AuthResponse>("/api/auth/register", data);
  },

  login(data: { email: string; password: string }) {
    return apiClient.post<AuthResponse>("/api/auth/login", data);
  },

  getCurrentUser() {
    return apiClient.get<AuthUser>("/api/auth/me");
  },

  updateProfile(data: UpdateProfilePayload) {
    return apiClient.put<AuthUser>("/api/auth/profile", data);
  },

  changePassword(data: ChangePasswordPayload) {
    return apiClient.put<void>("/api/auth/password", data);
  },

  forgotPassword(email: string) {
    return apiClient.post<ForgotPasswordResponse>("/api/auth/forgot-password", { email });
  },

  resetPassword(data: { token: string; newPassword: string }) {
    return apiClient.post<void>("/api/auth/reset-password", data);
  },

  async googleAuth(code: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/api/auth/google", {
      code,
      redirectUri: GOOGLE_REDIRECT_URI,
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
