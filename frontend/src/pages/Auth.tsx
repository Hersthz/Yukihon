import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { authApi } from "@/api";
import { SlidingAuthCard, type AuthMode } from "@/components/auth";
import { useAuth } from "@/hooks/use-auth";
import { useWinterTheme } from "@/hooks/use-winter-theme";
import { WinterScene } from "@/components/winter";

const getSafeRedirectPath = (params: URLSearchParams) => {
  const from = params.get("from");
  if (!from || !from.startsWith("/") || from.startsWith("//") || from.startsWith("/auth")) {
    return "/dashboard";
  }

  return from;
};

const getInitialMode = (): AuthMode => {
  if (typeof window === "undefined") return "login";
  const params = new URLSearchParams(window.location.search);
  const m = params.get("mode");
  if (params.get("token")) return "reset";
  if (m === "register" || m === "reset" || m === "forgot") return m;
  return "login";
};

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>(getInitialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [jlptTarget, setJlptTarget] = useState("N4");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState("/dashboard");

  const navigate = useNavigate();
  const { login, loginWithGoogleCode, register } = useAuth();
  const { isDark, toggle } = useWinterTheme();

  const authenticateWithGoogle = useCallback(
    async (code: string, targetPath: string) => {
      setIsSubmitting(true);
      try {
        await loginWithGoogleCode(code);
        setSuccessMsg("Đăng nhập bằng Google thành công.");
        setTimeout(() => navigate(targetPath, { replace: true }), 500);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Đăng nhập bằng Google thất bại.";
        setErrorMsg(message);
        window.history.replaceState({}, document.title, window.location.pathname);
      } finally {
        setIsSubmitting(false);
      }
    },
    [loginWithGoogleCode, navigate]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const reason = params.get("reason");
    const authMode = params.get("mode");
    const token = params.get("token");
    const nextRedirectPath = getSafeRedirectPath(params);
    setRedirectPath(nextRedirectPath);

    if (authMode === "reset" || token) {
      setMode("reset");
      if (token) {
        setResetToken(token);
      }
    } else if (authMode === "register") {
      setMode("register");
    }

    if (reason === "session_expired") {
      setErrorMsg("Phiên đăng nhập trước đã hết hạn. Vui lòng đăng nhập lại.");
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (error) {
      const description = params.get("error_description");
      setErrorMsg(description || `Đăng nhập Google thất bại: ${error}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code) {
      void authenticateWithGoogle(code, nextRedirectPath);
    }
  }, [authenticateWithGoogle]);

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleModeChange = (nextMode: AuthMode) => {
    if (nextMode === mode) {
      return;
    }

    resetMessages();
    setMode(nextMode);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleGoogleLogin = () => {
    const clientId = authApi.getGoogleClientId();
    const isGoogleConfigured = clientId && !clientId.includes("your_google");

    if (!isGoogleConfigured) {
      setErrorMsg(
        "Chưa cấu hình Google Client ID. Hãy thêm VITE_GOOGLE_CLIENT_ID vào frontend/.env.local trước khi dùng đăng nhập Google."
      );
      return;
    }

    const scope = encodeURIComponent(
      "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
    );

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(authApi.getGoogleRedirectUri())}` +
      `&response_type=code&scope=${scope}`;

    window.location.href = authUrl;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetMessages();

    if (mode === "forgot") {
      if (!email) {
        setErrorMsg("Vui lòng nhập email.");
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await authApi.forgotPassword(email);
        if (response.resetToken) {
          setResetToken(response.resetToken);
          setSuccessMsg("Đã tạo mã đặt lại. Bạn có thể đặt mật khẩu mới ngay bây giờ.");
          setMode("reset");
        } else {
          setSuccessMsg(
            response.message || "Nếu tài khoản tồn tại, hướng dẫn đặt lại đã được gửi."
          );
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Yêu cầu đặt lại mật khẩu thất bại.";
        setErrorMsg(message);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (mode === "reset") {
      if (!resetToken || !password || !confirmPassword) {
        setErrorMsg("Vui lòng nhập mã đặt lại và mật khẩu mới.");
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg("Mật khẩu không khớp.");
        return;
      }

      setIsSubmitting(true);
      try {
        await authApi.resetPassword({ token: resetToken, newPassword: password });
        setPassword("");
        setConfirmPassword("");
        setResetToken("");
        setSuccessMsg("Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.");
        setMode("login");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Đặt lại mật khẩu thất bại.";
        setErrorMsg(message);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setErrorMsg("Mật khẩu không khớp.");
      return;
    }

    if (!email || !password || (mode === "register" && !displayName)) {
      setErrorMsg("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, displayName, jlptTarget);
      }

      setSuccessMsg(mode === "login" ? "Đăng nhập thành công." : "Tạo tài khoản thành công.");
      navigate(redirectPath, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Xác thực thất bại.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`winter flex min-h-screen items-center justify-center px-4 py-10 ${
        isDark ? "is-dark" : ""
      }`}
    >
      <WinterScene isDark={isDark} flakes={28} />

      <SlidingAuthCard
        mode={mode}
        setMode={handleModeChange}
        isSubmitting={isSubmitting}
        errorMsg={errorMsg}
        successMsg={successMsg}
        displayName={displayName}
        setDisplayName={setDisplayName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        resetToken={resetToken}
        setResetToken={setResetToken}
        jlptTarget={jlptTarget}
        setJlptTarget={setJlptTarget}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        onSubmit={handleSubmit}
        onGoogleLogin={handleGoogleLogin}
        isDark={isDark}
        onToggleTheme={toggle}
      />
    </div>
  );
};

export default Auth;
