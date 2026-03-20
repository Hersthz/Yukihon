import { BookOpen, Brain, Headphones, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/data/landing";

const FeaturesBentoSection = () => (
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

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* 1. Smart Review - Large Hero Card */}
        <motion.div
          className="md:col-span-7 md:row-span-2 group relative overflow-hidden learnhub-card p-10 flex flex-col justify-between h-[500px]"
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

          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[100px] -z-10" />
        </motion.div>

        {/* 2. Interactive Lessons */}
        <motion.div
          className="md:col-span-5 group relative overflow-hidden learnhub-card p-8 h-[300px]"
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

        {/* 3. Listening & Speaking */}
        <motion.div
          className="md:col-span-5 group relative overflow-hidden learnhub-card p-8 h-auto flex items-center"
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

        {/* 4. Progress Dashboard */}
        <motion.div
          className="md:col-span-12 group relative overflow-hidden learnhub-card p-8 flex flex-col md:flex-row items-center gap-10 bg-gradient-to-r from-card/40 to-primary/5"
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
            {[1, 2, 3].map(i => (
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
);

export default FeaturesBentoSection;
