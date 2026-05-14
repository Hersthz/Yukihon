import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import kaorukoGuide from "@/assets/kaoruko-guide.png";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthMode } from "./auth.types";
import { getPasswordStrength, strengthColors, strengthLabels } from "./auth.utils";

interface AuthFormCardProps {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  isSubmitting: boolean;
  errorMsg: string | null;
  successMsg: string | null;
  displayName: string;
  setDisplayName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  jlptTarget: string;
  setJlptTarget: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleLogin: () => void;
}

const AuthFormCard = ({
  mode,
  setMode,
  isSubmitting,
  errorMsg,
  successMsg,
  displayName,
  setDisplayName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  jlptTarget,
  setJlptTarget,
  showPassword,
  setShowPassword,
  onSubmit,
  onGoogleLogin,
}: AuthFormCardProps) => {
  const pwStrength = getPasswordStrength(password);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="flex justify-center lg:justify-end"
    >
      <div className="w-full max-w-[440px] relative">
        <div className="absolute -inset-20 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" />

        <div className="relative learnhub-card p-5 sm:p-7 overflow-visible">
          <div className="text-center mb-4">
            <div className="lg:hidden mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg shadow-primary/15">
                <img src={kaorukoGuide} alt="Kaoruko" className="w-full h-full object-cover" />
              </div>
            </div>

            <h2 className="text-2xl font-black tracking-tight">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              {mode === "login" ? "Sign in to continue your journey" : "Start learning Japanese today"}
            </p>
          </div>

          <div className="relative flex p-1 rounded-full bg-muted/50 learnhub-edge mb-4">
            <motion.div
              className="absolute top-1 bottom-1 rounded-full bg-background shadow-sm border border-border/40"
              initial={false}
              animate={{
                left: mode === "login" ? "4px" : "50%",
                width: "calc(50% - 4px)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            {(["login", "register"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                  mode === option
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                {option === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onGoogleLogin}
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

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              onSubmit={onSubmit}
              initial={{ opacity: 0, x: mode === "register" ? 16 : -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "register" ? -16 : 16 }}
              transition={{ duration: 0.25 }}
              className="space-y-2.5"
            >
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
                      className="pl-10 learnhub-input h-[46px]"
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

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

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 learnhub-input"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {mode === "register" && password.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            level <= pwStrength ? strengthColors[pwStrength] : "bg-border/40"
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-[10px] font-medium ${
                        pwStrength >= 3 ? "text-emerald-500" : pwStrength >= 2 ? "text-amber-500" : "text-red-500"
                      }`}
                    >
                      {strengthLabels[pwStrength]}
                    </span>
                  </div>
                )}
              </div>

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
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`pl-10 learnhub-input ${
                          confirmPassword && confirmPassword !== password
                            ? "border-destructive/50 focus:border-destructive"
                            : confirmPassword && confirmPassword === password
                              ? "border-emerald-500/50"
                              : ""
                        }`}
                        autoComplete="new-password"
                      />
                      {confirmPassword && confirmPassword === password && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  </div>

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
                          className={`relative flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                            jlptTarget === level
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

              {mode === "login" && (
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" className="border-border/50" />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    Remember me
                  </Label>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-black text-lg learnhub-edge learnhub-shadow hover:brightness-110 active:translate-y-1 active:shadow-none transition-all gap-2 mt-2"
              >
                {isSubmitting ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <>
                    {mode === "login" ? "Sign in" : "Start learning"}
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground pt-2">
                {mode === "login" ? (
                  <>
                    New here?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("register")}
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
                      onClick={() => setMode("login")}
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
  );
};

export default AuthFormCard;
