import { motion } from "framer-motion";
import { TESTIMONIALS, fadeUp, stagger } from "@/data/landing";

const CARD_THEMES = [
  "bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-background border-indigo-200/50 shadow-indigo-500/10",
  "bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/40 dark:to-background border-rose-200/50 shadow-rose-500/10",
  "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-background border-emerald-200/50 shadow-emerald-500/10",
];

const TestimonialsSection = () => (
  <section id="testimonials" className="py-24 md:py-32 relative overflow-hidden">
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
            className={`learnhub-card relative p-8 transition-transform duration-500 hover:-translate-y-3 ${
              i === 1 ? "md:-translate-y-8" : "md:translate-y-0"
            } ${CARD_THEMES[i % CARD_THEMES.length]}`}
          >
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
);

export default TestimonialsSection;
