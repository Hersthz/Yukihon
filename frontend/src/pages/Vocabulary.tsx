import { useMemo, useState } from "react";
import { motion, Variants } from "framer-motion";
import {
  ArrowUpDown,
  BookOpen,
  BookmarkCheck,
  Clock3,
  Filter,
  GraduationCap,
  Search,
} from "lucide-react";

import { myWordsApi } from "@/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import VocabularyCard from "@/components/learning/VocabularyCard";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
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
        title: "Saved to My Words",
        description: "The word is now tracked in your review queue.",
      });
    } catch {
      toast({
        title: "Could not save word",
        description: "Please try again.",
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
        title: "Removed from My Words",
        description: "The word is no longer in your personal notebook.",
      });
    } catch {
      toast({
        title: "Could not remove word",
        description: "Please try again.",
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
        title: "Learning status updated",
        description: "Mastered state has been synced with your notebook.",
      });
    } catch {
      toast({
        title: "Could not update status",
        description: "Please try again.",
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
          eyebrow="Vocabulary"
          title="Vocabulary Flow"
          description="Search the catalog, save words into My Words, and track saved, due, and mastered states from one place."
        />

        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Catalog"
            value={stats.total}
            icon={<BookOpen className="h-4 w-4 text-sky-500" />}
            hint="All words in the current vocabulary list"
          />
          <MetricCard
            label="Saved"
            value={stats.saved}
            icon={<BookmarkCheck className="h-4 w-4 text-violet-500" />}
            hint="Words already moved into My Words"
          />
          <MetricCard
            label="Mastered"
            value={stats.mastered}
            icon={<GraduationCap className="h-4 w-4 text-emerald-500" />}
            hint="Saved words currently marked as mastered"
          />
          <MetricCard
            label="Due review"
            value={stats.due}
            icon={<Clock3 className="h-4 w-4 text-rose-500" />}
            hint="Saved words that need review now"
          />
        </div>

        <PageSection
          className="mb-4"
          title="Filters"
          description="Use deeper filters to move from a simple list into a study workflow."
        >
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by kanji, hiragana, romaji, meaning, or word type..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-10 rounded-2xl border-border bg-white/85 pl-10 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-sky-500" />
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="rounded-2xl border-border bg-white/85 text-foreground">
                    <SelectValue placeholder="JLPT level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Select value={selectedWordType} onValueChange={setSelectedWordType}>
                <SelectTrigger className="rounded-2xl border-border bg-white/85 text-foreground">
                  <SelectValue placeholder="Word type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All word types</SelectItem>
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
                <SelectTrigger className="rounded-2xl border-border bg-white/85 text-foreground">
                  <SelectValue placeholder="Saved state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  <SelectItem value="saved">Saved only</SelectItem>
                  <SelectItem value="unsaved">Unsaved only</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={reviewFilter}
                onValueChange={(value) => setReviewFilter(value as ReviewStateFilter)}
              >
                <SelectTrigger className="rounded-2xl border-border bg-white/85 text-foreground">
                  <SelectValue placeholder="Review state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All review states</SelectItem>
                  <SelectItem value="due">Due review</SelectItem>
                  <SelectItem value="mastered">Mastered</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sourceFilter}
                onValueChange={(value) => setSourceFilter(value as VocabularySourceFilter)}
              >
                <SelectTrigger className="rounded-2xl border-border bg-white/85 text-foreground">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  <SelectItem value="vocabulary">Vocabulary</SelectItem>
                  <SelectItem value="dictionary">Dictionary</SelectItem>
                  <SelectItem value="translation">Translation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-violet-500" />
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="rounded-2xl border-border bg-white/85 text-foreground">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="due-first">Due first</SelectItem>
                    <SelectItem value="saved-recent">Recently saved</SelectItem>
                    <SelectItem value="jlpt-asc">JLPT N5 to N1</SelectItem>
                    <SelectItem value="jlpt-desc">JLPT N1 to N5</SelectItem>
                    <SelectItem value="alpha">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </PageSection>

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
              title="No matching vocabulary"
              description="Try adjusting your search terms or reducing the active filters."
            />
          </PageSection>
        ) : (
          <PageSection
            title={`Vocabulary List (${filteredVocabulary.length})`}
            description="These cards now reflect real saved-word state instead of temporary page-only progress."
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
