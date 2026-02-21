// src/pages/JLPTLessons.tsx

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Award, BookOpen, Trophy, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LessonCard2 from "@/components/learning/LessonCard2.tsx";
import { usePublishedLessons } from "@/hooks/learning/useLessons";

const JLPTLessons = () => {
  const [selectedLevel, setSelectedLevel] = useState("N4");
  const { data: allLessons = [], isLoading } = usePublishedLessons();

  const lessonsByLevel = allLessons.reduce((acc: Record<string, any[]>, lesson: any) => {
    const level = lesson.jlptLevel || "N4";
    if (!acc[level]) acc[level] = [];
    acc[level].push(lesson);
    return acc;
  }, {});

  const currentLevelLessons = lessonsByLevel[selectedLevel] || [];

  const getLevelInfo = (level: string) => {
    const info: Record<string, { title: string; description: string; gradient: string; accent: string }> = {
      N5: {
        title: "JLPT N5 - Beginner",
        description: "Foundation level — Learn basic vocabulary and grammar",
        gradient: "from-green-500 to-emerald-500",
        accent: "green",
      },
      N4: {
        title: "JLPT N4 - Elementary",
        description: "Everyday conversations and simple texts",
        gradient: "from-cyan-500 to-blue-500",
        accent: "cyan",
      },
      N3: {
        title: "JLPT N3 - Intermediate",
        description: "More complex texts and professional conversations",
        gradient: "from-purple-500 to-pink-500",
        accent: "purple",
      },
      N2: {
        title: "JLPT N2 - Upper-Intermediate",
        description: "Advanced vocabulary and complex grammar patterns",
        gradient: "from-orange-500 to-red-500",
        accent: "orange",
      },
      N1: {
        title: "JLPT N1 - Advanced",
        description: "Mastery level — Nuanced language and specialized texts",
        gradient: "from-red-500 to-rose-500",
        accent: "red",
      },
    };
    return info[level] || info.N4;
  };

  const levelInfo = getLevelInfo(selectedLevel);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
  };

  const levelButtons = [
    { level: "N5", color: "from-green-500 to-emerald-500", shadow: "shadow-green-500/30" },
    { level: "N4", color: "from-cyan-500 to-blue-500", shadow: "shadow-cyan-500/30" },
    { level: "N3", color: "from-purple-500 to-pink-500", shadow: "shadow-purple-500/30" },
    { level: "N2", color: "from-orange-500 to-red-500", shadow: "shadow-orange-500/30" },
    { level: "N1", color: "from-red-500 to-rose-500", shadow: "shadow-red-500/30" },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">JLPT Preparation</h1>
              <p className="text-slate-400 text-sm sm:text-base mt-0.5">Structured lessons for each JLPT level</p>
            </div>
          </div>
        </motion.div>

        {/* Level Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 mb-6">
            {levelButtons.map((btn, idx) => (
              <motion.button
                key={btn.level}
                onClick={() => setSelectedLevel(btn.level)}
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  selectedLevel === btn.level
                    ? `bg-gradient-to-r ${btn.color} text-white shadow-lg ${btn.shadow}`
                    : "bg-white/[0.03] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.12]"
                }`}
              >
                {btn.level}
              </motion.button>
            ))}
          </div>

          {/* Level info card */}
          <motion.div
            key={selectedLevel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-6 group"
          >
            <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${levelInfo.gradient} opacity-70`} />
            <div className={`absolute inset-0 bg-gradient-to-r ${levelInfo.gradient} opacity-[0.04]`} />
            <div className="relative">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">
                {levelInfo.title}
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">{levelInfo.description}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8"
        >
          {[
            { label: "Total Lessons", value: currentLevelLessons.length, icon: BookOpen, gradient: "from-cyan-500 to-blue-500", iconBg: "bg-cyan-500/15", glow: "shadow-cyan-500/15" },
            { label: "Completed", value: "0", icon: Trophy, gradient: "from-emerald-500 to-teal-500", iconBg: "bg-emerald-500/15", glow: "shadow-emerald-500/15" },
            { label: "Progress", value: "0%", icon: TrendingUp, gradient: "from-purple-500 to-pink-500", iconBg: "bg-purple-500/15", glow: "shadow-purple-500/15" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -4 }}
              className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-5 group cursor-default shadow-lg ${stat.glow}`}
            >
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${stat.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${stat.iconBg}`}>
                  <stat.icon className="w-4 h-4 text-white/70" />
                </div>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{stat.label}</span>
              </div>
              <motion.p
                className="text-3xl font-bold text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
              >
                {stat.value}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>

        {/* Lessons Grid */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="relative w-14 h-14 mb-4">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-cyan-500/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <p className="text-slate-500 text-sm">Loading lessons...</p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          >
            {currentLevelLessons.length > 0 ? (
              currentLevelLessons.map((lesson: any) => (
                <motion.div
                  key={lesson.id}
                  variants={itemVariants}
                >
                  <LessonCard2
                    lesson={lesson}
                    onStart={(id) => console.log("Start lesson:", id)}
                    estimatedTime={20}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="col-span-full text-center py-24"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400 text-lg font-medium">No lessons available</p>
                <p className="text-slate-500 text-sm mt-1">Check back soon for {selectedLevel} content</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* CTA */}
        {currentLevelLessons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 text-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/20 px-8 py-5 transition-all"
              >
                <Award className="w-5 h-5 mr-2" />
                Start Learning {selectedLevel}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JLPTLessons;
