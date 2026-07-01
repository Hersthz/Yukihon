import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookmarkPlus, RefreshCw } from "lucide-react";
import { myWordsApi } from "@/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, StatStrip } from "@/components/layout/UserPage";
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

const DEFAULT_STATS: WordStats = {
  totalSaved: 0,
  masteredCount: 0,
  dueTodayCount: 0,
  kanjiDueTodayCount: 0,
  vocabularyDueTodayCount: 0,
  folders: [],
};

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

  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterFolder, setFilterFolder] = useState<string>("");
  const [filterMastered, setFilterMastered] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<WordSourceFilter>("ALL");
  const [reviewMode, setReviewMode] = useState<ReviewMode>("ALL");
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");

  const wordsQuery = useQuery({
    queryKey: ["my-words", "list", filterFolder, filterMastered],
    queryFn: async (): Promise<SavedWord[]> => {
      if (filterFolder) return (await myWordsApi.getAll(filterFolder)) as SavedWord[];
      if (filterMastered === "true") return (await myWordsApi.getMastered(true)) as SavedWord[];
      if (filterMastered === "false") return (await myWordsApi.getMastered(false)) as SavedWord[];
      return (await myWordsApi.getAll()) as SavedWord[];
    },
  });
  const words = useMemo(() => wordsQuery.data ?? [], [wordsQuery.data]);
  const loading = wordsQuery.isLoading;

  const reviewQueueQuery = useQuery({
    queryKey: ["my-words", "review-queue", reviewMode],
    queryFn: async (): Promise<SavedWord[]> =>
      (await myWordsApi.getReviewQueue(reviewMode, true)) as SavedWord[],
  });
  const reviewQueue = reviewQueueQuery.data ?? [];
  const reviewLoading = reviewQueueQuery.isLoading;

  const statsQuery = useQuery({
    queryKey: ["my-words", "stats"],
    queryFn: async (): Promise<WordStats> => (await myWordsApi.getStats()) as WordStats,
  });
  const stats = statsQuery.data ?? DEFAULT_STATS;

  useEffect(() => {
    if (wordsQuery.error) {
      toast({
        title: "Không tải được sổ tay",
        description: "Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  }, [wordsQuery.error, toast]);

  useEffect(() => {
    if (reviewQueueQuery.error) {
      toast({
        title: "Không tải được hàng đợi ôn tập",
        description: "Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  }, [reviewQueueQuery.error, toast]);

  const invalidateAll = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["my-words"] }),
    [queryClient]
  );

  const reviewMutation = useMutation({
    mutationFn: ({ wordId, rating }: { wordId: number; rating: ReviewRating }) =>
      myWordsApi.reviewWord(wordId, rating),
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Đã cập nhật nhịp ôn", description: "Lịch ôn tập đã được tính lại." });
    },
    onError: () => {
      toast({
        title: "Không thể ôn tập",
        description: "Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });
  const reviewingId = reviewMutation.isPending ? (reviewMutation.variables?.wordId ?? null) : null;

  const toggleMasteredMutation = useMutation({
    mutationFn: (wordId: number) => myWordsApi.toggleMastered(wordId),
    onSuccess: () => invalidateAll(),
    onError: () =>
      toast({ title: "Không thể cập nhật", description: "Thử lại sau.", variant: "destructive" }),
  });

  const removeMutation = useMutation({
    mutationFn: (wordId: number) => myWordsApi.removeWord(wordId),
    onSuccess: () => invalidateAll(),
    onError: () =>
      toast({ title: "Không thể xóa từ", description: "Thử lại sau.", variant: "destructive" }),
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ wordId, note }: { wordId: number; note: string }) =>
      myWordsApi.updateNote(wordId, note),
    onSuccess: () => {
      setEditingNote(null);
      setNoteText("");
      invalidateAll();
      toast({ title: "Đã lưu ghi chú", description: "Ghi chú cá nhân đã được cập nhật." });
    },
    onError: () => {
      toast({
        title: "Không lưu được ghi chú",
        description: "Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

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
          title="Lặp lại ngắt quãng"
          description="Sổ tay đã được nâng cấp thành hàng đợi ôn lặp lại: đến hạn hôm nay, chấm mức nhớ và theo dõi tập trung kanji."
          eyebrow="Sổ từ của tôi"
          action={
            <Button
              className="rounded-2xl border-border bg-card text-foreground/80 hover:bg-card"
              onClick={() => void invalidateAll()}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
          }
        />

        <StatStrip
          className="mb-4"
          items={[
            { label: "tổng từ", value: stats.totalSaved },
            { label: "đến hạn hôm nay", value: stats.dueTodayCount },
            { label: "kanji đến hạn", value: stats.kanjiDueTodayCount },
            { label: "đã thuộc", value: `${masteredPercent}%` },
          ]}
        />

        <ReviewQueueSection
          reviewMode={reviewMode}
          reviewLoading={reviewLoading}
          reviewQueue={reviewQueue}
          reviewingId={reviewingId}
          onReviewModeChange={setReviewMode}
          onReview={(wordId, rating) => reviewMutation.mutate({ wordId, rating })}
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
          onSaveNote={(wordId) => updateNoteMutation.mutate({ wordId, note: noteText })}
          onToggleMastered={(wordId) => toggleMasteredMutation.mutate(wordId)}
          onRemoveWord={(wordId) => removeMutation.mutate(wordId)}
        />
      </div>
    </DashboardLayout>
  );
};

export default MyWords;
