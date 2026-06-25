import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Target,
  User,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WinterMark, WinterThemeToggle } from "@/components/winter";
import kaorukoGuide from "@/assets/kaoruko-guide.png";
import type { AuthMode } from "./auth.types";
import { getPasswordStrength, strengthColors, strengthLabels } from "./auth.utils";

interface SlidingAuthCardProps {
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
  resetToken: string;
  setResetToken: (value: string) => void;
  jlptTarget: string;
  setJlptTarget: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleLogin: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const GoogleButton = ({ onClick, disabled }: { onClick: () => void; disabled: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex h-11 w-full items-center justify-center gap-2.5 rounded-2xl text-sm font-semibold transition-colors disabled:opacity-60"
    style={{
      color: "hsl(var(--w-ink))",
      background: "hsl(var(--w-card-solid) / 0.7)",
      border: "1px solid hsl(var(--w-border))",
    }}
  >
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
    Tiếp tục với Google
  </button>
);

const Messages = ({
  errorMsg,
  successMsg,
}: {
  errorMsg: string | null;
  successMsg: string | null;
}) => (
  <AnimatePresence>
    {errorMsg && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2.5 text-xs">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-red-500">{errorMsg}</p>
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
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2.5 text-xs">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          <p className="text-emerald-600">{successMsg}</p>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const SlidingAuthCard = (props: SlidingAuthCardProps) => {
  const {
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
    resetToken,
    setResetToken,
    jlptTarget,
    setJlptTarget,
    showPassword,
    setShowPassword,
    onSubmit,
    onGoogleLogin,
    isDark,
    onToggleTheme,
  } = props;

  const isRegister = mode === "register";
  const isForgot = mode === "forgot";
  const isReset = mode === "reset";
  const pwStrength = getPasswordStrength(password);

  const signinTitle = isForgot
    ? "Đặt lại mật khẩu"
    : isReset
      ? "Đặt mật khẩu mới"
      : "Chào mừng trở lại";
  const signinSubtitle = isForgot
    ? "Nhập email để nhận mã đặt lại"
    : isReset
      ? "Nhập mã đặt lại và mật khẩu mới"
      : "Đăng nhập để tiếp tục hành trình của bạn";
  const submitLabel = isForgot ? "Gửi mã đặt lại" : isReset ? "Đặt lại mật khẩu" : "Đăng nhập";

  const spinner = (
    <motion.div
      className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  );

  return (
    <div className={`auth-shell winter-glass ${isRegister ? "is-signup" : ""}`}>
      {/* Top controls (over everything) */}
      <Link
        to="/"
        className="absolute left-4 top-4 z-[120] flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold backdrop-blur-md transition-colors"
        style={{
          color: "hsl(var(--w-ink))",
          background: "hsl(var(--w-card))",
          border: "1px solid hsl(var(--w-glass-border))",
        }}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Trang chủ</span>
      </Link>
      <div className="absolute right-4 top-4 z-[120]">
        <WinterThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>

      {/* ---------- SIGN IN side (login / forgot / reset) ---------- */}
      <div className="auth-form-panel auth-panel-signin">
        <div className="mx-auto w-full max-w-sm">
          <h2 className="text-2xl font-black tracking-tight text-foreground">{signinTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{signinSubtitle}</p>

          {mode === "login" && (
            <div className="mt-5">
              <GoogleButton onClick={onGoogleLogin} disabled={isSubmitting} />
              <div className="my-4 flex items-center gap-3">
                <div className="winter-divider flex-1" />
                <span className="text-xs text-muted-foreground">hoặc bằng email</span>
                <div className="winter-divider flex-1" />
              </div>
            </div>
          )}

          <div className="mt-4">
            <Messages errorMsg={errorMsg} successMsg={successMsg} />
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            {(isForgot || mode === "login") && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="winter-input pl-11"
                    autoComplete="email"
                  />
                </div>
              </div>
            )}

            {isReset && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Mã đặt lại</Label>
                <Input
                  placeholder="Dán mã đặt lại"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="winter-input"
                  autoComplete="one-time-code"
                />
              </div>
            )}

            {(mode === "login" || isReset) && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">
                  {isReset ? "Mật khẩu mới" : "Mật khẩu"}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="winter-input pl-11 pr-11"
                    autoComplete={isReset ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {isReset && password.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="winter-input pl-11"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="winter-btn mt-1 w-full">
              {isSubmitting ? spinner : submitLabel}
            </button>

            {(isForgot || isReset) && (
              <p className="pt-1 text-center text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-semibold text-primary hover:underline"
                >
                  Quay lại đăng nhập
                </button>
                {isForgot && (
                  <>
                    <span className="mx-2">•</span>
                    <button
                      type="button"
                      onClick={() => setMode("reset")}
                      className="font-semibold text-primary hover:underline"
                    >
                      Tôi đã có mã
                    </button>
                  </>
                )}
              </p>
            )}
          </form>

          {/* mobile-only switch */}
          {mode === "login" && (
            <p className="mt-5 text-center text-sm text-muted-foreground lg:hidden">
              Người mới?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="font-bold text-primary hover:underline"
              >
                Tạo tài khoản
              </button>
            </p>
          )}
        </div>
      </div>

      {/* ---------- SIGN UP side (register) ---------- */}
      <div className="auth-form-panel auth-panel-signup">
        <div className="mx-auto w-full max-w-sm">
          <h2 className="text-2xl font-black tracking-tight text-foreground">Tạo tài khoản</h2>
          <p className="mt-1 text-sm text-muted-foreground">Bắt đầu học tiếng Nhật ngay hôm nay</p>

          <div className="mt-4">
            <Messages errorMsg={errorMsg} successMsg={successMsg} />
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Tên hiển thị</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tên của bạn"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="winter-input pl-11"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="winter-input pl-11"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="winter-input pl-11 pr-11"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          level <= pwStrength
                            ? strengthColors[pwStrength]
                            : "bg-muted-foreground/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {strengthLabels[pwStrength]}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`winter-input pl-11 ${
                    confirmPassword && confirmPassword !== password ? "!border-red-400" : ""
                  }`}
                  autoComplete="new-password"
                />
                {confirmPassword && confirmPassword === password && (
                  <CheckCircle2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Target className="h-3.5 w-3.5" />
                Mục tiêu JLPT
              </Label>
              <div className="flex gap-1.5">
                {["N5", "N4", "N3", "N2", "N1"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setJlptTarget(level)}
                    className="flex-1 rounded-xl py-2 text-sm font-semibold transition-all"
                    style={
                      jlptTarget === level
                        ? {
                            color: "hsl(var(--w-accent-fg))",
                            background:
                              "linear-gradient(135deg, hsl(var(--w-accent)), hsl(var(--w-accent-strong)))",
                          }
                        : {
                            color: "hsl(var(--w-ink-soft))",
                            background: "hsl(var(--w-card-solid) / 0.6)",
                            border: "1px solid hsl(var(--w-border))",
                          }
                    }
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="winter-btn mt-1 w-full">
              {isSubmitting ? spinner : "Bắt đầu học"}
            </button>
          </form>

          {/* mobile-only switch */}
          <p className="mt-5 text-center text-sm text-muted-foreground lg:hidden">
            Đã có tài khoản?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="font-bold text-primary hover:underline"
            >
              Đăng nhập
            </button>
          </p>
        </div>
      </div>

      {/* ---------- Sliding overlay ---------- */}
      <div className="auth-overlay-wrap">
        <div className="auth-overlay">
          {/* Left overlay — shown while registering (prompt back to login) */}
          <div className="auth-overlay-panel auth-overlay-left">
            <div
              className="mb-5 h-20 w-20 overflow-hidden rounded-full"
              style={{ border: "2px solid hsl(0 0% 100% / 0.4)" }}
            >
              <img src={kaorukoGuide} alt="Kaoruko" className="h-full w-full object-cover" />
            </div>
            <h3 className="text-3xl font-black tracking-tight">Chào mừng trở lại!</h3>
            <p className="mt-3 text-sm leading-7 opacity-85">
              Đã có tài khoản? Đăng nhập để tiếp tục hành trình chinh phục tiếng Nhật cùng Kaoruko.
            </p>
            <button
              type="button"
              onClick={() => setMode("login")}
              className="mt-7 rounded-full border-2 border-white/70 px-8 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors hover:bg-white/15"
            >
              Đăng nhập
            </button>
          </div>

          {/* Right overlay — shown while logging in (prompt to sign up) */}
          <div className="auth-overlay-panel auth-overlay-right">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <WinterMark size={32} className="text-white" />
            </div>
            <h3 className="text-3xl font-black tracking-tight">Người mới ở đây?</h3>
            <p className="mt-3 text-sm leading-7 opacity-85">
              Tạo tài khoản để mở khóa từ điển, luyện JLPT, trắc nghiệm và bài tập nhập vai.
            </p>
            <button
              type="button"
              onClick={() => setMode("register")}
              className="mt-7 rounded-full border-2 border-white/70 px-8 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors hover:bg-white/15"
            >
              Tạo tài khoản
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlidingAuthCard;
