// src/pages/Auth.tsx
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Target,
  AlertCircle,
  CheckCircle2,
  Chrome,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import WinterNightBackground from "@/components/WinterNightBackground";
import kaorukoWelcome from "@/assets/kaoruko-welcome.png";
import kaorukoGuide from "@/assets/kaoruko-guide.png";

type AuthMode = "login" | "register";

interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  roles: string[];
}

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  user: AuthUser;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const GOOGLE_REDIRECT_URI = `${window.location.origin}/auth`;

/* ─── Floating kanji for atmosphere (reduced) ─── */
const BG_KANJI = [
  { char: "学", x: "8%", y: "15%", size: "text-[8rem]", delay: 0 },
  { char: "雪", x: "42%", y: "85%", size: "text-[9rem]", delay: 0.5 },
  { char: "書", x: "75%", y: "70%", size: "text-[7rem]", delay: 1 },
  { char: "読", x: "85%", y: "20%", size: "text-[6rem]", delay: 2 },
];

/* ─── Floating particles (reduced for performance) ─── */
const PARTICLES = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  size: 4 + Math.random() * 6,
  delay: Math.random() * 10,
  duration: 10 + Math.random() * 10,
  drift: (Math.random() - 0.5) * 50,
  type: Math.random() > 0.6 ? "sakura" : "orb" as "sakura" | "orb",
}));

