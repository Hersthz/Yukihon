import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { COURSE_CATALOG, fadeUp, stagger } from "@/data/landing";

const CourseCatalogSection = () => (
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
        <h2 className="text-4xl md:text-5xl font-bold mt-6 mb-4">Your Learning Path</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          From absolute beginner to conversational fluency, our curriculum feels like playing a game
          rather than studying.
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
              <div
                className={`clay-card bg-gradient-to-b ${course.color} p-8 h-full text-white ${course.shadow} flex flex-col justify-between overflow-hidden relative group-hover:-translate-y-2 transition-transform duration-500`}
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors" />
                <div>
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/30">
                    <course.icon className="w-7 h-7 text-white drop-shadow-md" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 tracking-tight drop-shadow-sm">
                    {course.title}
                  </h3>
                  <div className="text-white/80 text-sm font-medium mb-4 bg-black/10 w-fit px-3 py-1 rounded-full">
                    {course.level}
                  </div>
                  <p className="text-white/90 leading-relaxed text-sm">{course.desc}</p>
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
);

export default CourseCatalogSection;
