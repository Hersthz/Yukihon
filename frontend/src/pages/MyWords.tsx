import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  BookmarkPlus,
  CheckCircle2,
  Edit3,
  Folder,
  Search,
  Star,
  StarOff,
  StickyNote,
  Trash2,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { myWordsApi } from "@/api";
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

  const fetchWords = useCallback(async () => {
    setLoading(true);
    try {
      let data: SavedWord[];

      if (filterFolder) {
        data = (await myWordsApi.getAll(filterFolder)) as SavedWord[];
      } else if (filterMastered === "true") {
        data = (await myWordsApi.getMastered(true)) as SavedWord[];
      } else if (filterMastered === "false") {
        data = (await myWordsApi.getMastered(false)) as SavedWord[];
      } else {
        data = (await myWordsApi.getAll()) as SavedWord[];
      }

      setWords(data);
    } catch {
      toast({ title: "Không tải được sổ tay", description: "Vui lòng thử lại.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [filterFolder, filterMastered, toast]);

  const fetchStats = useCallback(async () => {
    try {
      const data = (await myWordsApi.getStats()) as WordStats;
      setStats(data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchWords();
    fetchStats();
  }, [fetchStats, fetchWords]);

  const toggleMastered = async (wordId: number) => {
    try {
      const updated = (await myWordsApi.toggleMastered(wordId)) as SavedWord;
      setWords((prev) => prev.map((word) => (word.id === wordId ? updated : word)));
      fetchStats();
    } catch {
      toast({ title: "Không thể cập nhật", description: "Thử lại sau.", variant: "destructive" });
    }
  };

  const removeWord = async (wordId: number) => {
    try {
      await myWordsApi.removeWord(wordId);
      setWords((prev) => prev.filter((word) => word.id !== wordId));
      fetchStats();
    } catch {
      toast({ title: "Không thể xoá từ", description: "Thử lại sau.", variant: "destructive" });
    }
  };

  const updateNote = async (wordId: number) => {
    try {
      await myWordsApi.updateNote(wordId, noteText);
      setWords((prev) => prev.map((word) => (word.id === wordId ? { ...word, personalNote: noteText } : word)));
      setEditingNote(null);
      setNoteText("");
      toast({ title: "Đã lưu ghi chú", description: "Thông tin cá nhân cho từ vựng đã được cập nhật." });
    } catch {
      toast({ title: "Không lưu được ghi chú", description: "Vui lòng thử lại.", variant: "destructive" });
    }
  };

  const filteredWords = useMemo(() => {
    if (!search.trim()) return words;
    const normalized = search.toLowerCase();
    return words.filter((word) =>
      [word.kanji, word.hiragana, word.romaji, word.meaning].some((value) => value?.toLowerCase().includes(normalized))
    );
  }, [search, words]);

  const masteredPercent = stats.totalSaved ? Math.round((stats.masteredCount / stats.totalSaved) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1420px]">
        <PageHeader
          icon={<BookmarkPlus className="h-6 w-6 text-emerald-600" />}
          title="Từ của tôi"
          description="Một sổ tay gọn hơn, nhìn được nhiều thẻ hơn trong cùng một màn hình và chỉnh ghi chú ngay tại chỗ."
          eyebrow="My Words"
        />

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricCard hint="Tất cả mục đã lưu" icon={<BookOpen className="h-4 w-4 text-sky-500" />} label="Tổng từ" value={stats.totalSaved} />
          <MetricCard hint="Đã đánh dấu nắm chắc" icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} label="Đã thuộc" value={stats.masteredCount} />
          <MetricCard hint="Theo tiến độ hiện tại" icon={<Star className="h-4 w-4 text-amber-500" />} label="Tỉ lệ nhớ" value={`${masteredPercent}%`} />
        </div>

        <PageSection className="mb-4" title="Bộ lọc nhanh" description="Giảm thao tác cuộn bằng cách gom filter lên một hàng.">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-11 rounded-2xl border-white/80 bg-white/90 pl-11 text-slate-900 placeholder:text-slate-400"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo kanji, hiragana, romaji hoặc nghĩa"
                value={search}
              />
            </div>

            <Select
              onValueChange={(value) => {
                setFilterFolder(value === "all" ? "" : value);
                setFilterMastered("");
              }}
              value={filterFolder || "all"}
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/80 bg-white/90 text-slate-700">
                <Folder className="mr-2 h-4 w-4 text-slate-400" />
                <SelectValue placeholder="Folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả folder</SelectItem>
                {stats.folders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {folder}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => {
                setFilterMastered(value === "all" ? "" : value);
                setFilterFolder("");
              }}
              value={filterMastered || "all"}
            >
              <SelectTrigger className="h-11 rounded-2xl border-white/80 bg-white/90 text-slate-700">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="true">Đã thuộc</SelectItem>
                <SelectItem value="false">Chưa thuộc</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PageSection>

        <PageSection title="Sổ tay cá nhân" description="Card thấp hơn và giữ đủ thông tin để bạn quét nhanh toàn bộ bộ từ.">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
            </div>
          ) : filteredWords.length === 0 ? (
            <EmptyState
              description="Hãy lưu từ từ trang tra cứu hoặc bài học để bắt đầu một bộ sưu tập rõ ràng hơn."
              icon={<BookmarkPlus className="h-6 w-6" />}
              title="Sổ tay vẫn đang trống"
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence>
                {filteredWords.map((word, index) => (
                  <motion.div
                    key={word.id}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[22px] border border-white bg-white p-4 shadow-[0_10px_24px_rgba(148,163,184,0.10)]"
                    exit={{ opacity: 0, y: -10 }}
                    initial={{ opacity: 0, y: 10 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[1.5rem] font-semibold text-slate-900">{word.kanji || word.hiragana}</p>
                        <p className="text-sm text-sky-700">{word.hiragana}</p>
                        <p className="text-xs text-slate-500">{word.romaji}</p>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        {word.jlptLevel && (
                          <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">{word.jlptLevel}</Badge>
                        )}
                        {word.folderName && (
                          <Badge className="rounded-full border border-slate-200 bg-slate-50 text-slate-600">{word.folderName}</Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-slate-700">{word.meaning}</p>

                    {editingNote === word.id ? (
                      <div className="mt-3 flex gap-2">
                        <Input
                          className="h-10 rounded-xl border-white/80 bg-white/90 text-sm text-slate-900"
                          onChange={(e) => setNoteText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && updateNote(word.id)}
                          placeholder="Thêm một ghi chú ngắn"
                          value={noteText}
                        />
                        <Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800" onClick={() => updateNote(word.id)} size="sm">
                          Lưu
                        </Button>
                      </div>
                    ) : word.personalNote ? (
                      <div className="mt-3 rounded-[18px] border border-amber-200 bg-amber-50/80 p-3">
                        <div className="flex items-start gap-2">
                          <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Ghi chú</p>
                            <p className="mt-1 text-sm text-amber-900">{word.personalNote}</p>
                          </div>
                          <Button
                            className="h-8 w-8 rounded-xl text-slate-500 hover:text-slate-900"
                            onClick={() => {
                              setEditingNote(word.id);
                              setNoteText(word.personalNote);
                            }}
                            size="icon"
                            variant="ghost"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        className={word.mastered ? "rounded-xl bg-emerald-500 text-white hover:bg-emerald-400" : "rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100"}
                        onClick={() => toggleMastered(word.id)}
                        size="sm"
                      >
                        {word.mastered ? <StarOff className="mr-1 h-4 w-4" /> : <Star className="mr-1 h-4 w-4" />}
                        {word.mastered ? "Bỏ đã thuộc" : "Đánh dấu thuộc"}
                      </Button>

                      {!word.personalNote && (
                        <Button
                          className="rounded-xl border-slate-200 bg-white text-slate-600"
                          onClick={() => {
                            setEditingNote(word.id);
                            setNoteText("");
                          }}
                          size="sm"
                          variant="outline"
                        >
                          <StickyNote className="mr-1 h-4 w-4" />
                          Ghi chú
                        </Button>
                      )}

                      <Button className="ml-auto rounded-xl text-rose-600 hover:text-rose-700" onClick={() => removeWord(word.id)} size="icon" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </PageSection>
      </div>
    </DashboardLayout>
  );
};

export default MyWords;
