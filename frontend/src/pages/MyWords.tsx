import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookmarkPlus, Star, StarOff, Folder, FolderPlus, Search,
  Trash2, StickyNote, CheckCircle2, BookOpen, BarChart3, Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

interface SavedWord {
  id: number;
  vocabularyId: number;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning: string;
  jlptLevel: string;
  folderName: string;
  personalNote: string;
  mastered: boolean;
  savedAt: string;
}

interface WordStats {
  totalSaved: number;
  masteredCount: number;
  folders: string[];
}

const MyWords = () => {
  const { toast } = useToast();
  const [words, setWords] = useState<SavedWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterFolder, setFilterFolder] = useState<string>("");
  const [filterMastered, setFilterMastered] = useState<string>("");
  const [stats, setStats] = useState<WordStats>({ totalSaved: 0, masteredCount: 0, folders: [] });
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);

  const fetchWords = useCallback(async () => {
    setLoading(true);
    try {
      let data: SavedWord[];
      if (filterFolder) {
        data = await apiClient.myWords.getAll(filterFolder) as SavedWord[];
      } else if (filterMastered === "true") {
        data = await apiClient.myWords.getMastered(true) as SavedWord[];
      } else if (filterMastered === "false") {
        data = await apiClient.myWords.getMastered(false) as SavedWord[];
      } else {
        data = await apiClient.myWords.getAll() as SavedWord[];
      }
      setWords(data);
    } catch {
      toast({ title: "Error", description: "Failed to load saved words", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [filterFolder, filterMastered, toast]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiClient.myWords.getStats() as WordStats;
      setStats(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchWords(); fetchStats(); }, [fetchWords, fetchStats]);

  const toggleMastered = async (wordId: number) => {
    try {
      const updated = await apiClient.myWords.toggleMastered(wordId) as SavedWord;
      setWords(prev => prev.map(w => w.id === wordId ? updated : w));
      fetchStats();
      toast({
        title: updated.mastered ? "Mastered! 🎉" : "Unmastered",
        description: updated.mastered ? `${updated.kanji || updated.hiragana} đã thuộc!` : "Đã bỏ đánh dấu thuộc",
      });
    } catch {
      toast({ title: "Error", description: "Failed to toggle", variant: "destructive" });
    }
  };

  const removeWord = async (wordId: number) => {
    try {
      await apiClient.myWords.removeWord(wordId);
      setWords(prev => prev.filter(w => w.id !== wordId));
      fetchStats();
      toast({ title: "Removed", description: "Word removed from collection" });
    } catch {
      toast({ title: "Error", description: "Failed to remove", variant: "destructive" });
    }
  };

  const updateNote = async (wordId: number) => {
    try {
      await apiClient.myWords.updateNote(wordId, noteText);
      setWords(prev => prev.map(w => w.id === wordId ? { ...w, personalNote: noteText } : w));
      setEditingNote(null);
      toast({ title: "Saved", description: "Note updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update note", variant: "destructive" });
    }
  };

  const filtered = words.filter(w => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (w.kanji && w.kanji.toLowerCase().includes(q)) ||
      (w.hiragana && w.hiragana.toLowerCase().includes(q)) ||
      (w.romaji && w.romaji.toLowerCase().includes(q)) ||
      (w.meaning && w.meaning.toLowerCase().includes(q))
    );
  });

  const masteredPercent = stats.totalSaved > 0 ? Math.round((stats.masteredCount / stats.totalSaved) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
                <BookmarkPlus className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">My Words 私の単語</h1>
                <p className="text-sm text-slate-400">Bộ từ vựng cá nhân của bạn</p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-cyan-500/10"><BookOpen className="w-6 h-6 text-cyan-400" /></div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalSaved}</p>
                <p className="text-xs text-slate-500">Tổng từ đã lưu</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10"><CheckCircle2 className="w-6 h-6 text-emerald-400" /></div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.masteredCount}</p>
                <p className="text-xs text-slate-500">Đã thuộc</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10"><BarChart3 className="w-6 h-6 text-amber-400" /></div>
              <div>
                <p className="text-2xl font-bold text-white">{masteredPercent}%</p>
                <p className="text-xs text-slate-500">Tỷ lệ hoàn thành</p>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-wrap gap-3 mb-8">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Tìm kiếm từ vựng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/[0.03] border-white/[0.06] text-white placeholder:text-slate-500"
              />
            </div>
            <Select value={filterFolder || "all"} onValueChange={(v) => { setFilterFolder(v === "all" ? "" : v); setFilterMastered(""); }}>
              <SelectTrigger className="w-[160px] bg-white/[0.03] border-white/[0.06] text-white">
                <Folder className="w-4 h-4 mr-2 text-slate-500" />
                <SelectValue placeholder="Folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {stats.folders?.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={filterMastered || "all"} onValueChange={(v) => { setFilterMastered(v === "all" ? "" : v); setFilterFolder(""); }}>
              <SelectTrigger className="w-[160px] bg-white/[0.03] border-white/[0.06] text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Đã thuộc ✅</SelectItem>
                <SelectItem value="false">Chưa thuộc 📝</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Word List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative w-12 h-12">
                <motion.div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                <motion.div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400" animate={{ rotate: -360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <BookmarkPlus className="w-14 h-14 text-slate-600 mx-auto mb-4" />
              <p className="text-lg text-slate-400">Chưa có từ nào</p>
              <p className="text-sm text-slate-500">Lưu từ vựng từ trang Tra cứu hoặc bài học</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {filtered.map((word, i) => (
                  <motion.div
                    key={word.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <div className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden transition-all hover:border-white/[0.1] ${word.mastered ? "border-l-4 border-l-emerald-500" : ""}`}>
                      <div className="h-0.5 bg-gradient-to-r from-emerald-500/30 to-teal-500/30" />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-2xl font-bold text-white">{word.kanji || word.hiragana}</p>
                            {word.kanji && <p className="text-sm text-cyan-400">{word.hiragana}</p>}
                            <p className="text-xs text-slate-500">{word.romaji}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {word.jlptLevel && <Badge className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 text-xs">{word.jlptLevel}</Badge>}
                            {word.folderName && (
                              <Badge variant="outline" className="text-xs border-white/[0.08] text-slate-400">
                                <Folder className="w-3 h-3 mr-1" />{word.folderName}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-300 mb-3">{word.meaning}</p>

                        {/* Personal Note */}
                        {editingNote === word.id ? (
                          <div className="flex gap-2 mb-3">
                            <Input
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Ghi chú..."
                              className="bg-white/[0.03] border-white/[0.06] text-white text-sm placeholder:text-slate-500"
                              onKeyDown={(e) => e.key === "Enter" && updateNote(word.id)}
                            />
                            <Button size="sm" onClick={() => updateNote(word.id)} className="bg-white/[0.06] hover:bg-emerald-500/15 text-white border border-white/[0.08]">Save</Button>
                            <Button size="sm" variant="ghost" className="text-slate-400" onClick={() => setEditingNote(null)}>✕</Button>
                          </div>
                        ) : word.personalNote ? (
                          <div className="flex items-center gap-2 mb-3 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/15">
                            <StickyNote className="w-3 h-3 text-amber-400 shrink-0" />
                            <p className="text-xs text-amber-300 flex-1">{word.personalNote}</p>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-white" onClick={() => { setEditingNote(word.id); setNoteText(word.personalNote); }}>
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : null}

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant={word.mastered ? "default" : "ghost"}
                            size="sm"
                            onClick={() => toggleMastered(word.id)}
                            className={word.mastered ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white"}
                          >
                            {word.mastered ? <StarOff className="w-4 h-4 mr-1" /> : <Star className="w-4 h-4 mr-1" />}
                            {word.mastered ? "Bỏ thuộc" : "Đã thuộc"}
                          </Button>
                          {!word.personalNote && (
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => { setEditingNote(word.id); setNoteText(""); }}>
                              <StickyNote className="w-4 h-4 mr-1" /> Ghi chú
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-red-400/70 hover:text-red-400 ml-auto" onClick={() => removeWord(word.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
    </DashboardLayout>
  );
};

export default MyWords;
