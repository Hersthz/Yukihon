import { motion } from "framer-motion";
import { JLPT_LEVELS, fadeUp, stagger } from "@/data/landing";

const JLPTLevelsSection = () => (
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
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium mt-6 display-font">
          The JLPT Scale
        </h2>
        <p className="text-muted-foreground mt-6 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Master every level from beginner N5 to the mastery of N1 with our precision-curated
          lessons.
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

            <div className="flex gap-2 mt-6">
              {[...Array(5)].map((_, j) => (
                <div
                  key={j}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${j <= i ? "bg-primary opacity-60 scale-110" : "bg-border/30"}`}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default JLPTLevelsSection;
