// src/pages/Index.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WinterNightBackground from "@/components/WinterNightBackground";
import { motion } from "framer-motion";
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
} from "lucide-react";
import kaorukoWelcome from "@/assets/kaoruko-welcome.png";
import kaorukoHappy from "@/assets/kaoruko-happy.png";
import kaorukoGuide from "@/assets/kaoruko-guide.png";
import kaorukoExcited from "@/assets/kaoruko-excited.png";

/* ─── Decorative floating kanji ─── */
const FLOATING_KANJI = [
  { char: "漢", x: "5%", y: "12%", delay: 0, size: "text-8xl" },
  { char: "語", x: "88%", y: "22%", delay: 1.5, size: "text-7xl" },
  { char: "学", x: "78%", y: "68%", delay: 3, size: "text-9xl" },
  { char: "読", x: "12%", y: "78%", delay: 2, size: "text-6xl" },
  { char: "書", x: "92%", y: "55%", delay: 4, size: "text-7xl" },
  { char: "話", x: "48%", y: "8%", delay: 1, size: "text-8xl" },
];

/* ─── How-It-Works steps ─── */
const STEPS = [
  {
    title: "Take placement test",
    desc: "Find your starting level with our comprehensive assessment",
    icon: "📝",
    accent: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Follow curated path",
    desc: "Progress through expertly designed lessons for your level",
    icon: "🎯",
    accent: "from-pink-500/20 to-rose-500/20",
  },
  {
    title: "Review with SRS",
    desc: "Master content with spaced repetition for long-term retention",
    icon: "🧠",
    accent: "from-violet-500/20 to-purple-500/20",
  },
  {
    title: "Track progress",
    desc: "Monitor your journey with detailed stats and achievements",
    icon: "📈",
    accent: "from-emerald-500/20 to-green-500/20",
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
  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      <Navigation />
      <WinterNightBackground snowCount={80} sparkleCount={50} intensity="light" />

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="hero" className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
        {/* Floating kanji background */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {FLOATING_KANJI.map((k) => (
            <motion.span
              key={k.char}
              className={`absolute ${k.size} font-black text-foreground/[0.03]`}
              style={{ left: k.x, top: k.y }}
              animate={{ y: [0, -30, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 12 + k.delay * 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {k.char}
            </motion.span>
          ))}
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* ── Left text ── */}
            <motion.div className="space-y-6 relative z-10" initial="hidden" animate="visible" variants={stagger}>
              {/* Kaoruko chat bubble */}
              <motion.div variants={fadeUp} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary/30 shadow-lg shadow-primary/20">
                    <img src={kaorukoGuide} alt="Kaoruko" className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-background" />
                </div>
                <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm">
                  <p className="text-sm font-medium">
                    Chào bạn! Mình là <span className="text-primary font-semibold">Kaoruko</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Học tiếng Nhật 15 phút mỗi ngày nhé!</p>
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
                  <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 200 12" fill="none">
                    <motion.path
                      d="M2 8C40 2 80 5 100 6C120 7 160 3 198 7"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.2, delay: 1, ease: "easeOut" }}
                    />
                  </svg>
                </span>{" "}
                sessions
              </motion.h1>

              {/* Description */}
              <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Build fluency through bite-sized daily lessons, intelligent spaced repetition, and
                comprehensive JLPT preparation with your personal guide, Kaoruko.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/auth">
                  <Button
                    size="lg"
                    className="gap-2 group rounded-full px-8 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:brightness-110 transition-all"
                  >
                    Start free trial
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button size="lg" variant="outline" className="rounded-full border-border/50 hover:bg-muted/50">
                    Take level test
                  </Button>
                </Link>
              </motion.div>

              {/* Social proof */}
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {["🧑‍🎓", "👨‍💼", "👩‍🏫", "🧑‍💻"].map((emoji, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-background flex items-center justify-center text-sm"
                    >
                      {emoji}
                    </div>
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
              </div>
            </motion.div>
          </div>
        </div>

        {/* Section divider */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 md:py-32 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header — left-aligned for visual variety */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mb-16"
          >
            <span className="text-sm font-semibold text-primary uppercase tracking-[0.2em]">
              How it works
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4 leading-tight">
              Your path to fluency
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              A structured approach to Japanese mastery — four simple steps.
            </p>
          </motion.div>

          {/* Steps with connecting line */}
          <div className="relative">
            {/* Desktop connecting line */}
            <div className="hidden lg:block absolute top-[70px] left-[calc(12.5%+10px)] right-[calc(12.5%+10px)] h-px">
              <div className="w-full h-full bg-gradient-to-r from-border via-primary/25 to-border" />
            </div>

            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={stagger}
            >
              {STEPS.map((step, i) => (
                <motion.div key={i} variants={fadeUp} className="group text-center relative">
                  {/* Circle */}
                  <div className="relative w-[120px] h-[120px] mx-auto mb-6">
                    <div
                      className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.accent} opacity-60 group-hover:opacity-100 transition-opacity duration-500`}
                    />
                    <div className="absolute inset-2 rounded-full bg-background border border-border/50 flex items-center justify-center group-hover:border-primary/30 transition-colors duration-300">
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                        {step.icon}
                      </span>
                    </div>
                    {/* Dot on connecting line */}
                    <div className="hidden lg:block absolute -bottom-[27px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary/30 border-2 border-background" />
                  </div>

                  <div className="text-xs font-bold text-primary/50 uppercase tracking-widest mb-2">
                    Step {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px] mx-auto">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          KAORUKO TIPS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] via-transparent to-secondary/[0.03]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <motion.div
              className="relative order-2 lg:order-1"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <div className="relative max-w-sm mx-auto">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-[2rem] blur-2xl opacity-50" />
                <img
                  src={kaorukoExcited}
                  alt="Kaoruko excited"
                  className="w-full rounded-[1.5rem] shadow-2xl relative"
                />
              </div>
            </motion.div>

            {/* Tips */}
            <motion.div
              className="space-y-6 order-1 lg:order-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
            >
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-[0.2em]">
                  <MessageCircle className="h-4 w-4" />
                  Kaoruko's Tips
                </span>
              </motion.div>

              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Learning Japanese is{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  fun
                </span>{" "}
                with me!
              </motion.h2>

              <div className="space-y-3">
                {[
                  { tip: "Start with hiragana and katakana basics", emoji: "あ" },
                  { tip: "Practice 15 minutes daily for best results", emoji: "⏰" },
                  { tip: "Use flashcards for vocabulary retention", emoji: "🎴" },
                  { tip: "Listen to native speakers regularly", emoji: "🎧" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/30 hover:bg-card/60 transition-all duration-300 group cursor-default"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300">
                      {item.emoji}
                    </div>
                    <p className="font-medium">{item.tip}</p>
                  </motion.div>
                ))}
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
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold text-primary uppercase tracking-[0.2em]">
              JLPT Preparation
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4">From N5 to N1</h2>
            <p className="text-muted-foreground mt-4 text-lg max-w-xl mx-auto">
              Complete curriculum covering every level of the Japanese-Language Proficiency Test.
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
          >
            {JLPT_LEVELS.map((lv, i) => (
              <motion.div
                key={lv.level}
                variants={fadeUp}
                className={`group relative rounded-3xl border border-border/40 bg-card/30 backdrop-blur-sm p-6 transition-all duration-500 ${lv.hover} hover:bg-card/60 hover:-translate-y-1 hover:shadow-xl`}
              >
                {/* Level badge */}
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl text-xl font-black border ${lv.color} mb-4 group-hover:scale-105 transition-transform duration-300`}
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
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, j) => (
                    <div
                      key={j}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        j <= i ? "bg-primary/60" : "bg-border/50"
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
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <span className="text-sm font-semibold text-primary uppercase tracking-[0.2em]">
                Features
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4 leading-tight">
                Everything you need
                <br className="hidden md:block" /> to succeed
              </h2>
              <p className="text-muted-foreground mt-4 text-lg max-w-lg">
                Comprehensive tools designed for effective learning
              </p>
            </div>
            <div className="shrink-0 hidden md:block">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg">
                <img src={kaorukoHappy} alt="Kaoruko" className="w-full h-full object-cover" />
              </div>
            </div>
          </motion.div>

          {/* Bento grid */}
          <motion.div
            className="grid md:grid-cols-2 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className={`group relative overflow-hidden rounded-3xl border border-border/40 bg-card/30 backdrop-blur-sm transition-all duration-500 hover:border-primary/20 hover:bg-card/60 ${
                  f.large ? "md:row-span-2 p-8 md:p-10" : "p-6 md:p-8"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <f.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className={`font-bold mb-3 ${f.large ? "text-2xl" : "text-xl"}`}>{f.title}</h3>
                <p
                  className={`text-muted-foreground leading-relaxed ${
                    f.large ? "text-base max-w-md" : "text-sm"
                  }`}
                >
                  {f.desc}
                </p>

                {/* Decorative hover glow */}
                <div
                  className={`absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-tl ${f.gradient} opacity-0 group-hover:opacity-[0.07] blur-3xl transition-opacity duration-700 pointer-events-none`}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="testimonials" className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/15 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold text-primary uppercase tracking-[0.2em]">
              Community
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4">Loved by learners</h2>
            <p className="text-muted-foreground mt-4 text-lg">See what our community has achieved</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
          >
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                className="relative rounded-3xl border border-border/40 bg-card/30 backdrop-blur-sm p-6 md:p-8 hover:border-primary/20 hover:bg-card/50 transition-all duration-500"
              >
                {/* Quote mark */}
                <div className="text-6xl font-serif text-primary/10 leading-none mb-1 select-none">"</div>
                <p className="text-muted-foreground leading-relaxed mb-8">{t.quote}</p>

                <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-lg">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs font-medium text-primary">{t.level}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative rounded-[2rem] overflow-hidden border border-border/40 bg-gradient-to-br from-primary/[0.06] via-card/50 to-secondary/[0.06] p-8 md:p-14 lg:p-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            {/* Background orbs */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-5 gap-10 items-center relative">
              {/* Kaoruko */}
              <div className="lg:col-span-2 flex justify-center">
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="relative">
                    <div className="absolute -inset-3 bg-gradient-to-tr from-primary/15 to-secondary/15 rounded-full blur-xl opacity-50" />
                    <img
                      src={kaorukoGuide}
                      alt="Kaoruko"
                      className="relative w-48 h-48 md:w-56 md:h-56 object-cover rounded-full border-4 border-primary/15 shadow-2xl"
                    />
                    <motion.div
                      className="absolute -bottom-2 -right-2 bg-card border border-border/50 px-3 py-1.5 rounded-full shadow-lg"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-sm font-medium">Let's go! ✨</span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Text */}
              <div className="lg:col-span-3 text-center lg:text-left">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
                  <Sparkles className="h-4 w-4" />
                  Start your journey today
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  Ready to master Japanese?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                  Join our community and let Kaoruko guide you on your path to Japanese fluency.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/auth">
                    <Button
                      size="lg"
                      className="gap-2 group rounded-full px-8 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:brightness-110 transition-all"
                    >
                      Start free trial
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/courses">
                    <Button size="lg" variant="outline" className="rounded-full border-border/50">
                      Explore courses
                    </Button>
                  </Link>
                </div>
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
