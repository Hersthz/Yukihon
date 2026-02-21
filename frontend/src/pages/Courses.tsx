import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BookOpen, Clock, Layers, ChevronRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Course {
  id: string;
  title: string;
  level: string;
  description: string;
  lessons: number;
  hours: number;
  skills: string[];
  progress: number;
}

const levelGradients: Record<string, { from: string; to: string; shadow: string; badge: string }> = {
  "JLPT N5": { from: "from-emerald-500/20", to: "to-green-500/20", shadow: "shadow-emerald-500/10", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  "JLPT N4": { from: "from-cyan-500/20", to: "to-blue-500/20", shadow: "shadow-cyan-500/10", badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  "JLPT N3": { from: "from-amber-500/20", to: "to-yellow-500/20", shadow: "shadow-amber-500/10", badge: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  "JLPT N2": { from: "from-orange-500/20", to: "to-red-500/20", shadow: "shadow-orange-500/10", badge: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  "JLPT N1": { from: "from-rose-500/20", to: "to-pink-500/20", shadow: "shadow-rose-500/10", badge: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  "N3-N2": { from: "from-purple-500/20", to: "to-violet-500/20", shadow: "shadow-purple-500/10", badge: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

const Courses = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const courses: Course[] = [
    {
      id: "n5-foundations",
      title: "N5 Foundations",
      level: "JLPT N5",
      description: "Start your Japanese journey with basic grammar, hiragana, katakana, and essential vocabulary.",
      lessons: 45, hours: 20, skills: ["Vocab", "Grammar", "Kanji"], progress: 0,
    },
    {
      id: "n4-conversations",
      title: "N4 Daily Conversations",
      level: "JLPT N4",
      description: "Master everyday situations with expanded vocabulary and intermediate grammar patterns.",
      lessons: 60, hours: 28, skills: ["Vocab", "Grammar", "Listening"], progress: 62,
    },
    {
      id: "n3-fluency",
      title: "N3 Building Fluency",
      level: "JLPT N3",
      description: "Develop natural expression with complex grammar and authentic Japanese materials.",
      lessons: 75, hours: 35, skills: ["Grammar", "Reading", "Listening"], progress: 0,
    },
    {
      id: "n2-professional",
      title: "N2 Professional Japanese",
      level: "JLPT N2",
      description: "Business Japanese, news comprehension, and advanced kanji for professional contexts.",
      lessons: 90, hours: 42, skills: ["Reading", "Listening", "Kanji"], progress: 0,
    },
    {
      id: "n1-mastery",
      title: "N1 Complete Mastery",
      level: "JLPT N1",
      description: "Near-native proficiency with literature, academic texts, and nuanced expression.",
      lessons: 120, hours: 60, skills: ["All skills"], progress: 0,
    },
    {
      id: "business-japanese",
      title: "Business Japanese",
      level: "N3-N2",
      description: "Specialized course for workplace communication, emails, and meetings.",
      lessons: 40, hours: 18, skills: ["Vocab", "Grammar"], progress: 0,
    },
  ];

  const levels = ["all", "JLPT N5", "JLPT N4", "JLPT N3", "JLPT N2", "JLPT N1"];
  const filteredCourses = selectedLevel === "all" ? courses : courses.filter((c) => c.level === selectedLevel);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
              <GraduationCap className="w-7 h-7 text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Course Catalog</h1>
              <p className="text-sm text-slate-400">Choose your path to Japanese fluency</p>
            </div>
          </div>
        </motion.div>

        {/* Level Filter Tabs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }} className="mb-8">
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                  selectedLevel === level
                    ? "bg-white/10 border-white/20 text-white shadow-lg"
                    : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:bg-white/[0.06] hover:text-slate-300"
                }`}
              >
                {level === "all" ? "All Levels" : level}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Course Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course) => {
              const grad = levelGradients[course.level] || levelGradients["N3-N2"];
              return (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35 }}
                  whileHover={{ y: -4 }}
                  className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden group hover:shadow-xl ${grad.shadow} transition-shadow`}
                >
                  {/* Top accent gradient */}
                  <div className={`h-1.5 bg-gradient-to-r ${grad.from} ${grad.to}`} />

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">{course.title}</h3>
                        <Badge className={`text-xs border ${grad.badge}`}>{course.level}</Badge>
                      </div>
                      {course.progress > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-xs font-semibold text-emerald-400">{course.progress}%</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed mb-5">{course.description}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-5 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{course.lessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{course.hours}h</span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {course.skills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs text-slate-400">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    {course.progress > 0 && (
                      <div className="mb-5">
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <Button
                      className="w-full bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08] hover:border-white/[0.15] transition-all group/btn"
                      variant="ghost"
                    >
                      {course.progress > 0 ? "Continue Learning" : "Start Course"}
                      <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filteredCourses.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Layers className="w-14 h-14 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg">No courses found for this level</p>
            <p className="text-sm text-slate-500 mt-1">Try selecting a different level</p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Courses;
