import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  BookmarkPlus,
  Brain,
  Edit3,
  Folder,
  KanbanSquare,
  RefreshCw,
  Search,
  Sparkles,
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

type ReviewRating = "AGAIN" | "HARD" | "GOOD" | "EASY";
type ReviewMode = "ALL" | "KANJI" | "VOCABULARY";

interface SavedWord {
  id: number;
  vocabularyId: number;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning: string;
  exampleSentenceJP?: string;
  exampleSentenceEN?: string;
  jlptLevel: string;
  folderName: string;
  personalNote: string;
  mastered: boolean;
  reviewIntervalDays: number;
  easeFactor: number;
  repetitionCount: number;
  reviewCount: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  dueForReview: boolean;
  studyFocus: "KANJI" | "VOCABULARY";
  createdAt: string;
}

interface WordStats {
  totalSaved: number;
  masteredCount: number;
  dueTodayCount: number;
  kanjiDueTodayCount: number;
  vocabularyDueTodayCount: number;
  folders: string[];
}

const ratingButtonClass: Record<ReviewRating, string> = {
  AGAIN: "bg-rose-500 text-white hover:bg-rose-400",
  HARD: "bg-amber-500 text-white hover:bg-amber-400",
  GOOD: "bg-sky-500 text-white hover:bg-sky-400",
  EASY: "bg-emerald-500 text-white hover:bg-emerald-400",
};

const formatRelativeReview = (value?: string) => {
  if (!value) return "Review ngay";

  const reviewDate = new Date(value);
  if (Number.isNaN(reviewDate.getTime())) {
    return "Review ngay";
  }

  const now = new Date();
  const diff = reviewDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Den han hom nay";
  if (diffDays === 1) return "Den han ngay mai";
  return `${diffDays} ngay nua`;
};

const formatAbsoluteDate = (value?: string) => {
  if (!value) return "Ngay";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Ngay";
  }

  return date.toLocaleDateString("vi-VN");
};

