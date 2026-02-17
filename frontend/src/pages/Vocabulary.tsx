// src/pages/Vocabulary.tsx

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { BookOpen, Filter } from "lucide-react";
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
import PageHeader from "@/components/shared/PageHeader";
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
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
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
            title="Vocabulary Learning"
            subtitle="Build your Japanese vocabulary step by step"
            icon={<BookOpen />}
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
            { label: "Total Words", value: stats.total, gradient: "from-blue-500/30 to-cyan-500/30" },
            { label: "Learned", value: stats.learned, gradient: "from-purple-500/30 to-pink-500/30" },
            { label: "Progress", value: `${stats.progress}%`, gradient: "from-emerald-500/30 to-teal-500/30" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -4 }}
              className={`p-6 rounded-lg bg-gradient-to-br ${stat.gradient} border border-slate-600/50 backdrop-blur-sm text-center hover:border-slate-400/50 transition-colors`}
            >
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
              <motion.p 
                className="text-3xl font-bold mt-2 text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text"
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
          <motion.div
            className="flex-1"
            whileFocus={{ scale: 1.02 }}
          >
            <Input
              placeholder="🔍 Search vocabulary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border-slate-700 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-colors"
            />
          </motion.div>

          <motion.div 
            className="flex gap-2 items-center"
            whileHover={{ scale: 1.02 }}
          >
            <Filter className="w-4 h-4 text-cyan-400" />
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 focus:border-cyan-500/50 focus:ring-cyan-500/20">
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
          </motion.div>
        </motion.div>

        {/* Vocabulary Grid */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-20"
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
            {filteredVocabulary.map((item: VocabularyItem, idx: number) => (
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
            className="text-center py-20"
          >
            <BookOpen className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No vocabulary found matching your search</p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Vocabulary;
