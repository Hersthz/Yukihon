// src/pages/JLPTLessons.tsx

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
import GlassCard from "@/components/genshin/GlassCard";
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
    const info: Record<string, { title: string; description: string; color: string }> = {
      N5: {
        title: "JLPT N5 - Beginner",
        description: "Foundation level - Learn basic vocabulary and grammar",
        color: "from-green-500 to-emerald-500",
      },
      N4: {
        title: "JLPT N4 - Elementary",
        description: "Everyday conversations and simple texts",
        color: "from-blue-500 to-cyan-500",
      },
      N3: {
        title: "JLPT N3 - Intermediate",
        description: "More complex texts and professional conversations",
        color: "from-purple-500 to-pink-500",
      },
      N2: {
        title: "JLPT N2 - Upper-Intermediate",
        description: "Advanced vocabulary and complex grammar patterns",
        color: "from-orange-500 to-red-500",
      },
      N1: {
        title: "JLPT N1 - Advanced",
        description: "Mastery level - Nuanced language and specialized texts",
        color: "from-red-500 to-pink-500",
      },
    };
    return info[level] || info.N4;
  };

  const levelInfo = getLevelInfo(selectedLevel);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PageHeader
            title="JLPT Preparation"
            subtitle="Structured lessons for each JLPT level"
            icon={<GraduationCap />}
          />
        </motion.div>

        {/* Level Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <motion.div className="flex flex-wrap gap-2 mb-6">
            {["N5", "N4", "N3", "N2", "N1"].map((level, idx) => (
              <motion.button
                key={level}
                onClick={() => setSelectedLevel(level)}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  selectedLevel === level
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                    : "bg-slate-800/60 border border-slate-700/50 text-gray-300 hover:bg-slate-700/60 hover:border-slate-600/50"
                }`}
              >
                {level}
              </motion.button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard
              className={`p-6 bg-gradient-to-r ${levelInfo.color}/10 border border-cyan-500/30 hover:border-cyan-500/50 transition-colors`}
            >
              <motion.h2 
                className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {levelInfo.title}
              </motion.h2>
              <motion.p 
                className="text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                {levelInfo.description}
              </motion.p>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: "Total Lessons", value: currentLevelLessons.length, gradient: "from-blue-500/30 to-cyan-500/30" },
            { label: "Completed", value: "0", gradient: "from-emerald-500/30 to-teal-500/30" },
            { label: "Progress", value: "0%", gradient: "from-purple-500/30 to-pink-500/30" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -4 }}
              className={`p-6 rounded-lg bg-gradient-to-br ${stat.gradient} border border-slate-600/50 backdrop-blur-sm hover:border-slate-400/50 transition-colors`}
            >
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
              <motion.p 
                className="text-3xl font-bold mt-2 text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
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
            className="flex justify-center py-20"
          >
            <div className="relative w-12 h-12">
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
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentLevelLessons.length > 0 ? (
              currentLevelLessons.map((lesson: any, idx: number) => (
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
                className="col-span-full text-center py-20"
              >
                <GraduationCap className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">No lessons available for this level</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Call to Action */}
        {currentLevelLessons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 font-semibold shadow-lg shadow-cyan-500/50 transition-all"
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
