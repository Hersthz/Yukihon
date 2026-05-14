import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  BookmarkPlus,
  Brain,
  Check,
  ChevronRight,
  GitBranch,
  Lock,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { dictionaryApi, myWordsApi, storyModeApi, type DictionaryEntry } from "@/api";
import StoryInfoCard from "@/components/learning/StoryInfoCard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ToastAction } from "@/components/ui/toast";
import {
  buildHydratedStoryModeState,
  buildInitialPerformanceByStory,
  buildInitialUnlockedSegmentIds,
  buildStoryModeSnapshot,
  createDefaultStoryPerformance,
  dedupe,
  getSegmentById,
  storyDifficultyOrder,
  type StoryModeSnapshot,
  type StoryPerformanceState,
} from "@/features/story-mode/storyModeSnapshot";
import { useStoryModePersistence } from "@/hooks/learning/useStoryModePersistence";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { storyModeStories as fallbackStoryModeStories, type StoryCheckpointOption, type StoryDifficultyLevel, type StoryModeStory, type StorySegment } from "@/data/storyMode";

const difficultyLabelMap: Record<StoryDifficultyLevel, string> = {
  EASY: "Dễ",
  STANDARD: "Tiêu chuẩn",
  HARD: "Thử thách",
};

const difficultyToneMap: Record<StoryDifficultyLevel, string> = {
  EASY: "border-amber-200 bg-amber-50 text-amber-700",
  STANDARD: "border-sky-200 bg-sky-50 text-sky-700",
  HARD: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const normalizeSavedStatuses = (statuses: Record<string, boolean>) =>
  Object.fromEntries(Object.entries(statuses).map(([id, saved]) => [Number(id), saved])) as Record<number, boolean>;

const deriveDifficulty = (performance: StoryPerformanceState): StoryDifficultyLevel => {
  if (performance.answeredCount < 2) {
    return performance.currentDifficulty;
  }

  const accuracy = Math.round((performance.correctCount / performance.answeredCount) * 100);
  if (performance.answeredCount >= 3 && accuracy >= 85 && performance.streak >= 2) {
    return "HARD";
  }

  if (accuracy <= 55 || performance.incorrectStreak >= 2) {
    return "EASY";
  }

  return "STANDARD";
};

const updatePerformanceForQuiz = (performance: StoryPerformanceState, isCorrect: boolean): StoryPerformanceState => {
  const next = {
    ...performance,
    answeredCount: performance.answeredCount + 1,
    correctCount: performance.correctCount + (isCorrect ? 1 : 0),
    streak: isCorrect ? performance.streak + 1 : 0,
    incorrectStreak: isCorrect ? 0 : performance.incorrectStreak + 1,
  };

  return {
    ...next,
    currentDifficulty: deriveDifficulty(next),
  };
};

const applyDifficultyImpact = (difficulty: StoryDifficultyLevel, impact?: StoryCheckpointOption["difficultyImpact"]): StoryDifficultyLevel => {
  if (!impact || impact === "NEUTRAL") {
    return difficulty;
  }

  const currentIndex = storyDifficultyOrder.indexOf(difficulty);
  const delta = impact === "EASE_UP" ? 1 : -1;
  const nextIndex = Math.max(0, Math.min(storyDifficultyOrder.length - 1, currentIndex + delta));
  return storyDifficultyOrder[nextIndex];
};

const resolveCheckpointQuestion = (segment: StorySegment, difficulty: StoryDifficultyLevel) =>
  segment.checkpoint.questionByDifficulty?.[difficulty] ?? segment.checkpoint.question;

const resolveCheckpointExplanation = (segment: StorySegment, difficulty: StoryDifficultyLevel) =>
  segment.checkpoint.explanationByDifficulty?.[difficulty] ?? segment.checkpoint.explanation;

const resolveCheckpointOptions = (segment: StorySegment, difficulty: StoryDifficultyLevel): StoryCheckpointOption[] => {
  const configured = segment.checkpoint.optionsByDifficulty?.[difficulty];
  if (configured?.length) {
    return configured;
  }

  if (segment.checkpoint.mode === "branch") {
    return segment.checkpoint.options;
  }

  if (difficulty === "EASY" && segment.checkpoint.correctOptionId && segment.checkpoint.options.length > 2) {
    const correctOption = segment.checkpoint.options.find((option) => option.id === segment.checkpoint.correctOptionId);
    const firstDistractor = segment.checkpoint.options.find((option) => option.id !== segment.checkpoint.correctOptionId);

    if (correctOption && firstDistractor) {
      return [correctOption, firstDistractor];
    }
  }

  return segment.checkpoint.options;
};

const getStoryProgress = (story: StoryModeStory, unlockedSegmentIdsByStory: Record<string, string[]>) => {
  const unlockedCount = unlockedSegmentIdsByStory[story.id]?.length ?? 1;
  return Math.round((unlockedCount / story.segments.length) * 100);
};

const StoryMode = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState<StoryModeStory[]>(fallbackStoryModeStories);
  const [activeStoryId, setActiveStoryId] = useState(fallbackStoryModeStories[0]?.id ?? "");
  const [activeSegmentId, setActiveSegmentId] = useState(fallbackStoryModeStories[0]?.entrySegmentId ?? "");
  const [unlockedSegmentIdsByStory, setUnlockedSegmentIdsByStory] = useState<Record<string, string[]>>(() => buildInitialUnlockedSegmentIds(fallbackStoryModeStories));
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedSegments, setSubmittedSegments] = useState<Record<string, boolean>>({});
  const [performanceByStory, setPerformanceByStory] = useState<Record<string, StoryPerformanceState>>(() => buildInitialPerformanceByStory(fallbackStoryModeStories));
  const [revealedHardTranslation, setRevealedHardTranslation] = useState<Record<string, boolean>>({});
  const [segmentVocab, setSegmentVocab] = useState<DictionaryEntry[]>([]);
  const [segmentVocabLoading, setSegmentVocabLoading] = useState(false);
  const [savedStatuses, setSavedStatuses] = useState<Record<number, boolean>>({});
  const [savingWordId, setSavingWordId] = useState<number | null>(null);

  const progressStorageKey = useMemo(
    () => `yukihon_story_mode_progress_${user?.id ?? "guest"}`,
    [user?.id]
  );

  const activeStory = useMemo(
    () => stories.find((story) => story.id === activeStoryId) ?? stories[0],
    [activeStoryId, stories]
  );
  const activeSegment = useMemo(() => getSegmentById(activeStory, activeSegmentId), [activeSegmentId, activeStory]);
  const activePerformance = performanceByStory[activeStory?.id] ?? createDefaultStoryPerformance();
  const currentDifficulty = activePerformance.currentDifficulty;
  const unlockedSegmentIds = unlockedSegmentIdsByStory[activeStory?.id] ?? [activeStory?.entrySegmentId ?? ""];
  const activeSegmentKey = activeSegment?.id ?? "";
  const selectedAnswer = selectedAnswers[activeSegmentKey] ?? "";
  const checkpointQuestion = activeSegment ? resolveCheckpointQuestion(activeSegment, currentDifficulty) : "";
  const checkpointExplanation = activeSegment ? resolveCheckpointExplanation(activeSegment, currentDifficulty) : "";
  const checkpointOptions = activeSegment ? resolveCheckpointOptions(activeSegment, currentDifficulty) : [];
  const selectedOption = checkpointOptions.find((option) => option.id === selectedAnswer) ?? null;
  const isSubmitted = !!submittedSegments[activeSegmentKey];
  const isBranchMode = activeSegment?.checkpoint.mode === "branch";
  const isCorrect = isBranchMode ? true : selectedAnswer === activeSegment?.checkpoint.correctOptionId;
  const nextSegmentId = isBranchMode
    ? selectedOption?.nextSegmentIdByDifficulty?.[currentDifficulty] ?? selectedOption?.nextSegmentId
    : isCorrect
      ? activeSegment?.adaptiveRoutes?.onCorrectByDifficulty?.[currentDifficulty] ??
        activeSegment?.adaptiveRoutes?.onCorrectNextSegmentId ??
        activeSegment?.nextSegmentId
      : activeSegment?.adaptiveRoutes?.onWrongByDifficulty?.[currentDifficulty] ?? activeSegment?.adaptiveRoutes?.onWrongNextSegmentId;
  const canOpenNextSegment = !!nextSegmentId && unlockedSegmentIds.includes(nextSegmentId) && activeSegment?.id !== nextSegmentId;
  const storyProgress = activeStory ? getStoryProgress(activeStory, unlockedSegmentIdsByStory) : 0;
  const adaptiveAccuracy = activePerformance.answeredCount === 0 ? 0 : Math.round((activePerformance.correctCount / activePerformance.answeredCount) * 100);
  const hardTranslationShown = activeSegment ? !!revealedHardTranslation[activeSegment.id] : false;
  const isHardTranslationHidden = currentDifficulty === "HARD" && !hardTranslationShown;
  const adaptiveTranslation = activeSegment?.translationByDifficulty?.[currentDifficulty] ?? activeSegment?.translation ?? "";
  const completedStoryCount = stories.filter((story) => getStoryProgress(story, unlockedSegmentIdsByStory) >= 100).length;

  const adaptiveMetricHint =
    activePerformance.answeredCount === 0
      ? "Hoàn thành checkpoint để hệ thống tự chỉnh độ khó"
      : `${adaptiveAccuracy}% đúng • streak ${activePerformance.streak}`;
  const adaptiveMetricIcon =
    currentDifficulty === "HARD" ? (
      <TrendingUp className="h-4 w-4 text-emerald-500" />
    ) : currentDifficulty === "EASY" ? (
      <TrendingDown className="h-4 w-4 text-amber-500" />
    ) : (
      <Brain className="h-4 w-4 text-sky-500" />
    );

  const submissionMessage = useMemo(() => {
    if (!isSubmitted || !activeSegment) return "";
    if (isBranchMode) {
      return selectedOption?.response ?? activeSegment.checkpoint.explanation;
    }
    return checkpointExplanation;
  }, [activeSegment, checkpointExplanation, isBranchMode, isSubmitted, selectedOption]);

  const snapshotForPersistence = useMemo<StoryModeSnapshot>(() => buildStoryModeSnapshot({
    activeStoryId,
    activeSegmentId,
    unlockedSegmentIdsByStory,
    selectedAnswers,
    submittedSegments,
    performanceByStory,
  }), [activeSegmentId, activeStoryId, performanceByStory, selectedAnswers, submittedSegments, unlockedSegmentIdsByStory]);

  const loadSavedStatuses = useCallback(async (vocabularyIds: number[]) => {
    if (vocabularyIds.length === 0) {
      setSavedStatuses({});
      return;
    }

    try {
      const response = await myWordsApi.getSavedStatuses(vocabularyIds);
      setSavedStatuses(normalizeSavedStatuses(response));
    } catch {
      setSavedStatuses({});
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadStories = async () => {
      try {
        const remoteStories = await storyModeApi.getPublishedStories();
        if (cancelled || remoteStories.length === 0) {
          return;
        }

        setStories(remoteStories);
        setUnlockedSegmentIdsByStory((previous) => {
          const initial = buildInitialUnlockedSegmentIds(remoteStories);
          const remoteIds = new Set(remoteStories.map((story) => story.id));
          const restored = Object.fromEntries(Object.entries(previous).filter(([storyId]) => remoteIds.has(storyId)));
          return { ...initial, ...restored };
        });
        setPerformanceByStory((previous) => {
          const initial = buildInitialPerformanceByStory(remoteStories);
          const remoteIds = new Set(remoteStories.map((story) => story.id));
          const restored = Object.fromEntries(Object.entries(previous).filter(([storyId]) => remoteIds.has(storyId)));
          return { ...initial, ...restored };
        });
        setActiveStoryId((current) => remoteStories.some((story) => story.id === current) ? current : remoteStories[0].id);
        setActiveSegmentId((current) => {
          const currentStillExists = remoteStories.some((story) => story.segments.some((segment) => segment.id === current));
          return currentStillExists ? current : remoteStories[0].entrySegmentId;
        });
      } catch {
        // Keep bundled fallback stories when backend content has not been published yet.
      }
    };

    void loadStories();

    return () => {
      cancelled = true;
    };
  }, []);

  const applyHydratedSnapshot = useCallback((snapshot: Partial<StoryModeSnapshot> | null) => {
    const hydratedState = buildHydratedStoryModeState(snapshot, stories);
    setActiveStoryId(hydratedState.activeStoryId);
    setActiveSegmentId(hydratedState.activeSegmentId);
    setUnlockedSegmentIdsByStory(hydratedState.unlockedSegmentIdsByStory);
    setSelectedAnswers(hydratedState.selectedAnswers);
    setSubmittedSegments(hydratedState.submittedSegments);
    setPerformanceByStory(hydratedState.performanceByStory);
    setRevealedHardTranslation(hydratedState.revealedHardTranslation);
  }, [stories]);

  const { clearLocalSnapshot, hasHydratedProgress } = useStoryModePersistence({
    userId: user?.id,
    storageKey: progressStorageKey,
    snapshot: snapshotForPersistence,
    onHydrateSnapshot: applyHydratedSnapshot,
  });

  useEffect(() => {
    if (!activeStory || !activeSegment) return;

    let cancelled = false;

    const loadSegmentVocab = async (segment: StorySegment) => {
      setSegmentVocabLoading(true);
      try {
        const collected = new Map<number, DictionaryEntry>();

        for (const query of segment.vocabQueries) {
          const matches = await dictionaryApi.search(query);
          matches.forEach((item) => {
            if (!collected.has(item.id) && collected.size < 6) {
              collected.set(item.id, item);
            }
          });
        }

        if (cancelled) return;

        const nextVocab = Array.from(collected.values());
        setSegmentVocab(nextVocab);
        await loadSavedStatuses(nextVocab.map((item) => item.id));
      } catch {
        if (!cancelled) {
          setSegmentVocab([]);
          setSavedStatuses({});
        }
      } finally {
        if (!cancelled) {
          setSegmentVocabLoading(false);
        }
      }
    };

    void loadSegmentVocab(activeSegment);

    return () => {
      cancelled = true;
    };
  }, [activeSegment, activeStory, loadSavedStatuses]);

  const handleSelectStory = (storyId: string) => {
    const nextStory = stories.find((story) => story.id === storyId);
    if (!nextStory) return;

    const firstUnlockedSegmentId = unlockedSegmentIdsByStory[storyId]?.[0] ?? nextStory.entrySegmentId;
    setActiveStoryId(storyId);
    setActiveSegmentId(firstUnlockedSegmentId);
    setRevealedHardTranslation((prev) => ({ ...prev, [firstUnlockedSegmentId]: false }));
  };

  const handleResetProgress = () => {
    clearLocalSnapshot();
    applyHydratedSnapshot(null);
    toast({ title: "Đã reset Story Mode", description: "Tiến độ đọc truyện đã quay về từ đầu." });
  };

  const handleSubmitCheckpoint = () => {
    if (!activeStory || !activeSegment || !selectedAnswer || !selectedOption) {
      toast({ title: "Chọn đáp án trước", description: "Hãy chọn một đáp án để mở checkpoint của đoạn này." });
      return;
    }

    setSubmittedSegments((prev) => ({ ...prev, [activeSegment.id]: true }));

    if (isBranchMode) {
      const nextBranchSegmentId = selectedOption.nextSegmentIdByDifficulty?.[currentDifficulty] ?? selectedOption.nextSegmentId;
      const nextDifficulty = applyDifficultyImpact(currentDifficulty, selectedOption.difficultyImpact);

      if (nextBranchSegmentId) {
        setUnlockedSegmentIdsByStory((prev) => ({
          ...prev,
          [activeStory.id]: dedupe([...(prev[activeStory.id] ?? [activeStory.entrySegmentId]), nextBranchSegmentId]),
        }));
      }

      if (selectedOption.difficultyImpact && selectedOption.difficultyImpact !== "NEUTRAL") {
        setPerformanceByStory((prev) => {
          const current = prev[activeStory.id] ?? createDefaultStoryPerformance();
          return {
            ...prev,
            [activeStory.id]: {
              ...current,
              currentDifficulty: nextDifficulty,
            },
          };
        });
      }

      toast({
        title: "Đã mở một nhánh mới",
        description: `${selectedOption.response ?? "Bạn vừa mở một hướng đi khác của câu chuyện."} Mức độ hiện tại: ${difficultyLabelMap[nextDifficulty]}.`,
      });
      return;
    }

    const currentPerformance = performanceByStory[activeStory.id] ?? createDefaultStoryPerformance();
    const nextPerformance = updatePerformanceForQuiz(currentPerformance, isCorrect);
    const hasDifficultyChanged = nextPerformance.currentDifficulty !== currentPerformance.currentDifficulty;
    setPerformanceByStory((prev) => ({ ...prev, [activeStory.id]: nextPerformance }));

    const resolvedNextSegmentId = isCorrect
      ? activeSegment.adaptiveRoutes?.onCorrectByDifficulty?.[nextPerformance.currentDifficulty] ??
        activeSegment.adaptiveRoutes?.onCorrectNextSegmentId ??
        activeSegment.nextSegmentId
      : activeSegment.adaptiveRoutes?.onWrongByDifficulty?.[nextPerformance.currentDifficulty] ?? activeSegment.adaptiveRoutes?.onWrongNextSegmentId;

    if (resolvedNextSegmentId) {
      setUnlockedSegmentIdsByStory((prev) => ({
        ...prev,
        [activeStory.id]: dedupe([...(prev[activeStory.id] ?? [activeStory.entrySegmentId]), resolvedNextSegmentId]),
      }));
    }

    if (!isCorrect && !resolvedNextSegmentId) {
      toast({ title: "Chưa đúng rồi", description: "Đọc lại đoạn ngắn và thử chọn lại đáp án phù hợp hơn." });
      return;
    }

    if (!isCorrect && resolvedNextSegmentId) {
      toast({
        title: "Mở nhánh ôn tập",
        description: `Bạn vừa mở một đoạn review để lấy lại nhịp. Mức độ hiện tại: ${difficultyLabelMap[nextPerformance.currentDifficulty]}.`,
      });
      return;
    }

    toast({
      title: "Đã mở đoạn kế tiếp",
      description: hasDifficultyChanged
        ? `Bạn đang học rất tốt, hệ thống đã chuyển sang mức ${difficultyLabelMap[nextPerformance.currentDifficulty]}.`
        : "Bạn có thể tiếp tục câu chuyện hoặc ở lại ôn vocab của đoạn này.",
    });
  };

  const handleOpenNextSegment = () => {
    if (!nextSegmentId || !unlockedSegmentIds.includes(nextSegmentId)) return;
    setActiveSegmentId(nextSegmentId);
    setRevealedHardTranslation((prev) => ({ ...prev, [nextSegmentId]: false }));
  };

  const handleSaveWord = async (word: DictionaryEntry) => {
    if (!activeStory || !activeSegment) return;

    if (savedStatuses[word.id]) {
      toast({ title: "Đã có trong My Words", description: `${word.kanji || word.hiragana} đã được lưu từ trước rồi.` });
      return;
    }

    try {
      setSavingWordId(word.id);
      await myWordsApi.saveWord({
        vocabularyId: word.id,
        folderName: "Story Mode",
        personalNote: `Story: ${activeStory.title} / ${activeSegment.title}`,
      });
      setSavedStatuses((prev) => ({ ...prev, [word.id]: true }));
      toast({
        title: "Đã lưu vocab",
        description: `${word.kanji || word.hiragana} đã được thêm vào My Words.`,
        action: (
          <ToastAction altText="Mở My Words" onClick={() => navigate("/my-words")}>
            Mở My Words
          </ToastAction>
        ),
      });
    } catch {
      toast({ title: "Không lưu được vocab", description: "Vui lòng thử lại.", variant: "destructive" });
    } finally {
      setSavingWordId(null);
    }
  };

  if (!activeStory || !activeSegment) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-[1200px]">
          <EmptyState icon={<BookOpen className="h-6 w-6" />} title="Story Mode chưa sẵn sàng" description="Hiện chưa có truyện nào để mở." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1480px]">
        <PageHeader
          icon={<GitBranch className="h-6 w-6 text-rose-600" />}
          eyebrow="Branching Story"
          title="Học qua truyện có rẽ nhánh"
          description="Đọc truyện ngắn, trả lời checkpoint, mở nhánh mới và lưu vocab vào My Words trong cùng một luồng học."
          action={
            <>
              <Button className="rounded-2xl border-border bg-card text-foreground/80 hover:bg-card" variant="outline" onClick={handleResetProgress}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Học lại từ đầu
              </Button>
              <Button asChild className="rounded-2xl border-border bg-card text-foreground/80 hover:bg-card" variant="outline">
                <Link to="/dictionary">
                  <BookmarkPlus className="mr-2 h-4 w-4" />
                  Mở Dictionary
                </Link>
              </Button>
            </>
          }
        />

        <div className="mb-4 grid gap-3 md:grid-cols-5">
          <MetricCard label="Truyện hiện tại" value={activeStory.title} icon={<BookOpen className="h-4 w-4 text-rose-500" />} hint={activeStory.subtitle} />
          <MetricCard label="Tiến độ" value={`${storyProgress}%`} icon={<Sparkles className="h-4 w-4 text-emerald-500" />} hint={`${unlockedSegmentIds.length}/${activeStory.segments.length} đoạn đã mở`} />
          <MetricCard label="JLPT" value={activeStory.jlptLevel} icon={<Brain className="h-4 w-4 text-sky-500" />} hint={`Khoảng ${activeStory.estimatedMinutes} phút`} />
          <MetricCard label="Adaptive" value={difficultyLabelMap[currentDifficulty]} icon={adaptiveMetricIcon} hint={adaptiveMetricHint} />
          <MetricCard label="Tổng quan" value={`${completedStoryCount}/${stories.length}`} icon={<GitBranch className="h-4 w-4 text-amber-500" />} hint={hasHydratedProgress ? "Đã sẵn sàng lưu tiến độ" : "Đang tải tiến độ"} />
        </div>

        <PageSection className="mb-4" title="Chọn truyện" description="Mỗi truyện có tiến độ, nhánh và checkpoint riêng. Bạn có thể quay lại nhánh đã mở bất cứ lúc nào.">
          <div className="grid gap-3 lg:grid-cols-2">
            {stories.map((story) => {
              const progress = getStoryProgress(story, unlockedSegmentIdsByStory);
              const isActive = story.id === activeStory.id;

              return (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => handleSelectStory(story.id)}
                  className={`rounded-[24px] border p-4 text-left transition ${
                    isActive ? "border-rose-200 bg-rose-50/70" : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{story.coverLabel}</p>
                      <h3 className="mt-2 text-xl font-semibold text-foreground">{story.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{story.subtitle}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className="rounded-full border border-rose-200 bg-white text-rose-700">{story.jlptLevel}</Badge>
                      {story.segments.some((segment) => segment.checkpoint.mode === "branch") ? (
                        <Badge className="rounded-full border border-violet-200 bg-violet-50 text-violet-700">Branching</Badge>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground/80">{story.description}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <Progress className="h-2 bg-rose-100" value={progress} />
                    <span className="min-w-12 text-right text-sm font-semibold text-rose-600">{progress}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </PageSection>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <PageSection title={activeStory.title} description={activeStory.description}>
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tiến độ truyện</span>
                  <span className="font-medium text-rose-600">{storyProgress}%</span>
                </div>
                <Progress className="h-3 bg-rose-100" value={storyProgress} />
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {activeStory.segments.map((segment) => {
                  const locked = !unlockedSegmentIds.includes(segment.id);
                  const active = segment.id === activeSegment.id;

                  return (
                    <Button
                      key={segment.id}
                      className={active ? "rounded-2xl bg-rose-500 text-white hover:bg-rose-400" : "rounded-2xl border-border bg-card text-foreground/80 hover:bg-card"}
                      disabled={locked}
                      onClick={() => {
                        setActiveSegmentId(segment.id);
                        setRevealedHardTranslation((prev) => ({ ...prev, [segment.id]: false }));
                      }}
                      variant={active ? "default" : "outline"}
                    >
                      {locked ? <Lock className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                      {segment.title}
                    </Button>
                  );
                })}
              </div>

              <div className="rounded-[28px] border border-border bg-card p-5">
                <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-rose-500">{activeSegment.sceneHint}</p>
                    <h3 className="mt-2 text-xl font-semibold text-foreground">{activeSegment.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="rounded-full border border-rose-200 bg-rose-50 text-rose-700">{activeStory.jlptLevel}</Badge>
                    {isBranchMode ? <Badge className="rounded-full border border-violet-200 bg-violet-50 text-violet-700">Choice point</Badge> : null}
                    <Badge className={`rounded-full border ${difficultyToneMap[currentDifficulty]}`}>Adaptive {difficultyLabelMap[currentDifficulty]}</Badge>
                  </div>
                </div>

                <div className="rounded-[22px] bg-rose-50/70 p-5">
                  <p className="text-2xl leading-10 text-foreground">{activeSegment.japaneseText}</p>
                  {isHardTranslationHidden ? (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-700">
                      <p>Hard mode đang bật. Thử tự đọc hiểu trước khi mở bản dịch.</p>
                      <Button
                        className="mt-3 rounded-xl border-amber-200 bg-white text-amber-800 hover:bg-amber-100"
                        onClick={() => setRevealedHardTranslation((prev) => ({ ...prev, [activeSegment.id]: true }))}
                        variant="outline"
                      >
                        Mở gợi ý bản dịch
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">{adaptiveTranslation}</p>
                  )}
                </div>
              </div>
            </PageSection>

            <PageSection
              title={isBranchMode ? "Lựa chọn của đoạn" : "Checkpoint của đoạn"}
              description={
                isBranchMode
                  ? "Ở đoạn này, lựa chọn của bạn sẽ mở một nhánh nội dung khác."
                  : `Độ khó hiện tại: ${difficultyLabelMap[currentDifficulty]}. Hệ thống tự nâng hoặc hạ nhịp theo kết quả của bạn.`
              }
            >
              <div className="rounded-[24px] border border-border bg-card p-4">
                <p className="text-base font-semibold text-foreground">{checkpointQuestion}</p>
                <div className="mt-4 grid gap-2">
                  {checkpointOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setSelectedAnswers((prev) => ({ ...prev, [activeSegmentKey]: option.id }));
                        setSubmittedSegments((prev) => ({ ...prev, [activeSegmentKey]: false }));
                      }}
                      className={`rounded-[18px] border px-4 py-3 text-left transition ${
                        selectedAnswer === option.id ? "border-rose-300 bg-rose-50 text-rose-700" : "border-border bg-background text-foreground hover:bg-muted/40"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button className="rounded-2xl bg-rose-500 text-white hover:bg-rose-400" onClick={handleSubmitCheckpoint}>
                    {isBranchMode ? "Chốt lựa chọn" : "Kiểm tra"}
                  </Button>
                  {isSubmitted && canOpenNextSegment ? (
                    <Button className="rounded-2xl bg-emerald-500 text-white hover:bg-emerald-400" onClick={handleOpenNextSegment}>
                      {isBranchMode ? "Đi theo nhánh này" : "Mở đoạn tiếp"}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : null}
                </div>

                {isSubmitted ? (
                  <div className={`mt-4 rounded-[20px] border px-4 py-4 ${
                    isBranchMode ? "border-violet-200 bg-violet-50/80" : isCorrect ? "border-emerald-200 bg-emerald-50/80" : "border-amber-200 bg-amber-50/80"
                  }`}>
                    <p className={`text-sm font-semibold ${
                      isBranchMode ? "text-violet-700" : isCorrect ? "text-emerald-700" : "text-amber-800"
                    }`}>
                      {isBranchMode ? "Nhánh đã mở" : isCorrect ? "Đúng rồi" : "Chưa đúng"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-foreground/80">{submissionMessage}</p>
                  </div>
                ) : null}
              </div>
            </PageSection>
          </div>

          <div className="space-y-4">
            <PageSection title="Adaptive coach" description="Độ khó và lộ trình nhánh tự cân chỉnh theo checkpoint.">
              <div className="space-y-3">
                <StoryInfoCard>
                  <p className="font-semibold text-foreground">Mức hiện tại: {difficultyLabelMap[currentDifficulty]}</p>
                  <p className="mt-1 text-muted-foreground">
                    {activePerformance.answeredCount === 0
                      ? "Bạn chưa có dữ liệu checkpoint. Hoàn thành 2-3 checkpoint để bắt đầu cân chỉnh độ khó."
                      : `Đúng ${activePerformance.correctCount}/${activePerformance.answeredCount} checkpoint (${adaptiveAccuracy}%).`}
                  </p>
                </StoryInfoCard>
                <StoryInfoCard>
                  {currentDifficulty === "HARD"
                    ? "Bạn đang vào nhịp tốt. Hệ thống ưu tiên câu hỏi phân tích và nhánh challenge."
                    : currentDifficulty === "EASY"
                      ? "Hệ thống đang hạ nhịp để bạn củng cố nền tảng. Qua checkpoint ôn tập để quay lại nhóm câu hỏi nâng hơn."
                      : "Bạn đang ở mức tiêu chuẩn. Duy trì streak để mở nhánh challenge trong truyện."}
                </StoryInfoCard>
              </div>
            </PageSection>

            <PageSection title="Vocab mở khóa" description="Lưu thẳng vào My Words nếu gặp từ muốn giữ lại.">
              {segmentVocabLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-100 border-t-rose-500" />
                </div>
              ) : segmentVocab.length === 0 ? (
                <EmptyState icon={<BookmarkPlus className="h-6 w-6" />} title="Chưa tìm thấy vocab" description="Bạn vẫn có thể mở Dictionary để tra cứu thêm cho đoạn này." />
              ) : (
                <div className="space-y-3">
                  {segmentVocab.map((word) => {
                    const isSaved = !!savedStatuses[word.id];
                    const isSaving = savingWordId === word.id;

                    return (
                      <div key={word.id} className="rounded-[20px] border border-border bg-card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold text-foreground">{word.kanji || word.hiragana}</p>
                            <p className="mt-1 text-sm text-sky-700">
                              {word.hiragana} • {word.romaji}
                            </p>
                          </div>
                          {word.jlptLevel ? <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">{word.jlptLevel}</Badge> : null}
                        </div>

                        <p className="mt-3 text-sm text-muted-foreground">{word.meaning}</p>

                        <Button
                          className="mt-4 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:bg-emerald-50 disabled:text-emerald-700"
                          onClick={() => void handleSaveWord(word)}
                          variant="ghost"
                          disabled={isSaved || isSaving}
                        >
                          {isSaved ? <Check className="mr-2 h-4 w-4" /> : <BookmarkPlus className="mr-2 h-4 w-4" />}
                          {isSaved ? "Đã lưu" : isSaving ? "Đang lưu..." : "Lưu vào My Words"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </PageSection>

            <PageSection title="Grammar của đoạn" description="Mỗi nhánh có thể dạy một cụm grammar khác nhau trước khi hội tụ lại.">
              <div className="space-y-3">
                {activeSegment.grammar.map((item) => (
                  <div key={item.pattern} className="rounded-[20px] border border-border bg-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-foreground">{item.pattern}</p>
                        <p className="mt-1 text-sm text-rose-600">{item.title}</p>
                      </div>
                      <Badge className="rounded-full border border-rose-200 bg-rose-50 text-rose-700">{activeStory.jlptLevel}</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.explanation}</p>
                  </div>
                ))}
              </div>
            </PageSection>

            <PageSection title="Bước tiếp theo" description="Thử học lại từ đầu để mở toàn bộ nhánh của câu chuyện.">
              <div className="space-y-3">
                <StoryInfoCard>
                  {isBranchMode
                    ? "Chọn một hướng đi cho nhân vật và xem vocab/grammar của nhánh đó thay đổi như thế nào."
                    : "Hoàn thành checkpoint để mở khóa đoạn tiếp theo của nhánh hiện tại."}
                </StoryInfoCard>
                <StoryInfoCard>
                  {currentDifficulty === "HARD"
                    ? "Thử đóng bản dịch và lưu 1-2 vocab mới sau mỗi đoạn để giữ độ khó chất lượng cao."
                    : "Lưu 1-2 vocab quan trọng vào My Words để biến câu chuyện thành một phiên học thật sự."}
                </StoryInfoCard>
                <Button asChild className="w-full rounded-2xl bg-sky-500 text-white hover:bg-sky-400">
                  <Link to="/quiz">
                    Qua Quiz tổng hợp
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </PageSection>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StoryMode;
