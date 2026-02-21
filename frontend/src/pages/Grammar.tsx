// src/pages/Grammar.tsx

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Brain, Search, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
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

const levelColors: Record<string, string> = {
  N5: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  N4: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  N3: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  N2: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  N1: "bg-rose-500/15 text-rose-400 border-rose-500/25",
};

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

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
              <Brain className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Grammar Patterns</h1>
              <p className="text-sm text-slate-400">Master Japanese grammar patterns for different JLPT levels</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search grammar patterns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/[0.03] border-white/[0.06] focus:border-purple-500/40 focus:ring-purple-500/10 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["all", "N5", "N4", "N3", "N2", "N1"].map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                    selectedLevel === level
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:bg-white/[0.06] hover:text-slate-300"
                  }`}
                >
                  {level === "all" ? "All" : level}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="relative w-12 h-12">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-purple-500/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-400"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
            className="space-y-4"
          >
            {filteredGrammar.map((item: GrammarItem) => (
              <motion.div
                key={item.id}
                variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden group hover:border-purple-500/20 hover:shadow-lg hover:shadow-purple-500/5 transition-all"
              >
                {/* Accent line */}
                <div className="h-0.5 bg-gradient-to-r from-purple-500/40 to-pink-500/40" />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{item.pattern}</h3>
                      <p className="text-slate-400">{item.title}</p>
                    </div>
                    <Badge className={`text-xs border shrink-0 ml-4 ${levelColors[item.jlptLevel] || "bg-slate-500/15 text-slate-400"}`}>
                      {item.jlptLevel}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-purple-400/80 font-semibold mb-1.5">Explanation</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{item.explanation}</p>
                    </div>

                    {item.usage && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-purple-400/80 font-semibold mb-1.5">Usage</p>
                        <p className="text-sm text-slate-300">{item.usage}</p>
                      </div>
                    )}

                    {item.exampleJP && (
                      <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4">
                        <p className="text-xs uppercase tracking-wider text-purple-400/80 font-semibold mb-2">Example</p>
                        <p className="text-white font-medium mb-1">{item.exampleJP}</p>
                        {item.exampleEN && (
                          <p className="text-sm text-slate-500 italic">{item.exampleEN}</p>
                        )}
                      </div>
                    )}

                    {item.relatedPatterns && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-purple-400/80 font-semibold mb-1.5">Related Patterns</p>
                        <p className="text-sm text-slate-400">{item.relatedPatterns}</p>
                      </div>
                    )}

                    <Button className="w-full bg-white/[0.05] hover:bg-purple-500/15 text-white border border-white/[0.08] hover:border-purple-500/30 transition-all group/btn">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Study This Pattern
                      <ChevronRight className="w-4 h-4 ml-auto group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isLoading && filteredGrammar.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Brain className="w-14 h-14 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg">No grammar patterns found</p>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filter</p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Grammar;
