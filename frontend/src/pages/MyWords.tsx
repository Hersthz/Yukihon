import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, BookmarkPlus, Brain, KanbanSquare, RefreshCw, Sparkles } from "lucide-react";
import { myWordsApi } from "@/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard, PageHeader } from "@/components/layout/UserPage";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import NotebookSection from "@/pages/my-words/NotebookSection";
import ReviewQueueSection from "@/pages/my-words/ReviewQueueSection";
import {
  ReviewMode,
  ReviewRating,
  SavedWord,
  WordSourceFilter,
  WordStats,
} from "@/pages/my-words/types";

const DICTIONARY_FOLDER = "Dictionary";
const TRANSLATION_FOLDER = "Translation";

const matchesSourceFilter = (word: SavedWord, sourceFilter: WordSourceFilter) => {
  const folderName = word.folderName?.trim();

  switch (sourceFilter) {
    case "DICTIONARY":
      return folderName === DICTIONARY_FOLDER;
    case "TRANSLATION":
      return folderName === TRANSLATION_FOLDER;
    case "OTHER":
      return folderName !== DICTIONARY_FOLDER && folderName !== TRANSLATION_FOLDER;
    default:
      return true;
  }
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
  const [sourceFilter, setSourceFilter] = useState<WordSourceFilter>("ALL");
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
      toast({
        title: "Khong tai duoc so tay",
        description: "Vui long thu lai.",
        variant: "destructive",
      });
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
      toast({
        title: "Khong tai duoc hang doi review",
        description: "Vui long thu lai.",
        variant: "destructive",
      });
    } finally {
      setReviewLoading(false);
    }
  }, [reviewMode, toast]);

  const fetchStats = useCallback(async () => {
    try {
      const data = (await myWordsApi.getStats()) as WordStats;
      setStats(data);
    } catch {
      // keep the page usable if stats fail
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
      toast({
        title: "Khong the review",
        description: "Vui long thu lai.",
        variant: "destructive",
      });
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
      toast({
        title: "Khong luu duoc ghi chu",
        description: "Vui long thu lai.",
        variant: "destructive",
      });
    }
  };

  const filteredWords = useMemo(() => {
    const sourceFilteredWords = words.filter((word) => matchesSourceFilter(word, sourceFilter));
    if (!search.trim()) return sourceFilteredWords;

    const normalized = search.toLowerCase();
    return sourceFilteredWords.filter((word) =>
      [word.kanji, word.hiragana, word.romaji, word.meaning].some((value) =>
        value?.toLowerCase().includes(normalized)
      )
    );
  }, [search, sourceFilter, words]);

  const masteredPercent = stats.totalSaved
    ? Math.round((stats.masteredCount / stats.totalSaved) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1480px]">
        <PageHeader
          icon={<BookmarkPlus className="h-6 w-6 text-emerald-600" />}
          title="Spaced repetition"
          description="So tay da duoc nang cap thanh hang doi on lap lai: due today, cham muc nho, va theo doi kanji focus."
          eyebrow="My Words"
          action={
            <Button
              className="rounded-2xl border-border bg-card text-foreground/80 hover:bg-card"
              onClick={() => void refreshAll()}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Lam moi
            </Button>
          }
        />

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <MetricCard
            hint="Tat ca muc da luu"
            icon={<BookOpen className="h-4 w-4 text-sky-500" />}
            label="Tong tu"
            value={stats.totalSaved}
          />
          <MetricCard
            hint="Can review hom nay"
            icon={<Brain className="h-4 w-4 text-rose-500" />}
            label="Due today"
            value={stats.dueTodayCount}
          />
          <MetricCard
            hint="Tap trung mat chu"
            icon={<KanbanSquare className="h-4 w-4 text-amber-500" />}
            label="Kanji due"
            value={stats.kanjiDueTodayCount}
          />
          <MetricCard
            hint="Ty le da nam chac"
            icon={<Sparkles className="h-4 w-4 text-emerald-500" />}
            label="Da thuoc"
            value={`${masteredPercent}%`}
          />
        </div>

        <ReviewQueueSection
          reviewMode={reviewMode}
          reviewLoading={reviewLoading}
          reviewQueue={reviewQueue}
          reviewingId={reviewingId}
          onReviewModeChange={setReviewMode}
          onReview={(wordId, rating) => void handleReview(wordId, rating)}
        />

        <NotebookSection
          loading={loading}
          words={filteredWords}
          stats={stats}
          search={search}
          filterFolder={filterFolder}
          filterMastered={filterMastered}
          sourceFilter={sourceFilter}
          editingNote={editingNote}
          noteText={noteText}
          onSearchChange={setSearch}
          onFilterFolderChange={(value) => {
            setFilterFolder(value);
            setFilterMastered("");
          }}
          onFilterMasteredChange={(value) => {
            setFilterMastered(value);
            setFilterFolder("");
          }}
          onSourceFilterChange={setSourceFilter}
          onStartEditingNote={(wordId, note) => {
            setEditingNote(wordId);
            setNoteText(note);
          }}
          onNoteTextChange={setNoteText}
          onSaveNote={(wordId) => void updateNote(wordId)}
          onToggleMastered={(wordId) => void toggleMastered(wordId)}
          onRemoveWord={(wordId) => void removeWord(wordId)}
        />
      </div>
    </DashboardLayout>
  );
};

export default MyWords;
