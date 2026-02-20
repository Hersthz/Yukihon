// src/pages/Auth.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Target, AlertCircle, CheckCircle2, Chrome } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import GlassCard from "@/components/genshin/GlassCard";
import KaorukoAvatar from "@/components/genshin/KaorukoAvatar";
import WinterNightBackground from "@/components/WinterNightBackground";
import kaorukoWelcome from "@/assets/kaoruko-welcome.png";

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

  const navigate = useNavigate();

  const features = [
    {
      icon: "📚",
      title: "Smart Japanese dictionary",
      desc: "Vocab, kanji, grammar with examples",
    },
    {
      icon: "📝",
      title: "JLPT-style practice tests",
      desc: "From N5 to N1 levels",
    },
    {
      icon: "🎯",
      title: "Vocabulary quiz mode",
      desc: "Interactive flashcard system",
    },
    {
      icon: "🎧",
      title: "Reading & listening stories",
      desc: "Immersive mini stories",
    },
  ];

  const resetMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const storeAuth = (resp: AuthResponse) => {
    localStorage.setItem("yukihon_token", resp.accessToken);
    localStorage.setItem("yukihon_user", JSON.stringify(resp.user));
  };

  const isGoogleConfigured = GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes("your_google");

  const handleGoogleLogin = () => {
    if (!isGoogleConfigured) {
      setErrorMsg("Google Client ID chưa được cấu hình. Vui lòng tạo OAuth credentials tại Google Cloud Console rồi điền vào VITE_GOOGLE_CLIENT_ID trong frontend/.env.local");
      return;
    }

    // This will redirect to Google's OAuth consent screen
    const scope = encodeURIComponent("https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile");
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=${scope}`;
    window.location.href = authUrl;
  };

  // Handle Google OAuth callback - check if there's an auth code or error in URL
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, redirectUri: GOOGLE_REDIRECT_URI }),
      });

      if (!res.ok) {
        const text = await res.text();
        setErrorMsg(text || "Google authentication failed.");
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        setIsSubmitting(false);
        return;
      }

      const data = (await res.json()) as AuthResponse;
      storeAuth(data);
      setSuccessMsg("Signed in with Google successfully!");
      setIsSubmitting(false);

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err) {
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
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : {
              displayName,
              email,
              password,
              jlptTargetLevel: jlptTarget,
            };

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        setErrorMsg(text || "Authentication failed.");
        setIsSubmitting(false);
        return;
      }

      const data = (await res.json()) as AuthResponse;
      storeAuth(data);
      setSuccessMsg(mode === "login" ? "Signed in successfully." : "Account created successfully.");
      setIsSubmitting(false);

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleModeChange = (next: AuthMode) => {
    if (next === mode) return;
    resetMessages();
    setMode(next);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <WinterNightBackground snowCount={100} sparkleCount={60} intensity="light" />

      <div className="absolute inset-0 z-[1]">
        <img
          src={kaorukoWelcome}
          alt="Kaoruko"
          className="absolute right-0 bottom-0 w-1/2 h-auto object-contain opacity-20 lg:opacity-40 animate-zoom-subtle"
          style={{ maxHeight: "90vh" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80" />
      </div>

      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 px-6 py-4"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-background font-bold text-lg">
              日
            </div>
            <span className="font-semibold text-foreground">Kaoruko Lab</span>
          </Link>
        </div>
      </motion.nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-200px)]">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <p className="label-caps text-primary">Japanese Learning · JLPT N5–N1</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-foreground">Master Japanese</span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent-warm">
                  with Kaoruko
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Your personal guide to Japanese fluency. Comprehensive dictionary, JLPT practice
                tests, vocabulary quizzes, and immersive reading & listening exercises — all in one
                place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <GlassCard className="p-4 hover:border-primary/30 transition-all" hover>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{feature.icon}</span>
                      <div>
                        <p className="font-medium text-foreground text-sm">{feature.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{feature.desc}</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <motion.div
              className="absolute -top-8 -left-8 z-10"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <KaorukoAvatar mood={mode === "register" ? "bigSmile" : "gentle"} size="xl" glow />
            </motion.div>

            <GlassCard className="p-8 pt-16 max-w-md ml-auto" glow="primary">
              <div className="flex p-1 glass-card-light rounded-full mb-6">
                <button
                  type="button"
                  onClick={() => handleModeChange("login")}
                  className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                    mode === "login"
                      ? "bg-gradient-to-r from-primary to-secondary text-background shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("register")}
                  className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                    mode === "register"
                      ? "bg-gradient-to-r from-primary to-secondary text-background shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Create account
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
                  <p className="text-destructive">{errorMsg}</p>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                  <p className="text-emerald-500">{successMsg}</p>
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.form
                  key={mode}
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: mode === "register" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === "register" ? -20 : 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {mode === "register" && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground text-sm">
                        Display name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="pl-10 h-12 bg-white/5 border-white/20 rounded-xl focus:border-primary"
                          autoComplete="name"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground text-sm">
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
                        className="pl-10 h-12 bg-white/5 border-white/20 rounded-xl focus:border-primary"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-foreground text-sm">
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
                        className="pl-10 pr-10 h-12 bg-white/5 border-white/20 rounded-xl focus:border-primary"
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {mode === "register" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="confirm" className="text-foreground text-sm">
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
                            className="pl-10 h-12 bg-white/5 border-white/20 rounded-xl focus:border-primary"
                            autoComplete="new-password"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-foreground text-sm flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          JLPT Target
                        </Label>
                        <div className="flex gap-2">
                          {["N5", "N4", "N3", "N2", "N1"].map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setJlptTarget(level)}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                                jlptTarget === level
                                  ? "bg-gradient-to-r from-primary to-secondary text-background shadow-md"
                                  : "bg-white/5 border border-white/20 text-muted-foreground hover:text-foreground hover:border-white/40"
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {mode === "login" && (
                    <div className="flex items-center gap-2">
                      <Checkbox id="remember" className="border-white/30" />
                      <Label htmlFor="remember" className="text-sm text-muted-foreground">
                        Remember me
                      </Label>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="gradient-btn w-full text-base py-4"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? mode === "login"
                        ? "Signing in..."
                        : "Creating account..."
                      : mode === "login"
                      ? "Sign in"
                      : "Start learning"}
                  </Button>

                  {isGoogleConfigured && (
                    <>
                      <div className="relative my-4">
                        <Separator className="bg-white/20" />
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
                          <span className="bg-card-foreground/10 px-3 text-xs text-muted-foreground font-medium">Or</span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isSubmitting}
                        className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-foreground py-4 rounded-xl transition-all"
                      >
                        <Chrome className="w-4 h-4 mr-2" />
                        Continue with Google
                      </Button>
                    </>
                  )}

                  <p className="text-center text-sm text-muted-foreground">
                    {mode === "login" ? (
                      <>
                        New here?{" "}
                        <button
                          type="button"
                          onClick={() => handleModeChange("register")}
                          className="text-primary hover:underline font-medium"
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
                          className="text-primary hover:underline font-medium"
                        >
                          Sign in
                        </button>
                      </>
                    )}
                  </p>
                </motion.form>
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
