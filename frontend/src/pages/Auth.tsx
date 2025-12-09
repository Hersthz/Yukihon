import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import GlassCard from "@/components/genshin/GlassCard";
import KaorukoAvatar from "@/components/genshin/KaorukoAvatar";
import WinterNightBackground from "@/components/WinterNightBackground";
import kaorukoWelcome from "@/assets/kaoruko-welcome.png";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [jlptTarget, setJlptTarget] = useState("N4");

  const features = [
    { icon: "📚", title: "Smart Japanese dictionary", desc: "Vocab, kanji, grammar with examples" },
    { icon: "📝", title: "JLPT-style practice tests", desc: "From N5 to N1 levels" },
    { icon: "🎯", title: "Vocabulary quiz mode", desc: "Interactive flashcard system" },
    { icon: "🎧", title: "Reading & listening stories", desc: "Immersive mini stories" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Winter Night Background */}
      <WinterNightBackground snowCount={50} sparkleCount={20} intensity="light" />

      {/* Background with Kaoruko */}
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

      {/* Nav */}
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

          <div className="hidden md:flex items-center gap-1 glass-card px-2 py-1.5">
            {["Home", "JLPT Roadmap", "Modules", "Support"].map((link) => (
              <Link
                key={link}
                to="/"
                className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
              >
                {link}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMode("login")}
              className="gradient-btn-outline text-sm"
            >
              Sign in
            </button>
            <button 
              onClick={() => setMode("register")}
              className="gradient-btn text-sm py-2"
            >
              Get started
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[calc(100vh-200px)]">
          {/* Left - Copy */}
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
                Your personal guide to Japanese fluency. Comprehensive dictionary, JLPT practice tests, 
                vocabulary quizzes, and immersive reading & listening exercises — all in one place.
              </p>
            </div>

            {/* Feature chips */}
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

          {/* Right - Auth Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Kaoruko peeking */}
            <motion.div
              className="absolute -top-8 -left-8 z-10"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <KaorukoAvatar 
                mood={mode === "register" ? "bigSmile" : "gentle"} 
                size="xl" 
                glow 
              />
            </motion.div>

            <GlassCard className="p-8 pt-16 max-w-md ml-auto" glow="primary">
              {/* Tab switcher */}
              <div className="flex p-1 glass-card-light rounded-full mb-8">
                <button
                  onClick={() => setMode("login")}
                  className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                    mode === "login"
                      ? "bg-gradient-to-r from-primary to-secondary text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign in
                </button>
                <button
                  onClick={() => setMode("register")}
                  className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                    mode === "register"
                      ? "bg-gradient-to-r from-primary to-secondary text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Create account
                </button>
              </div>

              {/* Form */}
              <AnimatePresence mode="wait">
                <motion.form
                  key={mode}
                  initial={{ opacity: 0, x: mode === "register" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === "register" ? -20 : 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {mode === "register" && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground text-sm">Display name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder="Your name"
                          className="pl-10 h-12 bg-white/5 border-white/20 rounded-xl focus:border-primary"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground text-sm">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 h-12 bg-white/5 border-white/20 rounded-xl focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-foreground text-sm">Password</Label>
                      {mode === "login" && (
                        <Link to="/forgot-password" className="text-xs text-primary hover:underline">
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
                        className="pl-10 pr-10 h-12 bg-white/5 border-white/20 rounded-xl focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {mode === "register" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="confirm" className="text-foreground text-sm">Confirm password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="confirm"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 h-12 bg-white/5 border-white/20 rounded-xl focus:border-primary"
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
                                  ? "bg-gradient-to-r from-primary to-secondary text-background"
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

                  <button type="submit" className="gradient-btn w-full text-base py-4">
                    {mode === "login" ? "Sign in" : "Start learning"}
                  </button>

                  <p className="text-center text-sm text-muted-foreground">
                    {mode === "login" ? (
                      <>
                        New here?{" "}
                        <button 
                          type="button"
                          onClick={() => setMode("register")}
                          className="text-primary hover:underline font-medium"
                        >
                          Join Kaoruko's class
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <button 
                          type="button"
                          onClick={() => setMode("login")}
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
