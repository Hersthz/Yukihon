// src/pages/Quiz.tsx

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, BarChart3, Trophy, Target, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/genshin/GlassCard";
import { useQuery } from "@tanstack/react-query";
import { quizAPI } from "@/lib/api/learningClient";

interface QuizItem {
  id: number;
  title: string;
  description: string;
  quizType: string;
  difficultyLevel: string;
  jlptLevel: string;
  question: string;
}

const Quiz = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["quizzes"],
    queryFn: () => quizAPI.getAll(),
  });

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((item: QuizItem) => {
      const diffMatch =
        selectedDifficulty === "all" || item.difficultyLevel === selectedDifficulty;
      const levelMatch = selectedLevel === "all" || item.jlptLevel === selectedLevel;
      return diffMatch && levelMatch;
    });
  }, [quizzes, selectedDifficulty, selectedLevel]);

  const stats = {
    totalQuizzes: quizzes.length,
    completed: Math.random() > 0.5 ? Math.floor(quizzes.length * 0.6) : 0,
    performance: Math.floor(Math.random() * 30 + 70),
  };

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

  const difficultyColors: { [key: string]: string } = {
    BEGINNER: "from-green-500 to-emerald-500",
    INTERMEDIATE: "from-yellow-500 to-orange-500",
    ADVANCED: "from-red-500 to-pink-500",
  };

  const difficultyBadgeColors: { [key: string]: string } = {
    BEGINNER: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    INTERMEDIATE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    ADVANCED: "bg-red-500/15 text-red-400 border-red-500/30",
  };

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
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Quiz Practice</h1>
              <p className="text-slate-400 text-sm sm:text-base mt-0.5">Test your knowledge and improve your skills</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8"
        >
          {[
            { label: "Total Quizzes", value: stats.totalQuizzes, icon: Zap, gradient: "from-cyan-500 to-blue-500", iconBg: "bg-cyan-500/15", glow: "shadow-cyan-500/15" },
            { label: "Completed", value: stats.completed, icon: Trophy, gradient: "from-emerald-500 to-teal-500", iconBg: "bg-emerald-500/15", glow: "shadow-emerald-500/15" },
            { label: "Avg Score", value: `${stats.performance}%`, icon: Target, gradient: "from-purple-500 to-pink-500", iconBg: "bg-purple-500/15", glow: "shadow-purple-500/15" },
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

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          <div className="flex-1 flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="bg-white/[0.03] border-white/[0.08] focus:border-cyan-500/40 focus:ring-cyan-500/20 rounded-xl">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {["N5", "N4", "N3", "N2", "N1"].map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="bg-white/[0.03] border-white/[0.08] focus:border-cyan-500/40 focus:ring-cyan-500/20 rounded-xl">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Quiz Grid */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="relative w-14 h-14 mb-4">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-amber-500/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <p className="text-slate-500 text-sm">Loading quizzes...</p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
          >
            {filteredQuizzes.map((quiz: QuizItem) => (
              <motion.div
                key={quiz.id}
                variants={itemVariants}
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-5 sm:p-6 h-full flex flex-col justify-between group hover:border-white/[0.12] transition-all"
                >
                  {/* Top gradient line */}
                  <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${difficultyColors[quiz.difficultyLevel] || "from-gray-500 to-gray-600"} opacity-40 group-hover:opacity-80 transition-opacity`} />

                  <div className="mb-5">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <span className="px-2.5 py-1 bg-blue-500/15 text-blue-400 border border-blue-500/25 rounded-lg text-xs font-semibold">
                        {quiz.jlptLevel}
                      </span>
                      <span className={`px-2.5 py-1 border rounded-lg text-xs font-semibold ${difficultyBadgeColors[quiz.difficultyLevel] || "bg-gray-500/15 text-gray-400 border-gray-500/30"}`}>
                        {quiz.difficultyLevel}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                      {quiz.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-2">
                      {quiz.description}
                    </p>
                    <p className="text-slate-500 line-clamp-2 text-xs">
                      {quiz.question}
                    </p>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all">
                      <Zap className="w-4 h-4 mr-2" />
                      Start Quiz
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isLoading && filteredQuizzes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-24"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 text-lg font-medium">No quizzes found</p>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Quiz;