const MyWords = () => {
  const { toast } = useToast();
  const [words, setWords] = useState<SavedWord[]>([]);
  const [reviewQueue, setReviewQueue] = useState<SavedWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterFolder, setFilterFolder] = useState<string>("");
  const [filterMastered, setFilterMastered] = useState<string>("");
  const [reviewMode, setReviewMode] = useState<ReviewMode>("ALL");
  const [stats, setStats] = useState<WordStats>({
    totalSaved: 0,
    masteredCount: 0,
    dueTodayCount: 0,
    kanjiDueTodayCount: 0,
    vocabularyDueTodayCount: 0,
    folders: [],
  });
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [reviewingId, setReviewingId] = useState<number | null>(null);

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
      toast({ title: "Khong tai duoc so tay", description: "Vui long thu lai.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [filterFolder, filterMastered, toast]);

  const fetchReviewQueue = useCallback(async () => {
    setReviewLoading(true);
    try {
      const data = (await myWordsApi.getReviewQueue(reviewMode, true)) as SavedWord[];
      setReviewQueue(data);
    } catch {
      toast({ title: "Khong tai duoc hang doi review", description: "Vui long thu lai.", variant: "destructive" });
    } finally {
      setReviewLoading(false);
    }
  }, [reviewMode, toast]);

  const fetchStats = useCallback(async () => {
    try {
      const data = (await myWordsApi.getStats()) as WordStats;
      setStats(data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    void fetchWords();
  }, [fetchWords]);

  useEffect(() => {
    void fetchReviewQueue();
  }, [fetchReviewQueue]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchWords(), fetchReviewQueue(), fetchStats()]);
  }, [fetchReviewQueue, fetchStats, fetchWords]);

  const handleReview = async (wordId: number, rating: ReviewRating) => {
    try {
      setReviewingId(wordId);
      await myWordsApi.reviewWord(wordId, rating);
      await refreshAll();
      toast({ title: "Da cap nhat nhip on", description: "Lich review da duoc tinh lai." });
    } catch {
      toast({ title: "Khong the review", description: "Vui long thu lai.", variant: "destructive" });
    } finally {
      setReviewingId(null);
    }
  };

  const toggleMastered = async (wordId: number) => {
    try {
      await myWordsApi.toggleMastered(wordId);
      await refreshAll();
    } catch {
      toast({ title: "Khong the cap nhat", description: "Thu lai sau.", variant: "destructive" });
    }
  };

  const removeWord = async (wordId: number) => {
    try {
      await myWordsApi.removeWord(wordId);
      await refreshAll();
    } catch {
      toast({ title: "Khong the xoa tu", description: "Thu lai sau.", variant: "destructive" });
    }
  };

  const updateNote = async (wordId: number) => {
    try {
      await myWordsApi.updateNote(wordId, noteText);
      setEditingNote(null);
      setNoteText("");
      await refreshAll();
      toast({ title: "Da luu ghi chu", description: "Ghi chu ca nhan da duoc cap nhat." });
    } catch {
      toast({ title: "Khong luu duoc ghi chu", description: "Vui long thu lai.", variant: "destructive" });
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
      <div className="mx-auto max-w-[1480px]">
        <PageHeader
          icon={<BookmarkPlus className="h-6 w-6 text-emerald-600" />}
          title="Spaced repetition"
          description="So tay da duoc nang cap thanh hang doi on lap lai: due today, cham muc nho, va theo doi kanji focus."
          eyebrow="My Words"
          action={
            <Button className="rounded-2xl border-border bg-card text-foreground/80 hover:bg-card" onClick={() => void refreshAll()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Lam moi
            </Button>
          }
        />

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <MetricCard hint="Tat ca muc da luu" icon={<BookOpen className="h-4 w-4 text-sky-500" />} label="Tong tu" value={stats.totalSaved} />
          <MetricCard hint="Can review hom nay" icon={<Brain className="h-4 w-4 text-rose-500" />} label="Due today" value={stats.dueTodayCount} />
          <MetricCard hint="Tap trung mat chu" icon={<KanbanSquare className="h-4 w-4 text-amber-500" />} label="Kanji due" value={stats.kanjiDueTodayCount} />
          <MetricCard hint="Ty le da nam chac" icon={<Sparkles className="h-4 w-4 text-emerald-500" />} label="Da thuoc" value={`${masteredPercent}%`} />
        </div>

        <PageSection className="mb-4" title="Review queue" description="Hang doi uu tien nhung muc den han truoc. Chon muc do de he thong tinh lai lich on.">
          <div className="mb-4 grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
            <Select value={reviewMode} onValueChange={(value) => setReviewMode(value as ReviewMode)}>
              <SelectTrigger className="h-11 rounded-2xl border-border bg-card text-foreground/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tat ca</SelectItem>
                <SelectItem value="KANJI">Kanji focus</SelectItem>
                <SelectItem value="VOCABULARY">Vocabulary focus</SelectItem>
              </SelectContent>
            </Select>

            <div className="rounded-[20px] border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              {reviewMode === "KANJI"
                ? "Hang doi nay uu tien cac muc co kanji de ban luyen nhan dien mat chu."
                : reviewMode === "VOCABULARY"
                  ? "Hang doi nay uu tien cac muc vocabulary khong nghieng ve kanji."
                  : "Tat ca muc den han se xuat hien o day."}
            </div>
          </div>

          {reviewLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-12 w-12 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
            </div>
          ) : reviewQueue.length === 0 ? (
            <EmptyState
              description="Khong co muc nao den han trong bo loc hien tai. Ban co the doi che do review hoac quay lai sau."
              icon={<Brain className="h-6 w-6" />}
              title="Review queue dang trong"
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {reviewQueue.map((word) => (
                <div key={word.id} className="rounded-[22px] border border-white bg-card p-4 shadow-[0_10px_24px_rgba(148,163,184,0.10)]">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[1.5rem] font-semibold text-foreground">{word.kanji || word.hiragana}</p>
                      <p className="text-sm text-sky-700">{word.hiragana}</p>
                      <p className="text-xs text-muted-foreground">{word.romaji}</p>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">{word.jlptLevel || "N5"}</Badge>
                      <Badge className="rounded-full border border-border bg-muted text-muted-foreground">{word.studyFocus}</Badge>
                    </div>
                  </div>

                  <p className="text-sm text-foreground/80">{word.meaning}</p>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-[16px] border border-border bg-muted/40 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Next review</p>
                      <p className="mt-2 font-medium text-foreground">{formatRelativeReview(word.nextReviewAt)}</p>
                    </div>
                    <div className="rounded-[16px] border border-border bg-muted/40 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Interval</p>
                      <p className="mt-2 font-medium text-foreground">{word.reviewIntervalDays} ngay</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>Lap lai: {word.repetitionCount}</span>
                    <span>•</span>
                    <span>Review: {word.reviewCount}</span>
                    <span>•</span>
                    <span>Ease: {word.easeFactor?.toFixed?.(2) ?? word.easeFactor}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {(["AGAIN", "HARD", "GOOD", "EASY"] as const).map((rating) => (
                      <Button
                        key={rating}
                        className={`rounded-xl ${ratingButtonClass[rating]}`}
                        disabled={reviewingId === word.id}
                        onClick={() => void handleReview(word.id, rating)}
                        size="sm"
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageSection>

        <PageSection className="mb-4" title="Notebook filters" description="Van giu so tay de ban tim nhanh, note, xoa hoac xem lich review cua tung muc.">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-11 rounded-2xl border-border bg-card pl-11 text-foreground placeholder:text-muted-foreground"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tim theo kanji, hiragana, romaji hoac nghia"
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
              <SelectTrigger className="h-11 rounded-2xl border-border bg-card text-foreground/80">
                <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tat ca folder</SelectItem>
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
              <SelectTrigger className="h-11 rounded-2xl border-border bg-card text-foreground/80">
                <SelectValue placeholder="Trang thai" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tat ca</SelectItem>
                <SelectItem value="true">Da thuoc</SelectItem>
                <SelectItem value="false">Chua thuoc</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PageSection>

        <PageSection title="So tay ca nhan" description="Moi the giu ca thong tin notebook va SRS: next review, interval, note va trang thai nho.">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
            </div>
          ) : filteredWords.length === 0 ? (
            <EmptyState
              description="Hay luu tu tu dictionary hoac bai hoc de bat dau tao bo review."
              icon={<BookmarkPlus className="h-6 w-6" />}
              title="Notebook dang trong"
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence>
                {filteredWords.map((word, index) => (
                  <motion.div
                    key={word.id}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[22px] border border-white bg-card p-4 shadow-[0_10px_24px_rgba(148,163,184,0.10)]"
                    exit={{ opacity: 0, y: -10 }}
                    initial={{ opacity: 0, y: 10 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[1.5rem] font-semibold text-foreground">{word.kanji || word.hiragana}</p>
                        <p className="text-sm text-sky-700">{word.hiragana}</p>
                        <p className="text-xs text-muted-foreground">{word.romaji}</p>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        {word.jlptLevel && (
                          <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">{word.jlptLevel}</Badge>
                        )}
                        {word.folderName && (
                          <Badge className="rounded-full border border-border bg-muted text-muted-foreground">{word.folderName}</Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-foreground/80">{word.meaning}</p>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-[16px] border border-border bg-muted/40 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Next review</p>
                        <p className="mt-2 font-medium text-foreground">{formatAbsoluteDate(word.nextReviewAt)}</p>
                      </div>
                      <div className="rounded-[16px] border border-border bg-muted/40 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Interval</p>
                        <p className="mt-2 font-medium text-foreground">{word.reviewIntervalDays} ngay</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{word.studyFocus}</span>
                      <span>•</span>
                      <span>{word.dueForReview ? "Dang den han" : formatRelativeReview(word.nextReviewAt)}</span>
                      <span>•</span>
                      <span>{word.mastered ? "Da thuoc" : "Dang hoc"}</span>
                    </div>

                    {editingNote === word.id ? (
                      <div className="mt-3 flex gap-2">
                        <Input
                          className="h-10 rounded-xl border-border bg-card text-sm text-foreground"
                          onChange={(e) => setNoteText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && updateNote(word.id)}
                          placeholder="Them mot ghi chu ngan"
                          value={noteText}
                        />
                        <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => void updateNote(word.id)} size="sm">
                          Luu
                        </Button>
                      </div>
                    ) : word.personalNote ? (
                      <div className="mt-3 rounded-[18px] border border-amber-200 bg-amber-50/80 p-3">
                        <div className="flex items-start gap-2">
                          <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Ghi chu</p>
                            <p className="mt-1 text-sm text-amber-900">{word.personalNote}</p>
                          </div>
                          <Button
                            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
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
                        onClick={() => void toggleMastered(word.id)}
                        size="sm"
                      >
                        {word.mastered ? <StarOff className="mr-1 h-4 w-4" /> : <Star className="mr-1 h-4 w-4" />}
                        {word.mastered ? "Bo mastered" : "Mark mastered"}
                      </Button>

                      {!word.personalNote && (
                        <Button
                          className="rounded-xl border-border bg-white text-muted-foreground"
                          onClick={() => {
                            setEditingNote(word.id);
                            setNoteText("");
                          }}
                          size="sm"
                          variant="outline"
                        >
                          <StickyNote className="mr-1 h-4 w-4" />
                          Ghi chu
                        </Button>
                      )}

                      <Button className="ml-auto rounded-xl text-rose-600 hover:text-rose-700" onClick={() => void removeWord(word.id)} size="icon" variant="ghost">
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
