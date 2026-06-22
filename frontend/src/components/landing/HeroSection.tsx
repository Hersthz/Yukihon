import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle, Flame, Sparkles, Star } from "lucide-react";
import { FLOATING_KANJI, fadeUp } from "@/data/landing";
import kaorukoWelcome from "@/assets/kaoruko-welcome.png";
import kaorukoHappy from "@/assets/kaoruko-happy.png";

const HeroSection = () => {
  const [liveCount, setLiveCount] = useState(847);
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveCount((c) => c + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const parallaxX = useTransform(mouseX, [0, 1], [-15, 15]);
  const parallaxY = useTransform(mouseY, [0, 1], [-15, 15]);
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    },
    [mouseX, mouseY]
  );

  return (
    <section
      id="hero"
      className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Floating kanji background with parallax */}
      <motion.div
        className="absolute inset-0 pointer-events-none select-none overflow-hidden"
        style={{ x: parallaxX, y: parallaxY }}
      >
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
                damping: 15,
              }}
              className="flex items-center gap-4 bg-card/60 backdrop-blur-2xl p-4 rounded-[2rem] border border-white/10 shadow-xl w-fit clay-card relative z-20"
            >
              <img
                src={kaorukoHappy}
                alt="Kaoruko"
                className="w-16 h-16 rounded-full border-2 border-primary/20"
              />
              <div>
                <p className="text-base font-medium">
                  Hello! I'm <span className="text-primary font-bold">Kaoruko</span>
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  Let's learn Japanese magically!
                </p>
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
                <svg
                  className="absolute -bottom-3 left-0 w-full h-4"
                  viewBox="0 0 200 12"
                  fill="none"
                >
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
            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground max-w-xl leading-relaxed"
            >
              Build fluency through bite-sized daily lessons, intelligent spaced repetition, and
              comprehensive JLPT preparation with your personal guide, Kaoruko.
            </motion.p>

            {/* CTA Buttons */}
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
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg clay-btn bg-card text-foreground border-transparent hover:bg-card/80 w-full sm:w-auto"
                >
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
                <span className="font-semibold text-foreground">{liveCount}</span> learners online
                now
              </span>
            </motion.div>
          </motion.div>

          {/* Right visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
          >
            <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.12),transparent_60%)] blur-2xl" />

            <div className="relative group max-w-md mx-auto">
              <div className="pointer-events-none absolute -inset-1 rounded-[2rem] bg-gradient-to-tr from-primary/25 via-secondary/15 to-primary/25 opacity-50 blur-lg group-hover:opacity-75 transition-opacity duration-700" />

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
  );
};

export default HeroSection;
