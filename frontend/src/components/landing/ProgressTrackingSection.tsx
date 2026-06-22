import { BookOpen, Flame, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/data/landing";
import kaorukoExcited from "@/assets/kaoruko-excited.png";

const TIPS = [
  {
    tip: "Maintain your daily study streak",
    icon: Flame,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    tip: "Watch your mastery bloom over time",
    icon: Sparkles,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    tip: "Track progress towards your JLPT goals",
    icon: BookOpen,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

const ProgressTrackingSection = () => (
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

          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
          >
            Watch your fluency{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              bloom
            </span>
          </motion.h2>

          <motion.p variants={fadeUp} className="text-lg text-muted-foreground leading-relaxed">
            Stay motivated with beautiful, actionable insights. Track your daily streaks, master new
            kanji, and level up your skills in a completely stress-free environment.
          </motion.p>

          <div className="space-y-4 pt-4">
            {TIPS.map((item, i) => (
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
          className="relative z-10"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="relative max-w-md mx-auto">
            <div className="absolute -inset-10 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-[3rem] blur-3xl opacity-50" />

            <div className="clay-card bg-card/90 backdrop-blur-2xl p-6 sm:p-8 rounded-[2.5rem] border border-white/20 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />

              <div className="flex items-center gap-5 relative z-10 mb-8">
                <img
                  src={kaorukoExcited}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full border-[3px] border-background shadow-md bg-primary/10"
                />
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
                <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center group-hover:scale-[1.02] transition-transform">
                  <Flame className="w-8 h-8 text-orange-500 mb-2 drop-shadow-sm" />
                  <div className="text-2xl font-black text-foreground">32</div>
                  <div className="text-xs font-bold text-orange-500/80 uppercase tracking-wider">
                    Day Streak
                  </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center group-hover:scale-[1.02] transition-transform">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                    <span className="text-emerald-500 font-bold text-lg">語</span>
                  </div>
                  <div className="text-2xl font-black text-foreground">142</div>
                  <div className="text-xs font-bold text-emerald-500/80 uppercase tracking-wider">
                    Words Known
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default ProgressTrackingSection;
