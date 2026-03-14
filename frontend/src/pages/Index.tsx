// src/pages/Index.tsx
import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WinterNightBackground from "@/components/WinterNightBackground";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Headphones,
  TrendingUp,
  Sparkles,
  Star,
  MessageCircle,
  CheckCircle,
  Flame,
} from "lucide-react";
import kaorukoWelcome from "@/assets/kaoruko-welcome.png";
import kaorukoHappy from "@/assets/kaoruko-happy.png";
import kaorukoGuide from "@/assets/kaoruko-guide.png";
import kaorukoExcited from "@/assets/kaoruko-excited.png";

/* ─── Decorative floating kanji (Subdued) ─── */
const FLOATING_KANJI = [
  { char: "雪", x: "85%", y: "15%", delay: 0, size: "text-[12rem] opacity-[0.02]" },
  { char: "静", x: "5%", y: "45%", delay: 2, size: "text-9xl opacity-[0.015]" },
  { char: "魂", x: "75%", y: "75%", delay: 4, size: "text-8xl opacity-[0.01]" },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA: COURSE CATALOG PREVIEW (Claymorphism)
// ─────────────────────────────────────────────────────────────────────────────
const COURSE_CATALOG = [
  {
    title: "Hiragana & Katakana",
    level: "Beginner • 2 weeks",
    desc: "Master the foundational alphabets with trace-along memory games.",
    color: "from-pink-400 to-rose-400",
    shadow: "shadow-pink-500/20",
    icon: Sparkles,
  },
  {
    title: "JLPT N5 Core",
    level: "Basic • 3 months",
    desc: "800 vocabulary words and 100 kanji wrapped in fun daily stories.",
    color: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-500/20",
    icon: Star,
  },
  {
    title: "JLPT N4 Mastery",
    level: "Intermediate • 4 months",
    desc: "1,500 new words and conversational mastery for everyday life.",
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-500/20",
    icon: Flame,
  },
  {
    title: "JLPT N3 Fluency",
    level: "Advanced • 6 months",
    desc: "Read real Japanese news and understand natural conversations.",
    color: "from-indigo-400 to-purple-500",
    shadow: "shadow-indigo-500/20",
    icon: BookOpen,
  },
];

/* ─── JLPT levels ─── */
const JLPT_LEVELS = [
  { level: "N5", title: "Beginner", lessons: 45, vocab: "800", kanji: "100", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", hover: "hover:border-emerald-500/40" },
  { level: "N4", title: "Elementary", lessons: 60, vocab: "1,500", kanji: "300", color: "bg-sky-500/10 text-sky-400 border-sky-500/20", hover: "hover:border-sky-500/40" },
  { level: "N3", title: "Intermediate", lessons: 75, vocab: "3,750", kanji: "650", color: "bg-violet-500/10 text-violet-400 border-violet-500/20", hover: "hover:border-violet-500/40" },
  { level: "N2", title: "Upper-Int.", lessons: 90, vocab: "6,000", kanji: "1,000", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", hover: "hover:border-amber-500/40" },
  { level: "N1", title: "Advanced", lessons: 120, vocab: "10,000", kanji: "2,000", color: "bg-rose-500/10 text-rose-400 border-rose-500/20", hover: "hover:border-rose-500/40" },
];

/* ─── Features ─── */
const FEATURES = [
  { icon: Brain, title: "Smart review system", desc: "Spaced repetition algorithm adapts to your learning pace, ensuring efficient memorization and long-term retention.", gradient: "from-purple-500 to-pink-500", large: true },
  { icon: BookOpen, title: "Interactive lessons", desc: "Engaging content with furigana support, example sentences, and immediate feedback on every exercise.", gradient: "from-blue-500 to-cyan-500", large: false },
  { icon: Headphones, title: "Listening & speaking", desc: "Native audio recordings and pronunciation practice to develop natural speaking and listening skills.", gradient: "from-green-500 to-emerald-500", large: false },
  { icon: TrendingUp, title: "Progress dashboard", desc: "Detailed statistics, streak tracking, and achievement system to keep you motivated on your journey.", gradient: "from-orange-500 to-yellow-500", large: false },
];

/* ─── Testimonials ─── */
const TESTIMONIALS = [
  { name: "Sarah Chen", level: "N3 → N2", quote: "Passed N2 in 8 months! The spaced repetition system made memorizing kanji so much easier.", avatar: "🧑‍🎓" },
  { name: "Marcus Johnson", level: "N5 → N4", quote: "The daily 15-minute lessons fit perfectly into my busy schedule. Already seeing great progress.", avatar: "👨‍💼" },
  { name: "Yuki Tanaka", level: "N4 → N3", quote: "Best Japanese learning platform I've tried. The listening exercises are particularly helpful.", avatar: "👩‍🏫" },
];

/* ─── Animation variants ─── */
const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const Index = () => {
  /* ── Live learner counter ── */
  const [liveCount, setLiveCount] = useState(847);
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveCount((c) => c + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  /* ── Mouse parallax for hero decorations ── */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const parallaxX = useTransform(mouseX, [0, 1], [-15, 15]);
  const parallaxY = useTransform(mouseY, [0, 1], [-15, 15]);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mouseX.set(e.clientX / window.innerWidth);
    mouseY.set(e.clientY / window.innerHeight);
  }, [mouseX, mouseY]);

  return (
    <div className="min-h-screen bg-background overflow-hidden relative" onMouseMove={handleMouseMove}>
      <Navigation />
      <WinterNightBackground snowCount={40} sparkleCount={20} intensity="light" />

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="hero" className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
        {/* Floating kanji background with parallax */}
        <motion.div className="absolute inset-0 pointer-events-none select-none overflow-hidden" style={{ x: parallaxX, y: parallaxY }}>
          {FLOATING_KANJI.map((k) => (
            <motion.span
              key={k.char}
              className={`absolute ${k.size} font-black text-foreground`}
              style={{ left: k.x, top: k.y }}
              animate={{ y: [0, -20, 0], opacity: [0.01, 0.02, 0.01] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: k.delay }}
            >
              {k.char}
            </motion.span>
          ))}
        </motion.div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">
            {/* Left Column - Text */}
            <motion.div
              className="flex-1 space-y-8 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Lunar Bloom Glow */}
              <div className="absolute -top-32 -left-20 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
              <div className="absolute top-10 -right-20 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[100px] pointer-events-none" />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                className="flex items-center gap-4 bg-card/60 backdrop-blur-2xl p-4 rounded-[2rem] border border-white/10 shadow-xl w-fit clay-card relative z-20"
              >
                <img src={kaorukoHappy} alt="Kaoruko" className="w-16 h-16 rounded-full border-2 border-primary/20" />
                <div>
                  <p className="text-base font-medium">
                    Hello! I'm <span className="text-primary font-bold">Kaoruko</span>
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">Let's learn Japanese magically!</p>
                </div>
              </motion.div>

              {/* Badge */}
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="h-3 w-3" />
                  JLPT N5 → N1 • Daily lessons • Smart reviews
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold tracking-tight leading-[1.1]"
              >
                Master Japanese in focused{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    15-minute
                  </span>
                  <svg className="absolute -bottom-3 left-0 w-full h-4" viewBox="0 0 200 12" fill="none">
                    <motion.path
                      d="M2 10C40 4 80 8 100 9C120 10 160 6 198 10"
                      stroke="url(#session-gradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
                    />
                    <defs>
                      <linearGradient id="session-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--secondary))" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>{" "}
                sessions
              </motion.h1>

              {/* Description */}
              <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Build fluency through bite-sized daily lessons, intelligent spaced repetition, and
                comprehensive JLPT preparation with your personal guide, Kaoruko.
              </motion.p>

              {/* Playful CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="pt-6 flex flex-col sm:flex-row gap-5 items-start relative z-20"
              >
                <Link to="/auth">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg clay-btn bg-primary hover:bg-primary text-white w-full sm:w-auto overflow-hidden group relative"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                       Start free trial
                       <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg clay-btn bg-card text-foreground border-transparent hover:bg-card/80 w-full sm:w-auto">
                    Take level test
                  </Button>
                </Link>
              </motion.div>

              {/* Social proof */}
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {["🧑‍🎓", "👨‍💼", "👩‍🏫", "🧑‍💻"].map((emoji, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2 + i * 0.1, type: "spring" }}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-background flex items-center justify-center text-sm"
                    >
                      {emoji}
                    </motion.div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-bold text-foreground">50,000+</span>
                  <span className="text-muted-foreground"> active learners</span>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">4.9</span>
                </div>
              </motion.div>

              {/* Live activity indicator */}
              <motion.div
                variants={fadeUp}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span>
                  <span className="font-semibold text-foreground">{liveCount}</span> learners online now
                </span>
              </motion.div>
            </motion.div>

            {/* ── Right visual ── */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            >
              {/* Glow backdrop */}
              <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.12),transparent_60%)] blur-2xl" />

              <div className="relative group max-w-md mx-auto">
                {/* Card border glow */}
                <div className="pointer-events-none absolute -inset-1 rounded-[2rem] bg-gradient-to-tr from-primary/25 via-secondary/15 to-primary/25 opacity-50 blur-lg group-hover:opacity-75 transition-opacity duration-700" />

                {/* Main image */}
                <div className="relative rounded-[1.75rem] bg-card/90 backdrop-blur-xl border border-border/40 shadow-2xl shadow-primary/10 overflow-hidden group-hover:-translate-y-1 transition-transform duration-500">
                  <img
                    src={kaorukoWelcome}
                    alt="Kaoruko — your Japanese guide"
                    className="w-full h-full object-cover scale-[1.02] group-hover:scale-[1.05] transition-transform duration-700"
                  />
                </div>

                {/* Floating vocab cards */}
                <motion.div
                  className="absolute -top-4 -left-4 lg:-left-12 bg-card/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-border/40 shadow-xl"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="text-2xl font-bold text-primary">日本語</div>
                  <div className="text-xs text-muted-foreground mt-0.5">にほんご • nihongo</div>
                </motion.div>

                <motion.div
                  className="absolute top-1/4 -right-4 lg:-right-12 bg-card/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-border/40 shadow-xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <div className="text-2xl font-bold text-secondary">勉強</div>
                  <div className="text-xs text-muted-foreground mt-0.5">べんきょう • study</div>
                </motion.div>

                <motion.div
                  className="hidden sm:flex absolute bottom-14 -left-6 lg:-left-12 bg-card/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-border/40 shadow-xl items-center gap-3"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">+15 words today</div>
                    <div className="text-xs text-muted-foreground">Keep going!</div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-3 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-br-sm shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
                >
                  <p className="text-sm font-medium">がんばって！💪</p>
                </motion.div>

                {/* Streak counter floating card */}
                <motion.div
                  className="absolute bottom-1/4 -right-6 lg:-right-14 bg-card/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-border/40 shadow-xl"
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                >
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <div>
                      <div className="text-sm font-bold">32 days streak</div>
                      <div className="text-xs text-muted-foreground">Personal best!</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Section divider */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          COURSE CATALOG PREVIEW
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="courses" className="py-24 md:py-32 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <span className="text-sm font-bold text-primary uppercase tracking-[0.2em] bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
              Curriculum
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-6 mb-4">
              Your Learning Path
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From absolute beginner to conversational fluency, our curriculum feels like playing a game rather than studying.
            </p>
          </motion.div>

          <div className="relative max-w-7xl mx-auto">
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={stagger}
            >
              {COURSE_CATALOG.map((course, i) => (
                <motion.div key={i} variants={fadeUp} className="relative group">
                  <div className={`clay-card bg-gradient-to-b ${course.color} p-8 h-full text-white ${course.shadow} flex flex-col justify-between overflow-hidden relative group-hover:-translate-y-2 transition-transform duration-500`}>
                    
                    {/* Background decoration */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors" />
                    
                    <div>
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/30">
                        <course.icon className="w-7 h-7 text-white drop-shadow-md" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2 tracking-tight drop-shadow-sm">{course.title}</h3>
                      <div className="text-white/80 text-sm font-medium mb-4 bg-black/10 w-fit px-3 py-1 rounded-full">{course.level}</div>
                      <p className="text-white/90 leading-relaxed text-sm">
                        {course.desc}
                      </p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/20 font-bold flex items-center justify-between text-white/90 group-hover:text-white group-hover:translate-x-1 transition-all">
                      <span>Explore Course</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          PROGRESS TRACKING DEMO
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] via-transparent to-secondary/[0.03]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text & Pitch */}
            <motion.div
              className="space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
            >
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-[0.2em]">
                  <Flame className="h-4 w-4" />
                  Gamified Growth
                </span>
              </motion.div>

              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Watch your fluency{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  bloom
                </span>
              </motion.h2>

              <motion.p variants={fadeUp} className="text-lg text-muted-foreground leading-relaxed">
                Stay motivated with beautiful, actionable insights. Track your daily streaks, master new kanji, and level up your skills in a completely stress-free environment.
              </motion.p>

              <div className="space-y-4 pt-4">
                {[
                  { tip: "Maintain your daily study streak", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
                  { tip: "Watch your mastery bloom over time", icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
                  { tip: "Track progress towards your JLPT goals", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg}`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <p className="font-medium text-base">{item.tip}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Clay Dashboard Widget */}
            <motion.div
              className="relative relative z-10"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <div className="relative max-w-md mx-auto">
                <div className="absolute -inset-10 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[3rem] blur-3xl opacity-50" />
                
                {/* Main Dashboard Card */}
                <div className="clay-card bg-card/90 backdrop-blur-2xl p-6 sm:p-8 rounded-[2.5rem] border border-white/20 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                  
                  <div className="flex items-center gap-5 relative z-10 mb-8">
                    <img src={kaorukoExcited} alt="Avatar" className="w-16 h-16 rounded-full border-[3px] border-background shadow-md bg-primary/10" />
                    <div>
                      <h3 className="text-xl font-bold">Kaoruko's Student</h3>
                      <p className="text-sm font-medium text-muted-foreground">JLPT N5 Path • Unit 3</p>
                    </div>
                  </div>

                  {/* Level Progress */}
                  <div className="mb-8 relative z-10">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <div className="text-sm font-bold text-primary mb-1">Level 12</div>
                        <div className="text-3xl font-black">1,240 XP</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground font-medium mb-1">Next Level</div>
                        <div className="text-sm font-bold text-foreground">1,500 XP</div>
                      </div>
                    </div>
                    
                    <div className="h-4 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full relative"
                        initial={{ width: 0 }}
                        whileInView={{ width: "82%" }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    {/* Streak */}
                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center group-hover:scale-[1.02] transition-transform">
                      <Flame className="w-8 h-8 text-orange-500 mb-2 drop-shadow-sm" />
                      <div className="text-2xl font-black text-foreground">32</div>
                      <div className="text-xs font-bold text-orange-500/80 uppercase tracking-wider">Day Streak</div>
                    </div>
                    {/* Words Known */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center group-hover:scale-[1.02] transition-transform">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                        <span className="text-emerald-500 font-bold text-lg">語</span>
                      </div>
                      <div className="text-2xl font-black text-foreground">142</div>
                      <div className="text-xs font-bold text-emerald-500/80 uppercase tracking-wider">Words Known</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          JLPT LEVELS
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="jlpt" className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-muted/20 pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center mb-24 md:mb-32"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-sm font-semibold text-secondary uppercase tracking-[0.3em]">
              Curriculum
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium mt-6 display-font">The JLPT Scale</h2>
            <p className="text-muted-foreground mt-6 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Master every level from beginner N5 to the mastery of N1 with our precision-curated lessons.
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
          >
            {JLPT_LEVELS.map((lv, i) => (
              <motion.div
                key={lv.level}
                variants={fadeUp}
                className={`group relative rounded-[2.5rem] border border-border/40 bg-card/10 backdrop-blur-md p-8 transition-all duration-700 ${lv.hover} hover:bg-card/20 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5`}
              >
                {/* Level badge */}
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] text-2xl font-black border ${lv.color} mb-6 group-hover:scale-110 transition-transform duration-500`}
                >
                  {lv.level}
                </div>

                <h3 className="text-lg font-bold">{lv.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{lv.lessons} lessons</p>

                <div className="mt-4 pt-4 border-t border-border/30 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vocab</span>
                    <span className="font-semibold">{lv.vocab}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kanji</span>
                    <span className="font-semibold">{lv.kanji}</span>
                  </div>
                </div>

                {/* Difficulty dots */}
                <div className="flex gap-2 mt-6">
                  {[...Array(5)].map((_, j) => (
                    <div
                      key={j}
                      className={`w-2 h-2 rounded-full transition-all duration-500 ${j <= i ? "bg-primary opacity-60 scale-110" : "bg-border/30"
                        }`}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURES — BENTO GRID
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 md:py-32 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
                <Sparkles className="h-3 w-3" />
                Excellence
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mt-6 leading-tight display-font">
                Crafted for <span className="text-primary">Clarity</span>
              </h2>
              <p className="text-muted-foreground mt-6 text-lg md:text-xl leading-relaxed max-w-xl">
                We've stripped away the noise to let you focus on what truly matters: your progress.
              </p>
            </div>
          </motion.div>

          {/* Lunar Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* 1. Smart Review - Large Hero Card */}
            <motion.div
              className="md:col-span-7 md:row-span-2 group relative overflow-hidden rounded-[3rem] border border-white/10 bg-card/40 backdrop-blur-3xl p-10 flex flex-col justify-between h-[500px]"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="relative z-10 max-w-sm">
                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-8 shadow-lg shadow-purple-500/20">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4 leading-tight">Smart review system</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Our spaced repetition algorithm adapts to your specific memory patterns, ensuring you never forget a kanji again.
                </p>
              </div>

              {/* Illustrative element */}
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/2 h-full flex items-center justify-center pointer-events-none">
                <motion.div
                  className="relative w-64 h-64"
                  animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-3xl" />
                  <div className="relative z-10 w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-[3rem] border border-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Brain className="w-32 h-32 text-white/50" />
                  </div>
                </motion.div>
              </div>

              {/* Lunar Bloom Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[100px] -z-10" />
            </motion.div>

            {/* 2. Interactive Lessons - Medium Top Right */}
            <motion.div
              className="md:col-span-5 group relative overflow-hidden rounded-[3rem] border border-white/10 bg-card/40 backdrop-blur-3xl p-8 h-[300px]"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Interactive lessons</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[240px]">
                  Engaging content with furigana, real-time feedback, and spatial audio support.
                </p>
              </div>
              
              <div className="absolute bottom-4 right-4 text-blue-500/20 group-hover:text-blue-500/40 transition-colors duration-500 rotate-12">
                <BookOpen className="w-40 h-40" />
              </div>

              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[80px] -z-10" />
            </motion.div>

            {/* 3. Listening - Bottom Middle/Right Middle */}
            <motion.div
              className="md:col-span-5 group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-card/40 backdrop-blur-3xl p-8"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex gap-6 items-start">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Headphones className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Listening & speaking</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Native audio recordings and AI voice analysis for perfect pitch.
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[60px] -z-10" />
            </motion.div>

            {/* 4. Progress Dashboard - Bottom Full Width Row */}
            <motion.div
              className="md:col-span-12 group relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-r from-card/40 to-primary/5 backdrop-blur-3xl p-8 flex flex-col md:flex-row items-center gap-10"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="shrink-0 w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-black mb-2">Progress Dashboard</h3>
                <p className="text-muted-foreground text-base max-w-2xl">
                  Visualize your journey with beautiful data. Detailed statistics, daily streaks, and more achievements system to keep you motivated on your journey to mastery.
                </p>
              </div>
              
              <div className="hidden lg:flex gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="w-12 h-20 rounded-xl bg-white/5 border border-white/10 flex items-end p-2">
                    <motion.div 
                      className="w-full bg-orange-500/40 rounded-lg"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${20 + i * 20}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                    />
                  </div>
                ))}
              </div>

              <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[100px] -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="testimonials" className="py-24 md:py-32 relative overflow-hidden">
        {/* Background glow for testimonials */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-bold text-primary uppercase tracking-[0.2em] bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
              Community
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold mt-6">Loved by learners</h2>
            <p className="text-muted-foreground mt-4 text-lg max-w-xl mx-auto">Join thousands of students who have discovered the joy of learning Japanese.</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                className={`clay-card relative rounded-3xl p-8 transition-transform duration-500 hover:-translate-y-3 ${
                  i === 1 ? "md:-translate-y-8" : "md:translate-y-0"
                } ${
                  i % 3 === 0 ? "bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-background border-indigo-200/50 shadow-indigo-500/10" :
                  i % 3 === 1 ? "bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/40 dark:to-background border-rose-200/50 shadow-rose-500/10" :
                  "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-background border-emerald-200/50 shadow-emerald-500/10"
                }`}
              >
                {/* Quote mark floating */}
                <div className="absolute -top-4 -right-2 text-8xl font-serif text-primary/10 leading-none select-none drop-shadow-sm">"</div>
                
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white/60 dark:bg-black/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/50 dark:border-white/10">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-lg font-bold">{t.name}</div>
                    <div className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit mt-1">{t.level}</div>
                  </div>
                </div>

                <p className="text-foreground/80 leading-relaxed font-medium relative z-10">{t.quote}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative rounded-[3.5rem] overflow-hidden border border-white/10 bg-[#0a0f1a]/80 backdrop-blur-3xl p-10 md:p-16 lg:p-24 text-center shadow-2xl shadow-primary/5"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            {/* ── Lantern Glow Background Effects ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Central Lantern Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-60" />
              
              {/* Secondary Bottom Glow */}
              <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-secondary/10 rounded-full blur-[100px] mix-blend-screen" />

              {/* Japanese 'Kumo' (Cloud) Patterns */}
              <svg className="absolute top-10 right-10 w-64 h-64 text-white/[0.03] rotate-12" viewBox="0 0 200 200" fill="currentColor">
                <path d="M160,100c0-22.1-17.9-40-40-40c-5.7,0-11,1.2-15.8,3.3C96.2,51.1,84.1,44,70,44c-24.3,0-44,19.7-44,44c0,2.1,0.2,4.2,0.5,6.2C11.5,99.4,0,113.3,0,130c0,22.1,17.9,40,40,40h120c22.1,0,40-17.9,40-40C200,107.9,182.1,90,160,100z" />
              </svg>
              <svg className="absolute -bottom-10 -left-20 w-96 h-96 text-white/[0.02]" viewBox="0 0 200 200" fill="currentColor">
                <path d="M160,100c0-22.1-17.9-40-40-40c-5.7,0-11,1.2-15.8,3.3C96.2,51.1,84.1,44,70,44c-24.3,0-44,19.7-44,44c0,2.1,0.2,4.2,0.5,6.2C11.5,99.4,0,113.3,0,130c0,22.1,17.9,40,40,40h120c22.1,0,40-17.9,40-40C200,107.9,182.1,90,160,100z" />
              </svg>
            </div>

            <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
              <div className="mb-10 relative group">
                {/* Halo effect */}
                <div className="absolute -inset-6 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <img
                  src={kaorukoGuide}
                  alt="Kaoruko"
                  className="relative w-32 h-32 md:w-40 md:h-40 object-cover rounded-full border-[3px] border-white/20 shadow-2xl mx-auto group-hover:scale-105 transition-transform duration-500"
                />
                
                <motion.div
                  className="absolute -right-6 -bottom-2 bg-primary text-primary-foreground font-bold px-4 py-2 rounded-2xl rounded-bl-none shadow-xl text-sm md:text-base border border-white/10"
                  animate={{ y: [0, -6, 0], rotate: [0, 2, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  Join our family! ✨
                </motion.div>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight display-font">
                Ready to master <span className="italic text-primary">Japanese</span>?
              </h2>
              
              <p className="text-lg md:text-2xl text-white/70 mb-12 font-medium max-w-2xl leading-relaxed">
                Experience a peaceful, effective journey to fluency with Kaoruko. No stress, just magical progress.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto">
                <Link to="/auth">
                  <Button
                    size="lg"
                    className="h-16 px-10 text-xl clay-btn bg-primary text-primary-foreground hover:scale-105 transition-all overflow-hidden group shadow-lg shadow-primary/20"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Start free trial
                      <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                    </span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button size="lg" variant="outline" className="h-16 px-10 text-xl rounded-full border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 transition-colors">
                    Explore courses
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
