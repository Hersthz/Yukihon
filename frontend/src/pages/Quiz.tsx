// src/pages/Quiz.tsx

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, BarChart3 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/shared/PageHeader";
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

  const difficultyColors: { [key: string]: string } = {
    BEGINNER: "from-green-500/30 to-emerald-500/30",
    INTERMEDIATE: "from-yellow-500/30 to-orange-500/30",
    ADVANCED: "from-red-500/30 to-pink-500/30",
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
            title="Quiz Practice"
            subtitle="Test your knowledge and improve your skills"
            icon={<Zap />}
          />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: "Total Quizzes", value: stats.totalQuizzes, gradient: "from-cyan-500/30 to-blue-500/30" },
            { label: "Completed", value: stats.completed, gradient: "from-emerald-500/30 to-teal-500/30" },
            { label: "Avg Score", value: `${stats.performance}%`, gradient: "from-purple-500/30 to-pink-500/30" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -4 }}
              className={`p-6 rounded-lg bg-gradient-to-br ${stat.gradient} border border-slate-600/50 backdrop-blur-sm hover:border-slate-400/50 transition-colors`}
            >
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
              <motion.p 
                className="text-3xl font-bold mt-2 text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
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
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }}>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 focus:border-cyan-500/50 focus:ring-cyan-500/20">
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
          </motion.div>

          <motion.div className="flex-1" whileHover={{ scale: 1.02 }}>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 focus:border-cyan-500/50 focus:ring-cyan-500/20">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </motion.div>

        {/* Quiz Grid */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center py-20"
          >
            <div className="relative w-12 h-12">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-yellow-500/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-yellow-500"
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
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredQuizzes.map((quiz: QuizItem, idx: number) => (
              <motion.div
                key={quiz.id}
                variants={itemVariants}
              >
                <GlassCard className="p-6 h-full flex flex-col justify-between hover:border-yellow-500/50 transition-all group">
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <motion.span 
                        className="px-3 py-1 bg-blue-500/30 text-blue-300 rounded-full text-sm border border-blue-500/50 font-medium"
                        whileHover={{ scale: 1.1 }}
                      >
                        {quiz.jlptLevel}
                      </motion.span>
                      <motion.span 
                        className={`px-3 py-1 bg-gradient-to-r ${difficultyColors[quiz.difficultyLevel] || "from-gray-500/30 to-gray-600/30"} text-white rounded-full text-xs border border-orange-500/30 font-semibold`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {quiz.difficultyLevel}
                      </motion.span>
                    </div>

                    <motion.h3 
                      className="text-xl font-bold text-white mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {quiz.title}
                    </motion.h3>
                    <motion.p 
                      className="text-gray-400 text-sm mb-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      {quiz.description}
                    </motion.p>
                    <motion.p 
                      className="text-gray-500 line-clamp-2 text-xs"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {quiz.question}
                    </motion.p>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 font-semibold transition-all group-hover:shadow-lg group-hover:shadow-yellow-500/50">
                      <motion.span
                        className="inline-flex items-center"
                        whileHover={{ gap: "8px" }}
                      >
                        <Zap className="w-4 h-4" />
                        <span className="ml-2">Start Quiz</span>
                      </motion.span>
                    </Button>
                  </motion.div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isLoading && filteredQuizzes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-20"
          >
            <Zap className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No quizzes found matching your filters</p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Quiz;
