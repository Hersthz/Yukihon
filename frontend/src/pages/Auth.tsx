import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { authApi } from "@/api";
import { AuthFormCard, AuthHero, BG_KANJI, PARTICLES, type AuthMode } from "@/components/auth";
import WinterNightBackground from "@/components/WinterNightBackground";
import { useAuth } from "@/hooks/use-auth";

const KANJI_SEQUENCE = "日本語を学ぼう！";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [jlptTarget, setJlptTarget] = useState("N4");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [typingKanji, setTypingKanji] = useState("");

  const navigate = useNavigate();
  const { login, loginWithGoogleCode, register } = useAuth();

  const authenticateWithGoogle = useCallback(async (code: string) => {
    setIsSubmitting(true);
    try {
      await loginWithGoogleCode(code);
      setSuccessMsg("Signed in with Google successfully!");
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google authentication failed.";
      setErrorMsg(message);
      window.history.replaceState({}, document.title, window.location.pathname);
    } finally {
      setIsSubmitting(false);
    }
  }, [loginWithGoogleCode, navigate]);

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setTypingKanji(KANJI_SEQUENCE.slice(0, index + 1));
      index += 1;
      if (index >= KANJI_SEQUENCE.length) {
        setTimeout(() => {
          index = 0;
          setTypingKanji("");
        }, 2000);
      }
    }, 200);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const reason = params.get("reason");

    if (reason === "session_expired") {
      setErrorMsg("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
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
      void authenticateWithGoogle(code);
    }
  }, [authenticateWithGoogle]);

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleModeChange = (nextMode: AuthMode) => {
    if (nextMode === mode) return;
    resetMessages();
    setMode(nextMode);
  };

  const handleGoogleLogin = () => {
    const clientId = authApi.getGoogleClientId();
    const isGoogleConfigured = clientId && !clientId.includes("your_google");

    if (!isGoogleConfigured) {
      setErrorMsg(
        "Google Client ID chua duoc cau hinh. Vui long tao OAuth credentials tai Google Cloud Console roi dien vao VITE_GOOGLE_CLIENT_ID trong frontend/.env.local"
      );
      return;
    }

    const scope = encodeURIComponent(
      "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
    );
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      authApi.getGoogleRedirectUri()
    )}&response_type=code&scope=${scope}`;
    window.location.href = authUrl;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetMessages();

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
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen relative overflow-hidden bg-background">
      <WinterNightBackground snowCount={60} sparkleCount={20} intensity="normal" />

      <div className="fixed inset-0 pointer-events-none select-none z-[1]">
        {BG_KANJI.map((item) => (
          <span
            key={item.char}
            className={`absolute font-black text-foreground/[0.03] ${item.size}`}
            style={{ left: item.x, top: item.y }}
          >
            {item.char}
          </span>
        ))}
      </div>

      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        {PARTICLES.map((particle) => (
          <div
            key={`particle-${particle.id}`}
            className="absolute animate-snow-fall"
            style={{
              left: `${particle.x}%`,
              top: "-20px",
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
              ["--snow-sway" as string]: `${particle.drift}px`,
              willChange: "transform",
            }}
          >
            {particle.type === "sakura" ? (
              <div
                className="rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size * 0.7,
                  background: "radial-gradient(ellipse, rgba(244,163,187,0.45) 0%, rgba(244,163,187,0) 70%)",
                }}
              />
            ) : (
              <div
                className="rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  background: "radial-gradient(circle, rgba(147,197,253,0.5) 0%, transparent 70%)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="fixed inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/20 pointer-events-none z-[1]" />

      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 px-6 py-4"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 group text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary grid place-items-center text-primary-foreground font-bold text-base shadow-md">
              日
            </div>
            <span className="font-semibold text-foreground text-sm hidden sm:inline">Yukihon</span>
          </Link>
        </div>
      </motion.nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 h-[calc(100vh-80px)] flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-24 items-center w-full">
          <AuthHero mode={mode} typingKanji={typingKanji} />
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