/* ─── Password strength ─── */
const getPasswordStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
};

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["", "bg-red-500", "bg-amber-500", "bg-emerald-400", "bg-emerald-500"];

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [jlptTarget, setJlptTarget] = useState("N4");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [typingKanji, setTypingKanji] = useState("")

  const navigate = useNavigate();
  const { login, register } = useAuth();

  const pwStrength = useMemo(() => getPasswordStrength(password), [password]);

  /* ── Cute typing-kanji effect ── */
  const KANJI_SEQUENCE = "日本語を学ぼう！";
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setTypingKanji(KANJI_SEQUENCE.slice(0, i + 1));
      i++;
      if (i >= KANJI_SEQUENCE.length) {
        setTimeout(() => { i = 0; setTypingKanji(""); }, 2000);
      }
    }, 200);
    return () => clearInterval(timer);
  }, []);

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const storeAuth = (resp: AuthResponse) => {
    localStorage.setItem("yukihon_token", resp.accessToken);
    localStorage.setItem("yukihon_user", JSON.stringify(resp.user));
  };

  const isGoogleConfigured =
    GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes("your_google");

  const handleGoogleLogin = () => {
    if (!isGoogleConfigured) {
      setErrorMsg(
        "Google Client ID chưa được cấu hình. Vui lòng tạo OAuth credentials tại Google Cloud Console rồi điền vào VITE_GOOGLE_CLIENT_ID trong frontend/.env.local"
      );
      return;
    }
    const scope = encodeURIComponent(
      "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
    );
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      GOOGLE_REDIRECT_URI
    )}&response_type=code&scope=${scope}`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    if (error) {
      const desc = params.get("error_description");
      setErrorMsg(desc || `Google login failed: ${error}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (code) {
      authenticateWithGoogle(code);
    }
  }, []);

  const authenticateWithGoogle = async (code: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, redirectUri: GOOGLE_REDIRECT_URI }),
      });
      if (!res.ok) {
        setErrorMsg((await res.text()) || "Google authentication failed.");
        window.history.replaceState({}, document.title, window.location.pathname);
        setIsSubmitting(false);
        return;
      }
      const data = (await res.json()) as AuthResponse;
      storeAuth(data);
      setSuccessMsg("Signed in with Google successfully!");
      setIsSubmitting(false);
      setTimeout(() => navigate("/dashboard"), 500);
    } catch {
      setErrorMsg("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (mode === "register" && password !== confirm) {
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
      setSuccessMsg(
        mode === "login"
          ? "Signed in successfully."
          : "Account created successfully."
      );
      setIsSubmitting(false);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed.";
      setErrorMsg(message || "Authentication failed.");
      setIsSubmitting(false);
    }
  };

  const handleModeChange = (next: AuthMode) => {
    if (next === mode) return;
    resetMessages();
    setMode(next);
  };

  /* ═══════════════════════════════════════════════════════════════════════ */

  return (
    <div className="h-screen relative overflow-hidden bg-background">
      <WinterNightBackground
        snowCount={60}
        sparkleCount={20}
        intensity="normal"
      />

      {/* ── Decorative floating kanji (CSS animation, no parallax) ── */}
      <div className="fixed inset-0 pointer-events-none select-none z-[1]">
        {BG_KANJI.map((k) => (
          <span
            key={k.char}
            className={`absolute font-black text-foreground/[0.03] ${k.size}`}
            style={{ left: k.x, top: k.y }}
          >
            {k.char}
          </span>
        ))}
      </div>

      {/* ── Floating particles (CSS animations) ── */}
      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        {PARTICLES.map((p) => (
          <div
            key={`particle-${p.id}`}
            className="absolute animate-snow-fall"
            style={{
              left: `${p.x}%`,
              top: "-20px",
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              ['--snow-sway' as string]: `${p.drift}px`,
              willChange: "transform",
            }}
          >
            {p.type === "sakura" ? (
              <div
                className="rounded-full"
                style={{
                  width: p.size,
                  height: p.size * 0.7,
                  background: "radial-gradient(ellipse, rgba(244,163,187,0.45) 0%, rgba(244,163,187,0) 70%)",
                }}
              />
            ) : (
              <div
                className="rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  background: "radial-gradient(circle, rgba(147,197,253,0.5) 0%, transparent 70%)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Snow effect hero layer */}
      <div className="fixed inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/20 pointer-events-none z-[1]" />

      {/* ── Top bar ── */}
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
            <span className="font-semibold text-foreground text-sm hidden sm:inline">
              Yukihon
            </span>
          </Link>
        </div>
      </motion.nav>

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 h-[calc(100vh-80px)] flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-24 items-center w-full">
          {/* ━━━ LEFT — Branding ━━━ */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:flex flex-col justify-center space-y-10"
          >
            {/* Chat bubble from Kaoruko */}
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <motion.div
                  className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/25 shadow-lg shadow-primary/15"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img
                    src={kaorukoGuide}
                    alt="Kaoruko"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.span
                  className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-background"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                className="bg-card/60 backdrop-blur-sm learnhub-edge learnhub-shadow-sm rounded-2xl rounded-tl-sm px-6 py-4 max-w-sm relative"
              >
                {/* Visual indicator triangle */}
                <div className="absolute -left-2 top-4 w-4 h-4 bg-card/60 learnhub-edge rotate-45 border-t-0 border-r-0" />
                <p className="text-base leading-relaxed relative z-10">
                  <span className="font-black text-primary uppercase tracking-tighter">Kaoruko</span>
                  <br />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={mode}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-foreground/90 font-medium inline-block"
                    >
                      {mode === "login"
                        ? "Welcome back! I missed our study sessions together 😊"
                        : "So happy to meet you! Let's start our journey to mastery ✨"}
                    </motion.span>
                  </AnimatePresence>
                </p>
              </motion.div>
            </div>

            {/* Typing kanji effect */}
            <motion.div
              className="text-3xl font-bold text-primary/40 h-10 flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {typingKanji}
              <motion.span
                className="inline-block w-0.5 h-7 bg-primary/60 ml-1"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            </motion.div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.15] tracking-tight">
                Master Japanese
                <br />
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  with Kaoruko
                </span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
                Your personal guide to Japanese fluency — comprehensive
                dictionary, JLPT practice, vocabulary quizzes, and immersive
                exercises.
              </p>
            </div>

            {/* Feature chips & feedback removed for compaction */}

            {/* Live activity feed removed for compaction */}

            {/* Social proof */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {["🧑‍🎓", "👩‍💻", "👨‍🎓", "👩‍🏫"].map((e, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
                    className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 border-2 border-background flex items-center justify-center text-xs"
                  >
                    {e}
                  </motion.div>
                ))}
              </div>
              <span>
                <span className="font-semibold text-foreground">50,000+</span>{" "}
                learners already joined
              </span>
            </div>
          </motion.div>

          {/* ━━━ RIGHT — Auth form ━━━ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-[440px] relative">
              {/* Lunar Bloom Glow behind card */}
              <div className="absolute -inset-20 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" />

              <div className="relative learnhub-card p-5 sm:p-7 overflow-visible">
                {/* ── Header ── */}
                <div className="text-center mb-4">
                  {/* Mobile-only Kaoruko avatar */}
                  <div className="lg:hidden mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg shadow-primary/15">
                      <img
                        src={kaorukoGuide}
                        alt="Kaoruko"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <h2 className="text-2xl font-black tracking-tight">
                    {mode === "login" ? "Welcome back" : "Create account"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">
                    {mode === "login"
                      ? "Sign in to continue your journey"
                      : "Start learning Japanese today"}
                  </p>
                </div>

                {/* ── Mode toggle ── */}
                <div className="relative flex p-1 rounded-full bg-muted/50 learnhub-edge mb-4">
                  {/* Sliding pill */}
                  <motion.div
                    className="absolute top-1 bottom-1 rounded-full bg-background shadow-sm border border-border/40"
                    initial={false}
                    animate={{
                      left: mode === "login" ? "4px" : "50%",
                      width: "calc(50% - 4px)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                  {(["login", "register"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleModeChange(m)}
                      className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${mode === m
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground/80"
                        }`}
                    >
                      {m === "login" ? "Sign in" : "Create account"}
                    </button>
                  ))}
                </div>

                {/* ── Google button (always show) ── */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl learnhub-edge bg-background/50 hover:bg-muted/50 gap-2.5 font-bold transition-all group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </Button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/30" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-xs text-muted-foreground bg-card/50 backdrop-blur-sm">
                      or continue with email
                    </span>
                  </div>
                </div>

                {/* ── Alerts ── */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs mb-5">
                        <AlertCircle className="mt-0.5 h-4 w-4 text-destructive shrink-0" />
                        <p className="text-destructive">{errorMsg}</p>
                      </div>
                    </motion.div>
                  )}

                  {successMsg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs mb-5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500 shrink-0" />
                        <p className="text-emerald-500">{successMsg}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Form ── */}
                <AnimatePresence mode="wait">
                  <motion.form
                    key={mode}
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, x: mode === "register" ? 16 : -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: mode === "register" ? -16 : 16 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-2.5"
                  >
                    {/* Display name (register) */}
                    {mode === "register" && (
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Display name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="name"
                            placeholder="Your name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className={`pl-10 learnhub-input h-[46px]`}
                            autoComplete="name"
                          />
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 learnhub-input"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium">
                          Password
                        </Label>
                        {mode === "login" && (
                          <Link
                            to="/forgot-password"
                            className="text-xs text-primary hover:underline"
                          >
                            Forgot password?
                          </Link>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 learnhub-input"
                          autoComplete={
                            mode === "login"
                              ? "current-password"
                              : "new-password"
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Password strength bar (register only) */}
                      {mode === "register" && password.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex gap-1 flex-1">
                            {[1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= pwStrength
                                    ? strengthColors[pwStrength]
                                    : "bg-border/40"
                                  }`}
                              />
                            ))}
                          </div>
                          <span
                            className={`text-[10px] font-medium ${pwStrength >= 3
                                ? "text-emerald-500"
                                : pwStrength >= 2
                                  ? "text-amber-500"
                                  : "text-red-500"
                              }`}
                          >
                            {strengthLabels[pwStrength]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Confirm password (register) */}
                    {mode === "register" && (
                      <>
                        <div className="space-y-1.5">
                          <Label htmlFor="confirm" className="text-sm font-medium">
                            Confirm password
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="confirm"
                              type="password"
                              placeholder="••••••••"
                              value={confirm}
                              onChange={(e) => setConfirm(e.target.value)}
                              className={`pl-10 learnhub-input ${confirm && confirm !== password
                                  ? "border-destructive/50 focus:border-destructive"
                                  : confirm && confirm === password
                                    ? "border-emerald-500/50"
                                    : ""
                                }`}
                              autoComplete="new-password"
                            />
                            {confirm && confirm === password && (
                              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                            )}
                          </div>
                        </div>

                        {/* JLPT target */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            JLPT Target
                          </Label>
                          <div className="flex gap-1.5">
                            {["N5", "N4", "N3", "N2", "N1"].map((level) => (
                              <button
                                key={level}
                                type="button"
                                onClick={() => setJlptTarget(level)}
                                className={`relative flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${jlptTarget === level
                                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                                    : "bg-background/50 border-border/40 text-muted-foreground hover:text-foreground hover:border-border/60"
                                  }`}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Remember me (login) */}
                    {mode === "login" && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="remember"
                          className="border-border/50"
                        />
                        <Label
                          htmlFor="remember"
                          className="text-sm text-muted-foreground cursor-pointer"
                        >
                          Remember me
                        </Label>
                      </div>
                    )}

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-black text-lg learnhub-edge learnhub-shadow hover:brightness-110 active:translate-y-1 active:shadow-none transition-all gap-2 mt-2"
                    >
                      {isSubmitting ? (
                        <motion.div
                          className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      ) : (
                        <>
                          {mode === "login" ? "Sign in" : "Start learning"}
                          <Sparkles className="h-4 w-4" />
                        </>
                      )}
                    </Button>

                    {/* Switch mode */}
                    <p className="text-center text-sm text-muted-foreground pt-2">
                      {mode === "login" ? (
                        <>
                          New here?{" "}
                          <button
                            type="button"
                            onClick={() => handleModeChange("register")}
                            className="text-primary hover:underline font-semibold"
                          >
                            Join Kaoruko&apos;s class
                          </button>
                        </>
                      ) : (
                        <>
                          Already have an account?{" "}
                          <button
                            type="button"
                            onClick={() => handleModeChange("login")}
                            className="text-primary hover:underline font-semibold"
                          >
                            Sign in
                          </button>
                        </>
                      )}
                    </p>
                  </motion.form>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
