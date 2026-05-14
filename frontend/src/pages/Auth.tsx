import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";

import { authApi } from "@/api";
import { AuthFormCard, AuthHero, type AuthMode } from "@/components/auth";
import { useAuth } from "@/hooks/use-auth";

const KANJI_SEQUENCE = "Nihongo, every day.";

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

  const authenticateWithGoogle = useCallback(
    async (code: string, targetPath: string) => {
      setIsSubmitting(true);
      try {
        await loginWithGoogleCode(code);
        setSuccessMsg("Signed in with Google successfully.");
        setTimeout(() => navigate(targetPath, { replace: true }), 500);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Google authentication failed.";
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
      setErrorMsg("Your previous session expired. Please sign in again.");
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (error) {
      const description = params.get("error_description");
      setErrorMsg(description || `Google login failed: ${error}`);
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
        "Google Client ID is not configured yet. Add VITE_GOOGLE_CLIENT_ID inside frontend/.env.local before using Google auth."
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
        setErrorMsg("Please enter your email.");
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await authApi.forgotPassword(email);
        if (response.resetToken) {
          setResetToken(response.resetToken);
          setSuccessMsg("Reset token created. You can set a new password now.");
          setMode("reset");
        } else {
          setSuccessMsg(response.message || "If the account exists, reset instructions have been sent.");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Password reset request failed.";
        setErrorMsg(message);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (mode === "reset") {
      if (!resetToken || !password || !confirmPassword) {
        setErrorMsg("Please enter reset token and new password.");
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }

      setIsSubmitting(true);
      try {
        await authApi.resetPassword({ token: resetToken, newPassword: password });
        setPassword("");
        setConfirmPassword("");
        setResetToken("");
        setSuccessMsg("Password reset successfully. Please sign in with your new password.");
        setMode("login");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Password reset failed.";
        setErrorMsg(message);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!email || !password || (mode === "register" && !displayName)) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, displayName, jlptTarget);
      }

      setSuccessMsg(mode === "login" ? "Signed in successfully." : "Account created successfully.");
      navigate(redirectPath, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 pb-10 pt-6 sm:px-6">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(255,216,207,0.52),transparent_32%),radial-gradient(circle_at_top_right,rgba(201,240,255,0.58),transparent_28%),linear-gradient(180deg,#fffaf4_0%,#fff5ed_40%,#f8f0e8_100%)]" />

      <motion.nav initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-[1360px]">
        <div className="surface-panel flex items-center justify-between bg-white/92 px-5 py-4 backdrop-blur-xl sm:px-6">
          <Link to="/" className="flex items-center gap-3 text-foreground/76 transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#ffcfc6]">
              <span className="display-font text-2xl font-bold text-foreground">Y</span>
            </div>
            <div>
              <p className="text-xl font-black tracking-tight text-foreground">Yukihon</p>
              <p className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:block">
                Light onboarding flow
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-3 rounded-full bg-[#f7f3ee] px-4 py-2 sm:flex">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Dark mode is parked. Light mode only for now.</span>
          </div>
        </div>
      </motion.nav>

      <div className="mx-auto mt-8 grid max-w-[1360px] gap-8 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="hidden lg:block">
          <div className="surface-panel-soft h-full p-8">
            <div className="section-kicker">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Better first-run experience
            </div>
            <div className="mt-8">
              <AuthHero mode={mode} typingKanji={typingKanji} />
            </div>
          </div>
        </div>

        <div className="surface-panel-soft flex items-center justify-center p-3 sm:p-5 lg:p-6">
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
