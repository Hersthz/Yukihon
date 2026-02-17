// src/pages/Grammar.tsx

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Brain, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useQuery } from "@tanstack/react-query";
import { grammarAPI } from "@/lib/api/learningClient";

interface GrammarItem {
  id: number;
  title: string;
  pattern: string;
  explanation: string;
  usage: string;
  exampleJP: string;
  exampleEN: string;
  jlptLevel: string;
  relatedPatterns?: string;
}

const Grammar = () => {
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: grammarList = [], isLoading } = useQuery({
    queryKey: ["grammar"],
    queryFn: () => grammarAPI.getAll(),
  });

  const filteredGrammar = useMemo(() => {
    return grammarList.filter((item: GrammarItem) => {
      const levelMatch = selectedLevel === "all" || item.jlptLevel === selectedLevel;
      const searchMatch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pattern.toLowerCase().includes(searchQuery.toLowerCase());
      return levelMatch && searchMatch;
    });
  }, [grammarList, selectedLevel, searchQuery]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
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
            title="Grammar Patterns"
            subtitle="Master Japanese grammar patterns for different JLPT levels"
            icon={<Brain />}
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <motion.div
            className="flex-1"
            whileFocus={{ scale: 1.02 }}
          >
            <Input
              placeholder="🔍 Search grammar patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border-slate-700 focus:border-purple-500/50 focus:ring-purple-500/20 transition-colors"
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 focus:border-purple-500/50 focus:ring-purple-500/20">
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
        </motion.div>

        {/* Grammar List */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center py-20"
          >
            <div className="relative w-12 h-12">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-purple-500/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500"
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
            className="space-y-4"
          >
            {filteredGrammar.map((item: GrammarItem, idx: number) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
              >
                <GlassCard className="p-6 hover:border-purple-500/70 hover:shadow-lg hover:shadow-purple-500/20 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <motion.h3 
                        className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {item.pattern}
                      </motion.h3>
                      <motion.p 
                        className="text-lg text-gray-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                      >
                        {item.title}
                      </motion.p>
                    </div>
                    <motion.span 
                      className="px-3 py-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300 rounded-full text-sm border border-purple-500/50 font-semibold whitespace-nowrap"
                      whileHover={{ scale: 1.1 }}
                    >
                      {item.jlptLevel}
                    </motion.span>
                  </div>

                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div>
                      <p className="text-sm text-purple-400 font-semibold mb-2">Explanation</p>
                      <p className="text-gray-300 leading-relaxed">{item.explanation}</p>
                    </div>

                    {item.usage && (
                      <div>
                        <p className="text-sm text-purple-400 font-semibold mb-2">Usage</p>
                        <p className="text-gray-300">{item.usage}</p>
                      </div>
                    )}

                    {item.exampleJP && (
                      <motion.div 
                        className="bg-gradient-to-br from-slate-900/50 to-purple-900/30 p-4 rounded-lg border border-purple-500/20"
                        whileHover={{ borderColor: "rgb(168 85 247 / 0.4)" }}
                      >
                        <p className="text-sm text-purple-400 font-semibold mb-2">Example</p>
                        <p className="text-white mb-2 font-medium">{item.exampleJP}</p>
                        {item.exampleEN && (
                          <p className="text-sm text-gray-400 italic">{item.exampleEN}</p>
                        )}
                      </motion.div>
                    )}

                    {item.relatedPatterns && (
                      <div>
                        <p className="text-sm text-purple-400 font-semibold mb-2">Related Patterns</p>
                        <p className="text-gray-300 text-sm">{item.relatedPatterns}</p>
                      </div>
                    )}

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-semibold transition-all group-hover:shadow-lg group-hover:shadow-purple-500/50">
                        Study This Pattern
                      </Button>
                    </motion.div>
                  </motion.div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isLoading && filteredGrammar.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-20"
          >
            <Brain className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No grammar patterns found matching your search</p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Grammar;
