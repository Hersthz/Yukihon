import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, BookmarkPlus, Brain, Check, ChevronRight, GitBranch, Lock, RotateCcw, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { dictionaryApi, myWordsApi, type DictionaryEntry } from "@/api";
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
import { useAuth } from "@/hooks/use-auth";
import { useStoryModePersistence } from "@/hooks/learning/useStoryModePersistence";
import { useToast } from "@/hooks/use-toast";
import { storyModeStories, type StoryCheckpointOption, type StoryDifficultyLevel, type StorySegment } from "@/data/storyMode";

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

const difficultyLabelMap: Record<StoryDifficultyLevel, string> = {
  EASY: "De",
  STANDARD: "Tieu chuan",
  HARD: "Thu thach",
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

const StoryMode = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStoryId, setActiveStoryId] = useState(storyModeStories[0]?.id ?? "");
  const [activeSegmentId, setActiveSegmentId] = useState(storyModeStories[0]?.entrySegmentId ?? "");
  const [unlockedSegmentIdsByStory, setUnlockedSegmentIdsByStory] = useState<Record<string, string[]>>(buildInitialUnlockedSegmentIds);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedSegments, setSubmittedSegments] = useState<Record<string, boolean>>({});
  const [performanceByStory, setPerformanceByStory] = useState<Record<string, StoryPerformanceState>>(buildInitialPerformanceByStory);
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
    () => storyModeStories.find((story) => story.id === activeStoryId) ?? storyModeStories[0],
    [activeStoryId]
  );
  const activeSegment = useMemo(() => getSegmentById(activeStory, activeSegmentId), [activeSegmentId, activeStory]);
  const activePerformance = performanceByStory[activeStory.id] ?? createDefaultStoryPerformance();
  const currentDifficulty = activePerformance.currentDifficulty;
  const checkpointQuestion = resolveCheckpointQuestion(activeSegment, currentDifficulty);
  const checkpointExplanation = resolveCheckpointExplanation(activeSegment, currentDifficulty);
  const checkpointOptions = resolveCheckpointOptions(activeSegment, currentDifficulty);
  const unlockedSegmentIds = unlockedSegmentIdsByStory[activeStory.id] ?? [activeStory.entrySegmentId];
  const activeSegmentKey = activeSegment?.id ?? "";
  const selectedAnswer = selectedAnswers[activeSegmentKey] ?? "";
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
  const canOpenNextSegment = !!nextSegmentId && unlockedSegmentIds.includes(nextSegmentId) && activeSegment.id !== nextSegmentId;
  const storyProgress = Math.round((unlockedSegmentIds.length / activeStory.segments.length) * 100);
  const adaptiveAccuracy = activePerformance.answeredCount === 0 ? 0 : Math.round((activePerformance.correctCount / activePerformance.answeredCount) * 100);
  const hardTranslationShown = !!revealedHardTranslation[activeSegment.id];
  const isHardTranslationHidden = currentDifficulty === "HARD" && !hardTranslationShown;
  const adaptiveTranslation = activeSegment.translationByDifficulty?.[currentDifficulty] ?? activeSegment.translation;
  const adaptiveMetricHint =
    activePerformance.answeredCount === 0
      ? "Bat dau checkpoint de he thong canh chinh do kho"
      : `${adaptiveAccuracy}% dung · streak ${activePerformance.streak}`;
  const adaptiveMetricIcon =
    currentDifficulty === "HARD" ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : currentDifficulty === "EASY" ? <TrendingDown className="h-4 w-4 text-amber-500" /> : <Brain className="h-4 w-4 text-sky-500" />;

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

  const loadSavedStatuses = async (vocabularyIds: number[]) => {
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
  };

  const applyHydratedSnapshot = useCallback((snapshot: Partial<StoryModeSnapshot> | null) => {
    const hydratedState = buildHydratedStoryModeState(snapshot, storyModeStories);
    setActiveStoryId(hydratedState.activeStoryId);
    setActiveSegmentId(hydratedState.activeSegmentId);
    setUnlockedSegmentIdsByStory(hydratedState.unlockedSegmentIdsByStory);
    setSelectedAnswers(hydratedState.selectedAnswers);
    setSubmittedSegments(hydratedState.submittedSegments);
    setPerformanceByStory(hydratedState.performanceByStory);
    setRevealedHardTranslation(hydratedState.revealedHardTranslation);
  }, []);

  const { clearLocalSnapshot } = useStoryModePersistence({
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
  }, [activeSegment, activeStory]);

  const handleSelectStory = (storyId: string) => {
    const nextStory = storyModeStories.find((story) => story.id === storyId);
    if (!nextStory) return;

    const firstUnlockedSegmentId = unlockedSegmentIdsByStory[storyId]?.[0] ?? nextStory.entrySegmentId;
    setActiveStoryId(storyId);
    setActiveSegmentId(firstUnlockedSegmentId);
    setRevealedHardTranslation((prev) => ({ ...prev, [firstUnlockedSegmentId]: false }));
  };

  const handleResetProgress = () => {
    clearLocalSnapshot();
    applyHydratedSnapshot(null);
    toast({ title: "Đã reset Story Mode", description: "Tiến độ đọc truyện trên máy này đã quay về từ đầu." });
  };

  const handleSubmitCheckpoint = () => {
    if (!activeSegment || !selectedAnswer || !selectedOption) {
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
        description: `${selectedOption.response ?? "Bạn vừa mở một hướng đi khác của câu chuyện."} Muc do hien tai: ${difficultyLabelMap[nextDifficulty]}.`,
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
        title: "Mo nhanh on tap",
        description: `Ban vua mo mot doan review de lay lai nhip. Muc do hien tai: ${difficultyLabelMap[nextPerformance.currentDifficulty]}.`,
      });
      return;
    }

    toast({
      title: "Đã mở đoạn kế tiếp",
      description: hasDifficultyChanged
        ? `Ban dang hoc rat tot, he thong da chuyen sang muc ${difficultyLabelMap[nextPerformance.currentDifficulty]}.`
        : "Bạn có thể tiếp tục câu chuyện hoặc ở lại ôn vocab của đoạn này.",
    });
  };

  const handleOpenNextSegment = () => {
    if (!nextSegmentId || !unlockedSegmentIds.includes(nextSegmentId)) return;
    setActiveSegmentId(nextSegmentId);
    setRevealedHardTranslation((prev) => ({ ...prev, [nextSegmentId]: false }));
  };

  const handleSaveWord = async (word: DictionaryEntry) => {
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
          title="Hoc theo truyện có rẽ nhánh"
          description="Bạn không chỉ đọc và trả lời đúng sai nữa. Ở một số đoạn, chính lựa chọn của bạn sẽ mở ra vocab và grammar khác nhau."
          action={
            <>
              <Button className="rounded-2xl border-border bg-card text-foreground/80 hover:bg-card" variant="outline" onClick={handleResetProgress}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Hoc lai tu dau
              </Button>
              <Link to="/dictionary">
                <Button className="rounded-2xl border-border bg-card text-foreground/80 hover:bg-card" variant="outline">
                  <BookmarkPlus className="mr-2 h-4 w-4" />
                  Mo Dictionary
                </Button>
              </Link>
            </>
          }
        />

        <div className="mb-4 grid gap-3 md:grid-cols-5">
          <MetricCard label="Truyen hien tai" value={activeStory.title} icon={<BookOpen className="h-4 w-4 text-rose-500" />} hint={activeStory.subtitle} />
          <MetricCard label="Tien do" value={`${storyProgress}%`} icon={<Sparkles className="h-4 w-4 text-emerald-500" />} hint={`${unlockedSegmentIds.length}/${activeStory.segments.length} doan da mo`} />
          <MetricCard label="JLPT" value={activeStory.jlptLevel} icon={<Brain className="h-4 w-4 text-sky-500" />} hint={`Khoang ${activeStory.estimatedMinutes} phut`} />
          <MetricCard label="Adaptive" value={difficultyLabelMap[currentDifficulty]} icon={adaptiveMetricIcon} hint={adaptiveMetricHint} />
          <MetricCard label="Tone" value={activeStory.tone} icon={<GitBranch className="h-4 w-4 text-amber-500" />} hint={activeStory.description} />
        </div>

        <PageSection className="mb-4" title="Chon truyen" description="Truyen branching se cho ban mot trai nghiem hoc khac nhau tuy theo huong ban dan nhan vat di qua.">
          <div className="grid gap-3 lg:grid-cols-2">
            {storyModeStories.map((story) => (
              <button
                key={story.id}
                type="button"
                onClick={() => handleSelectStory(story.id)}
                className={`rounded-[24px] border p-4 text-left transition ${
                  story.id === activeStory.id ? "border-rose-200 bg-rose-50/70" : "border-border bg-card hover:bg-muted/40"
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
                <p className="mt-3 text-sm text-foreground/80">{story.description}</p>
              </button>
            ))}
          </div>
        </PageSection>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <PageSection title={activeStory.title} description={activeStory.description}>
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tien do truyen</span>
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
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-rose-500">{activeSegment.sceneHint}</p>
                    <h3 className="mt-2 text-xl font-semibold text-foreground">{activeSegment.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="rounded-full border border-rose-200 bg-rose-50 text-rose-700">{activeStory.jlptLevel}</Badge>
                    {isBranchMode ? <Badge className="rounded-full border border-violet-200 bg-violet-50 text-violet-700">Choice point</Badge> : null}
                    <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">Adaptive {difficultyLabelMap[currentDifficulty]}</Badge>
                  </div>
                </div>

                <div className="rounded-[22px] bg-rose-50/70 p-5">
                  <p className="text-2xl leading-10 text-foreground">{activeSegment.japaneseText}</p>
                  {isHardTranslationHidden ? (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-700">
                      <p>Hard mode dang bat. Thu tu doc hieu truoc khi mo ban dich.</p>
                      <Button
                        className="mt-3 rounded-xl border-amber-200 bg-white text-amber-800 hover:bg-amber-100"
                        onClick={() => setRevealedHardTranslation((prev) => ({ ...prev, [activeSegment.id]: true }))}
                        variant="outline"
                      >
                        Mo goi y ban dich
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">{adaptiveTranslation}</p>
                  )}
                </div>
              </div>
            </PageSection>

            <PageSection
              title={isBranchMode ? "Lua chon cua doan" : "Checkpoint cua doan"}
              description={
                isBranchMode
                  ? "Ở đoạn này, chính lựa chọn của bạn sẽ mở ra một nhánh nội dung khác."
                  : `Do kho hien tai: ${difficultyLabelMap[currentDifficulty]}. He thong se tu dong nang ha do kho theo ket qua cua ban.`
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
                    {isBranchMode ? "Chot lua chon" : "Kiem tra"}
                  </Button>
                  {isSubmitted && canOpenNextSegment ? (
                    <Button className="rounded-2xl bg-emerald-500 text-white hover:bg-emerald-400" onClick={handleOpenNextSegment}>
                      {isBranchMode ? "Di theo nhanh nay" : "Mo doan tiep"}
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
                      {isBranchMode ? "Nhanh da mo" : isCorrect ? "Dung roi" : "Chua dung"}
                    </p>
                    <p className="mt-1 text-sm text-foreground/80">{submissionMessage}</p>
                  </div>
                ) : null}
              </div>
            </PageSection>
          </div>

          <div className="space-y-4">
            <PageSection title="Adaptive coach" description="Do kho va lo trinh nhanh tu canh chinh theo ket qua checkpoint cua ban.">
              <div className="space-y-3">
                <StoryInfoCard>
                  <p className="font-semibold text-foreground">Muc hien tai: {difficultyLabelMap[currentDifficulty]}</p>
                  <p className="mt-1 text-muted-foreground">
                    {activePerformance.answeredCount === 0
                      ? "Ban chua co du lieu checkpoint. Hoan thanh 2-3 checkpoint de bat dau canh chinh do kho."
                      : `Dung ${activePerformance.correctCount}/${activePerformance.answeredCount} checkpoint (${adaptiveAccuracy}%).`}
                  </p>
                </StoryInfoCard>
                <StoryInfoCard>
                  {currentDifficulty === "HARD"
                    ? "Ban dang vao nhip tot. He thong uu tien cau hoi phan tich va nhanh challenge."
                    : currentDifficulty === "EASY"
                      ? "He thong dang ha nhip de ban cung co nen tang vung. Qua checkpoint on tap de quay lai nhom cau hoi nang hon."
                      : "Ban dang o muc tieu chuan. Duy tri streak de mo nhanh challenge trong truyen."}
                </StoryInfoCard>
              </div>
            </PageSection>

            <PageSection title="Vocab mo khoa" description="Luu thang vao My Words neu gap tu muon giu lai.">
              {segmentVocabLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-100 border-t-rose-500" />
                </div>
              ) : segmentVocab.length === 0 ? (
                <EmptyState icon={<BookmarkPlus className="h-6 w-6" />} title="Chua tim thay vocab" description="Ban van co the mo Dictionary de tra cuu them cho doan nay." />
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
                              {word.hiragana} · {word.romaji}
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
                          {isSaved ? "Da luu" : isSaving ? "Dang luu..." : "Luu vao My Words"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </PageSection>

            <PageSection title="Grammar cua doan" description="Moi nhanh co the day mot cum grammar khac nhau truoc khi hoi tu tro lai.">
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
                    <p className="mt-3 text-sm text-muted-foreground">{item.explanation}</p>
                  </div>
                ))}
              </div>
            </PageSection>

            <PageSection title="Buoc tiep theo" description="Nhanh khac se giu cho ban mot trai nghiem hoc khac, nen thu hoc lai tu dau de mo toan bo cau chuyen.">
              <div className="space-y-3">
                <StoryInfoCard>
                  {isBranchMode
                    ? "Chon mot huong di cho nhan vat va xem vocab/grammar cua nhanh do thay doi nhu the nao."
                    : "Hoan thanh checkpoint de mo khoa doan tiep theo cua nhanh hien tai."}
                </StoryInfoCard>
                <StoryInfoCard>
                  {currentDifficulty === "HARD"
                    ? "Thu dong ban dich va luu 1-2 vocab moi sau moi doan de giu do kho chat luong cao."
                    : "Luu 1-2 vocab quan trong vao My Words de bien cau chuyen thanh mot phien hoc that su."}
                </StoryInfoCard>
                <Link to="/quiz">
                  <Button className="w-full rounded-2xl bg-sky-500 text-white hover:bg-sky-400">
                    Qua Quiz tong hop
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </PageSection>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StoryMode;
