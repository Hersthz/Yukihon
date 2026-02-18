import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Volume2, Star, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import WinterNightBackground from "@/components/WinterNightBackground";
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
      <div className="min-h-screen relative">
        <WinterNightBackground snowCount={30} sparkleCount={15} intensity="light" />
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <BookOpen className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Từ điển 辞書
                </h1>
                <p className="text-muted-foreground">Tra cứu từ vựng tiếng Nhật</p>
              </div>
            </div>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Nhập kanji, hiragana, romaji hoặc nghĩa..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-12 h-12 text-lg bg-background/50"
                    />
                  </div>
                  <Button onClick={handleSearch} size="lg" className="px-8">
                    <Search className="w-5 h-5 mr-2" />
                    Tra cứu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : searched && results.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <p className="text-xl text-muted-foreground">Không tìm thấy kết quả cho "{query}"</p>
              <p className="text-sm text-muted-foreground mt-2">Thử từ khóa khác hoặc kiểm tra chính tả</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {results.map((word, index) => (
                  <motion.div
                    key={word.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="bg-card/40 backdrop-blur-md border-border/50 hover:bg-card/60 transition-all cursor-pointer group"
                      onClick={() => setSelectedWord(word)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-3xl font-bold text-white mb-1">{word.kanji || word.hiragana}</h3>
                            <p className="text-sm text-cyan-400">{word.hiragana} · {word.romaji}</p>
                          </div>
                          <div className="flex gap-1">
                            {word.jlptLevel && (
                              <Badge className={levelColor[word.jlptLevel] || "bg-gray-500/20"}>
                                {word.jlptLevel}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-lg text-white/90 mb-2">{word.meaning}</p>
                        {word.wordType && (
                          <Badge variant="outline" className="text-xs">{word.wordType}</Badge>
                        )}
                        <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleSaveWord(word.id); }}>
                            <Plus className="w-4 h-4 mr-1" /> Save
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
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
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-card border border-border rounded-2xl p-8 max-w-lg w-full shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-5xl font-bold text-white mb-2">{selectedWord.kanji || selectedWord.hiragana}</h2>
                      <p className="text-lg text-cyan-400">{selectedWord.hiragana} · {selectedWord.romaji}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedWord(null)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-1">Meaning</h4>
                      <p className="text-xl text-white">{selectedWord.meaning}</p>
                    </div>
                    {selectedWord.wordType && (
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-1">Type</h4>
                        <Badge variant="outline">{selectedWord.wordType}</Badge>
                      </div>
                    )}
                    {selectedWord.exampleSentenceJP && (
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-1">Example</h4>
                        <p className="text-white">{selectedWord.exampleSentenceJP}</p>
                        <p className="text-muted-foreground text-sm mt-1">{selectedWord.exampleSentenceEN}</p>
                      </div>
                    )}
                    {selectedWord.additionalNotes && (
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-1">Notes</h4>
                        <p className="text-muted-foreground">{selectedWord.additionalNotes}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-4">
                      <Button onClick={() => handleSaveWord(selectedWord.id)} className="flex-1">
                        <Star className="w-4 h-4 mr-2" /> Add to My Words
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dictionary;
