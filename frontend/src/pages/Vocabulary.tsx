import { useMemo, useState } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowUpDown, BookOpen, Filter, Search } from "lucide-react";

import { myWordsApi } from "@/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import VocabularyCard from "@/components/learning/VocabularyCard";
import { EmptyState, PageHeader, PageSection, StatStrip } from "@/components/layout/UserPage";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useSavedWords,
  useVocabularyLevels,
  useVocabularyList,
} from "@/hooks/learning/useVocabulary";
import type { SavedWord } from "@/pages/my-words/types";

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

type SavedStateFilter = "all" | "saved" | "unsaved";
type ReviewStateFilter = "all" | "due" | "mastered";
type VocabularySourceFilter = "all" | "vocabulary" | "dictionary" | "translation" | "other";
type SortOption = "due-first" | "saved-recent" | "jlpt-asc" | "jlpt-desc" | "alpha";
type BusyAction = "save" | "remove" | "mastered" | null;

const VOCABULARY_FOLDER = "Vocabulary";

const jlptRank = (level?: string) => {
  switch ((level || "").toUpperCase()) {
    case "N5":
      return 1;
    case "N4":
      return 2;
    case "N3":
      return 3;
    case "N2":
      return 4;
    case "N1":
      return 5;
    default:
      return 99;
  }
};

const normalizeText = (value?: string) => (value || "").toLowerCase();

const resolveSourceKey = (folderName?: string): VocabularySourceFilter => {
  const normalized = folderName?.trim().toUpperCase();
  if (normalized === "DICTIONARY") {
    return "dictionary";
  }
  if (normalized === "TRANSLATION") {
    return "translation";
  }
  if (normalized === "VOCABULARY") {
    return "vocabulary";
  }
  if (normalized) {
    return "other";
  }
  return "all";
};

const getVocabularyLabel = (item: VocabularyItem) =>
  item.kanji || item.hiragana || item.romaji || item.meaning;

