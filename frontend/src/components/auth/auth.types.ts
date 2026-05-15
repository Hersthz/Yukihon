export type AuthMode = "login" | "register" | "forgot" | "reset";

export interface AuthMessages {
  error: string | null;
  success: string | null;
}

export interface AuthFormState {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  resetToken: string;
  jlptTarget: string;
}
