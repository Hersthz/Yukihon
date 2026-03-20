import {
  BookOpen,
  Brain,
  Flame,
  Headphones,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";

/* ─── Decorative floating kanji ─── */
export const FLOATING_KANJI = [
  { char: "雪", x: "85%", y: "15%", delay: 0, size: "text-[12rem] opacity-[0.02]" },
  { char: "静", x: "5%", y: "45%", delay: 2, size: "text-9xl opacity-[0.015]" },
  { char: "魂", x: "75%", y: "75%", delay: 4, size: "text-8xl opacity-[0.01]" },
];

/* ─── Course catalog preview ─── */
export const COURSE_CATALOG = [
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
export const JLPT_LEVELS = [
  { level: "N5", title: "Beginner", lessons: 45, vocab: "800", kanji: "100", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", hover: "hover:border-emerald-500/40" },
  { level: "N4", title: "Elementary", lessons: 60, vocab: "1,500", kanji: "300", color: "bg-sky-500/10 text-sky-400 border-sky-500/20", hover: "hover:border-sky-500/40" },
  { level: "N3", title: "Intermediate", lessons: 75, vocab: "3,750", kanji: "650", color: "bg-violet-500/10 text-violet-400 border-violet-500/20", hover: "hover:border-violet-500/40" },
  { level: "N2", title: "Upper-Int.", lessons: 90, vocab: "6,000", kanji: "1,000", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", hover: "hover:border-amber-500/40" },
  { level: "N1", title: "Advanced", lessons: 120, vocab: "10,000", kanji: "2,000", color: "bg-rose-500/10 text-rose-400 border-rose-500/20", hover: "hover:border-rose-500/40" },
];

/* ─── Features ─── */
export const FEATURES = [
  { icon: Brain, title: "Smart review system", desc: "Spaced repetition algorithm adapts to your learning pace, ensuring efficient memorization and long-term retention.", gradient: "from-purple-500 to-pink-500", large: true },
  { icon: BookOpen, title: "Interactive lessons", desc: "Engaging content with furigana support, example sentences, and immediate feedback on every exercise.", gradient: "from-blue-500 to-cyan-500", large: false },
  { icon: Headphones, title: "Listening & speaking", desc: "Native audio recordings and pronunciation practice to develop natural speaking and listening skills.", gradient: "from-green-500 to-emerald-500", large: false },
  { icon: TrendingUp, title: "Progress dashboard", desc: "Detailed statistics, streak tracking, and achievement system to keep you motivated on your journey.", gradient: "from-orange-500 to-yellow-500", large: false },
];

/* ─── Testimonials ─── */
export const TESTIMONIALS = [
  { name: "Sarah Chen", level: "N3 → N2", quote: "Passed N2 in 8 months! The spaced repetition system made memorizing kanji so much easier.", avatar: "🧑‍🎓" },
  { name: "Marcus Johnson", level: "N5 → N4", quote: "The daily 15-minute lessons fit perfectly into my busy schedule. Already seeing great progress.", avatar: "👨‍💼" },
  { name: "Yuki Tanaka", level: "N4 → N3", quote: "Best Japanese learning platform I've tried. The listening exercises are particularly helpful.", avatar: "👩‍🏫" },
];

/* ─── Animation variants ─── */
export const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
export const stagger = { visible: { transition: { staggerChildren: 0.12 } } };