const Vocabulary = () => {
  const { toast } = useToast();

  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedWordType, setSelectedWordType] = useState<string>("all");
  const [savedFilter, setSavedFilter] = useState<SavedStateFilter>("all");
  const [reviewFilter, setReviewFilter] = useState<ReviewStateFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<VocabularySourceFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("due-first");
  const [searchQuery, setSearchQuery] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);

  const { data: vocabularyData = [], isLoading: isVocabularyLoading } = useVocabularyList();
  const { data: levelsData = [] } = useVocabularyLevels();
  const {
    data: savedWords = [],
    isLoading: isSavedWordsLoading,
    refetch: refetchSavedWords,
  } = useSavedWords();

  const vocabulary = vocabularyData as VocabularyItem[];
  const levels = levelsData as string[];

  const savedWordByVocabularyId = useMemo(() => {
    const next = new Map<number, SavedWord>();
    savedWords.forEach((word) => next.set(word.vocabularyId, word));
    return next;
  }, [savedWords]);

  const wordTypes = useMemo(() => {
    return vocabulary
      .map((item) => item.wordType?.trim())
      .filter((item): item is string => Boolean(item))
      .filter((value, index, all) => all.indexOf(value) === index)
      .sort((left, right) => left.localeCompare(right));
  }, [vocabulary]);

  const filteredVocabulary = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return [...vocabulary]
      .filter((item) => {
        const savedWord = savedWordByVocabularyId.get(item.id) ?? null;
        const sourceKey = savedWord ? resolveSourceKey(savedWord.folderName) : "all";

        const levelMatch = selectedLevel === "all" || item.jlptLevel === selectedLevel;
        const wordTypeMatch =
          selectedWordType === "all" ||
          normalizeText(item.wordType) === selectedWordType.toLowerCase();
        const savedMatch =
          savedFilter === "all" ||
          (savedFilter === "saved" && Boolean(savedWord)) ||
          (savedFilter === "unsaved" && !savedWord);
        const reviewMatch =
          reviewFilter === "all" ||
          (reviewFilter === "due" && Boolean(savedWord?.dueForReview)) ||
          (reviewFilter === "mastered" && Boolean(savedWord?.mastered));
        const sourceMatch =
          sourceFilter === "all" || (Boolean(savedWord) && sourceKey === sourceFilter);
        const searchMatch =
          !normalizedQuery ||
          [item.kanji, item.hiragana, item.romaji, item.meaning, item.wordType].some((value) =>
            normalizeText(value).includes(normalizedQuery)
          );

        return (
          levelMatch && wordTypeMatch && savedMatch && reviewMatch && sourceMatch && searchMatch
        );
      })
      .sort((left, right) => {
        const leftSavedWord = savedWordByVocabularyId.get(left.id) ?? null;
        const rightSavedWord = savedWordByVocabularyId.get(right.id) ?? null;
        const leftLabel = getVocabularyLabel(left);
        const rightLabel = getVocabularyLabel(right);

        switch (sortBy) {
          case "saved-recent": {
            if (Boolean(leftSavedWord) !== Boolean(rightSavedWord)) {
              return leftSavedWord ? -1 : 1;
            }

            const leftCreatedAt = leftSavedWord?.createdAt
              ? new Date(leftSavedWord.createdAt).getTime()
              : 0;
            const rightCreatedAt = rightSavedWord?.createdAt
              ? new Date(rightSavedWord.createdAt).getTime()
              : 0;
            if (leftCreatedAt !== rightCreatedAt) {
              return rightCreatedAt - leftCreatedAt;
            }
            return leftLabel.localeCompare(rightLabel);
          }
          case "jlpt-asc":
            return (
              jlptRank(left.jlptLevel) - jlptRank(right.jlptLevel) ||
              leftLabel.localeCompare(rightLabel)
            );
          case "jlpt-desc":
            return (
              jlptRank(right.jlptLevel) - jlptRank(left.jlptLevel) ||
              leftLabel.localeCompare(rightLabel)
            );
          case "alpha":
            return leftLabel.localeCompare(rightLabel);
          case "due-first":
          default: {
            if (Boolean(leftSavedWord?.dueForReview) !== Boolean(rightSavedWord?.dueForReview)) {
              return leftSavedWord?.dueForReview ? -1 : 1;
            }
            if (Boolean(leftSavedWord) !== Boolean(rightSavedWord)) {
              return leftSavedWord ? -1 : 1;
            }
            if (Boolean(leftSavedWord?.mastered) !== Boolean(rightSavedWord?.mastered)) {
              return leftSavedWord?.mastered ? 1 : -1;
            }
            return (
              jlptRank(left.jlptLevel) - jlptRank(right.jlptLevel) ||
              leftLabel.localeCompare(rightLabel)
            );
          }
        }
      });
  }, [
    reviewFilter,
    savedFilter,
    savedWordByVocabularyId,
    searchQuery,
    selectedLevel,
    selectedWordType,
    sortBy,
    sourceFilter,
    vocabulary,
  ]);

  const stats = useMemo(() => {
    const masteredCount = savedWords.filter((word) => word.mastered).length;
    const dueCount = savedWords.filter((word) => word.dueForReview).length;

    return {
      total: vocabulary.length,
      saved: savedWords.length,
      mastered: masteredCount,
      due: dueCount,
    };
  }, [savedWords, vocabulary.length]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.04 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  const handleSave = async (vocabularyId: number) => {
    try {
      setBusyId(vocabularyId);
      setBusyAction("save");
      await myWordsApi.saveWord({ vocabularyId, folderName: VOCABULARY_FOLDER });
      await refetchSavedWords();
      toast({
        title: "Đã lưu vào Sổ từ của tôi",
        description: "Từ này đã được thêm vào hàng đợi ôn tập của bạn.",
      });
    } catch {
      toast({
        title: "Không thể lưu từ",
        description: "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  };

  const handleRemove = async (savedWordId: number) => {
    try {
      setBusyId(savedWordId);
      setBusyAction("remove");
      await myWordsApi.removeWord(savedWordId);
      await refetchSavedWords();
      toast({
        title: "Đã xóa khỏi Sổ từ của tôi",
        description: "Từ này không còn trong sổ tay cá nhân của bạn.",
      });
    } catch {
      toast({
        title: "Không thể xóa từ",
        description: "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  };

  const handleToggleMastered = async (savedWordId: number) => {
    try {
      setBusyId(savedWordId);
      setBusyAction("mastered");
      await myWordsApi.toggleMastered(savedWordId);
      await refetchSavedWords();
      toast({
        title: "Đã cập nhật trạng thái học",
        description: "Trạng thái đã thuộc đã được đồng bộ với sổ tay của bạn.",
      });
    } catch {
      toast({
        title: "Không thể cập nhật trạng thái",
        description: "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  };

  const isLoading = isVocabularyLoading || isSavedWordsLoading;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1500px]">
        <PageHeader
          icon={<BookOpen className="h-5 w-5 text-sky-600" />}
          eyebrow="Từ vựng"
          title="Luồng học từ vựng"
          description="Tra cứu danh mục, lưu từ vào Sổ từ của tôi, và theo dõi trạng thái đã lưu, đến hạn và đã thuộc tại một nơi."
        />

        <StatStrip
          className="mb-4"
          items={[
            { label: "danh mục", value: stats.total },
            { label: "đã lưu", value: stats.saved },
            { label: "đã thuộc", value: stats.mastered },
            { label: "đến hạn", value: stats.due },
          ]}
        />

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tra cứu theo Kanji, Hiragana, Romaji, nghĩa hoặc loại từ..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 rounded-xl border-border bg-white/85 pl-10 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-sky-500" />
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="h-10 rounded-xl border-border bg-white/85 text-foreground">
                <SelectValue placeholder="Cấp độ JLPT" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả cấp độ</SelectItem>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={selectedWordType} onValueChange={setSelectedWordType}>
            <SelectTrigger className="h-10 rounded-xl border-border bg-white/85 text-foreground">
              <SelectValue placeholder="Loại từ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại từ</SelectItem>
              {wordTypes.map((wordType) => (
                <SelectItem key={wordType} value={wordType}>
                  {wordType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={savedFilter}
            onValueChange={(value) => setSavedFilter(value as SavedStateFilter)}
          >
            <SelectTrigger className="h-10 rounded-xl border-border bg-white/85 text-foreground">
              <SelectValue placeholder="Trạng thái lưu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="saved">Chỉ đã lưu</SelectItem>
              <SelectItem value="unsaved">Chỉ chưa lưu</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={reviewFilter}
            onValueChange={(value) => setReviewFilter(value as ReviewStateFilter)}
          >
            <SelectTrigger className="h-10 rounded-xl border-border bg-white/85 text-foreground">
              <SelectValue placeholder="Trạng thái ôn tập" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái ôn tập</SelectItem>
              <SelectItem value="due">Đến hạn ôn</SelectItem>
              <SelectItem value="mastered">Đã thuộc</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sourceFilter}
            onValueChange={(value) => setSourceFilter(value as VocabularySourceFilter)}
          >
            <SelectTrigger className="h-10 rounded-xl border-border bg-white/85 text-foreground">
              <SelectValue placeholder="Nguồn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nguồn</SelectItem>
              <SelectItem value="vocabulary">Từ vựng</SelectItem>
              <SelectItem value="dictionary">Từ điển</SelectItem>
              <SelectItem value="translation">Dịch thuật</SelectItem>
              <SelectItem value="other">Khác</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-4 w-4 text-violet-500" />
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="h-10 rounded-xl border-border bg-white/85 text-foreground">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due-first">Đến hạn trước</SelectItem>
                <SelectItem value="saved-recent">Lưu gần đây</SelectItem>
                <SelectItem value="jlpt-asc">JLPT N5 đến N1</SelectItem>
                <SelectItem value="jlpt-desc">JLPT N1 đến N5</SelectItem>
                <SelectItem value="alpha">Theo bảng chữ cái</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <PageSection>
            <div className="flex items-center justify-center py-16">
              <div className="relative h-12 w-12">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-sky-200"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-sky-500"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </PageSection>
        ) : filteredVocabulary.length === 0 ? (
          <PageSection>
            <EmptyState
              icon={<BookOpen className="h-6 w-6" />}
              title="Không tìm thấy từ vựng phù hợp"
              description="Thử điều chỉnh từ khóa tra cứu hoặc giảm bớt bộ lọc đang áp dụng."
            />
          </PageSection>
        ) : (
          <PageSection
            title={`Danh sách từ vựng (${filteredVocabulary.length})`}
            description="Các thẻ này phản ánh trạng thái từ đã lưu thực tế thay vì tiến độ tạm thời chỉ trong trang."
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredVocabulary.map((item) => {
                const savedWord = savedWordByVocabularyId.get(item.id) ?? null;

                return (
                  <motion.div key={item.id} variants={itemVariants}>
                    <VocabularyCard
                      item={item}
                      savedWord={savedWord}
                      onSave={(vocabularyId) => void handleSave(vocabularyId)}
                      onRemove={(savedWordId) => void handleRemove(savedWordId)}
                      onToggleMastered={(savedWordId) => void handleToggleMastered(savedWordId)}
                      isSaving={busyAction === "save" && busyId === item.id}
                      isRemoving={busyAction === "remove" && busyId === savedWord?.id}
                      isTogglingMastered={busyAction === "mastered" && busyId === savedWord?.id}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </PageSection>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Vocabulary;
