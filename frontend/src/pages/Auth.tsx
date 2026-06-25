import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { authApi } from "@/api";
import { AuthFormCard, AuthHero, type AuthMode } from "@/components/auth";
import { useAuth } from "@/hooks/use-auth";
import { useWinterTheme } from "@/hooks/use-winter-theme";
import { WinterScene, WinterThemeToggle, WinterMark } from "@/components/winter";

const KANJI_SEQUENCE = "Tiếng Nhật, mỗi ngày.";

const getSafeRedirectPath = (params: URLSearchParams) => {
  const from = params.get("from");
  if (!from || !from.startsWith("/") || from.startsWith("//") || from.startsWith("/auth")) {
    return "/dashboard";
  }

  return from;
};

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
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
  const [typingKanji, setTypingKanji] = useState("");
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
    let index = 0;
    const timer = setInterval(() => {
      setTypingKanji(KANJI_SEQUENCE.slice(0, index + 1));
      index += 1;

      if (index >= KANJI_SEQUENCE.length) {
        setTimeout(() => {
          index = 0;
          setTypingKanji("");
        }, 1800);
      }
    }, 110);

    return () => clearInterval(timer);
  }, []);

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
    <div className={`winter min-h-screen px-4 pb-10 pt-6 sm:px-6 ${isDark ? "is-dark" : ""}`}>
      <WinterScene isDark={isDark} flakes={24} />

      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-[1280px]"
      >
        <div className="winter-glass flex items-center justify-between px-4 py-3 sm:px-5">
          <Link
            to="/"
            className="flex items-center gap-2.5 transition-colors"
            style={{ color: "hsl(var(--w-ink-soft))" }}
          >
            <ArrowLeft className="h-4 w-4" />
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                color: "hsl(var(--w-accent-fg))",
                background:
                  "linear-gradient(135deg, hsl(var(--w-accent)), hsl(var(--w-accent-strong)))",
                boxShadow: "0 8px 20px -10px hsl(var(--w-accent) / 0.8)",
              }}
            >
              <WinterMark size={20} />
            </div>
            <div>
              <p className="text-xl font-black tracking-tight text-foreground">Yukihon</p>
              <p
                className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] sm:block"
                style={{ color: "hsl(var(--w-ink-faint))" }}
              >
                Học nhẹ nhàng, đi đường dài
              </p>
            </div>
          </Link>

          <WinterThemeToggle isDark={isDark} onToggle={toggle} />
        </div>
      </motion.nav>

      <div className="mx-auto mt-8 grid max-w-[1280px] gap-8 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="hidden lg:block">
          <div className="winter-glass h-full p-8">
            <div className="winter-pill">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Trải nghiệm lần đầu mượt hơn
            </div>
            <div className="mt-8">
              <AuthHero mode={mode} typingKanji={typingKanji} />
            </div>
          </div>
        </div>

        <div className="winter-glass flex items-center justify-center p-3 sm:p-5 lg:p-6">
          <AuthFormCard
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
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
