import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Volume2, Star, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

interface VocabResult {
  id: number;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning: string;
  exampleSentenceJP: string;
  exampleSentenceEN: string;
  wordType: string;
  jlptLevel: string;
  additionalNotes: string;
}

const Dictionary = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VocabResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedWord, setSelectedWord] = useState<VocabResult | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await apiClient.dictionary.search(query) as VocabResult[];
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      toast({ title: "Error", description: "Search failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [query, toast]);

  const handleSaveWord = async (vocabId: number) => {
    try {
      await apiClient.myWords.saveWord({ vocabularyId: vocabId });
      toast({ title: "Saved!", description: "Word added to My Words" });
    } catch {
      // Try checking if error is about already saved
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
  };

  const levelColor: Record<string, string> = {
    N5: "bg-green-500/20 text-green-400 border-green-500/30",
    N4: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    N3: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    N2: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    N1: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20">
                <BookOpen className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Từ điển 辞書
                </h1>
                <p className="text-sm text-slate-400">Tra cứu từ vựng tiếng Nhật</p>
              </div>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    placeholder="Nhập kanji, hiragana, romaji hoặc nghĩa..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-12 h-12 text-lg bg-white/[0.03] border-white/[0.06] text-white placeholder:text-slate-500 focus:border-cyan-500/40"
                  />
                </div>
                <Button onClick={handleSearch} size="lg" className="px-8 bg-white/[0.06] hover:bg-cyan-500/15 text-white border border-white/[0.08] hover:border-cyan-500/30 transition-all">
                  <Search className="w-5 h-5 mr-2" />
                  Tra cứu
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative w-12 h-12">
                <motion.div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                <motion.div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400" animate={{ rotate: -360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
              </div>
            </div>
          ) : searched && results.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Search className="w-14 h-14 mx-auto text-slate-600 mb-4" />
              <p className="text-lg text-slate-400">Không tìm thấy kết quả cho "{query}"</p>
              <p className="text-sm text-slate-500 mt-1">Thử từ khóa khác hoặc kiểm tra chính tả</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {results.map((word, index) => (
                  <motion.div
                    key={word.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div
                      className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden hover:border-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/5 transition-all cursor-pointer group"
                      onClick={() => setSelectedWord(word)}
                    >
                      <div className="h-0.5 bg-gradient-to-r from-cyan-500/30 to-blue-500/30" />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-1">{word.kanji || word.hiragana}</h3>
                            <p className="text-sm text-cyan-400">{word.hiragana} · {word.romaji}</p>
                          </div>
                          {word.jlptLevel && (
                            <Badge className={`text-xs border shrink-0 ml-2 ${levelColor[word.jlptLevel] || "bg-slate-500/15 text-slate-400"}`}>
                              {word.jlptLevel}
                            </Badge>
                          )}
                        </div>
                        <p className="text-white/90 mb-2">{word.meaning}</p>
                        {word.wordType && (
                          <Badge variant="outline" className="text-xs border-white/[0.08] text-slate-400">{word.wordType}</Badge>
                        )}
                        <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" className="text-slate-400 hover:text-cyan-400" onClick={(e) => { e.stopPropagation(); handleSaveWord(word.id); }}>
                            <Plus className="w-4 h-4 mr-1" /> Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Detail Modal */}
          <AnimatePresence>
            {selectedWord && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setSelectedWord(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="rounded-2xl border border-white/[0.08] bg-slate-950 p-8 max-w-lg w-full shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-4xl font-bold text-white mb-2">{selectedWord.kanji || selectedWord.hiragana}</h2>
                      <p className="text-lg text-cyan-400">{selectedWord.hiragana} · {selectedWord.romaji}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => setSelectedWord(null)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Meaning</h4>
                      <p className="text-xl text-white">{selectedWord.meaning}</p>
                    </div>
                    {selectedWord.wordType && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Type</h4>
                        <Badge variant="outline" className="border-white/[0.08] text-slate-300">{selectedWord.wordType}</Badge>
                      </div>
                    )}
                    {selectedWord.exampleSentenceJP && (
                      <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Example</h4>
                        <p className="text-white">{selectedWord.exampleSentenceJP}</p>
                        <p className="text-sm text-slate-500 mt-1">{selectedWord.exampleSentenceEN}</p>
                      </div>
                    )}
                    {selectedWord.additionalNotes && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Notes</h4>
                        <p className="text-sm text-slate-400">{selectedWord.additionalNotes}</p>
                      </div>
                    )}
                    <div className="pt-4">
                      <Button onClick={() => handleSaveWord(selectedWord.id)} className="w-full bg-white/[0.06] hover:bg-cyan-500/15 text-white border border-white/[0.08] hover:border-cyan-500/30 transition-all">
                        <Star className="w-4 h-4 mr-2" /> Add to My Words
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </DashboardLayout>
  );
};

export default Dictionary;
