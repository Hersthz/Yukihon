// src/pages/Vocabulary.tsx

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { BookOpen, Filter, Search, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VocabularyItem {
  id: number;
  kanji: string;
  hiragana: string;
  meaning: string;
  romaji: string;
  jlptLevel: string;
  exampleSentenceJP?: string;
  exampleSentenceEN?: string;
  wordType?: string;
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import VocabularyCard from "@/components/learning/VocabularyCard";
import { useVocabularyList, useVocabularyLevels } from "@/hooks/learning/useVocabulary";
import { Input } from "@/components/ui/input";

const Vocabulary = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [learnedItems, setLearnedItems] = useState<Set<number>>(new Set());

  const { data: vocabulary = [], isLoading } = useVocabularyList();
  const { data: levels = [] } = useVocabularyLevels();

  const filteredVocabulary = useMemo(() => {
    return vocabulary.filter((item: VocabularyItem) => {
      const levelMatch =
        selectedLevel === "all" || item.jlptLevel === selectedLevel;
      const searchMatch =
        item.kanji.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.romaji.toLowerCase().includes(searchQuery.toLowerCase());
      return levelMatch && searchMatch;
    });
  }, [vocabulary, selectedLevel, searchQuery]);

  const handleMarkLearned = (id: number) => {
    setLearnedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const stats = {
    total: vocabulary.length,
    learned: learnedItems.size,
    progress: vocabulary.length > 0 ? Math.round((learnedItems.size / vocabulary.length) * 100) : 0,
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
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
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Vocabulary Learning</h1>
              <p className="text-slate-400 text-sm sm:text-base mt-0.5">Build your Japanese vocabulary step by step</p>
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
            { label: "Total Words", value: stats.total, icon: BookOpen, gradient: "from-blue-500 to-cyan-500", iconBg: "bg-blue-500/15", glow: "shadow-blue-500/15" },
            { label: "Learned", value: stats.learned, icon: Star, gradient: "from-purple-500 to-pink-500", iconBg: "bg-purple-500/15", glow: "shadow-purple-500/15" },
            { label: "Progress", value: `${stats.progress}%`, icon: TrendingUp, gradient: "from-emerald-500 to-teal-500", iconBg: "bg-emerald-500/15", glow: "shadow-emerald-500/15" },
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
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search vocabulary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/[0.03] border-white/[0.08] focus:border-cyan-500/40 focus:ring-cyan-500/20 rounded-xl text-white placeholder:text-slate-500 transition-colors"
            />
          </div>

          <div className="flex gap-2 items-center">
            <Filter className="w-4 h-4 text-cyan-400" />
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-40 bg-white/[0.03] border-white/[0.08] focus:border-cyan-500/40 focus:ring-cyan-500/20 rounded-xl">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map((level: string) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Vocabulary Grid */}
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
            <p className="text-slate-500 text-sm">Loading vocabulary...</p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          >
            {filteredVocabulary.map((item: VocabularyItem) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
              >
                <VocabularyCard
                  item={item}
                  onLearn={handleMarkLearned}
                  isLearned={learnedItems.has(item.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isLoading && filteredVocabulary.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-24"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 text-lg font-medium">No vocabulary found</p>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Vocabulary;
