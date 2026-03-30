import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, BookmarkPlus, Brain, Check, ChevronRight, Lock, RotateCcw, Sparkles } from "lucide-react";
import { dictionaryApi, myWordsApi, type DictionaryEntry } from "@/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ToastAction } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { storyModeStories, type StoryModeStory, type StorySegment } from "@/data/storyMode";

const normalizeSavedStatuses = (statuses: Record<string, boolean>) =>
  Object.fromEntries(Object.entries(statuses).map(([id, saved]) => [Number(id), saved])) as Record<number, boolean>;

interface StoryModeSnapshot {
  activeStoryId: string;
  activeSegmentIndex: number;
  unlockedCounts: Record<string, number>;
  selectedAnswers: Record<string, string>;
  submittedSegments: Record<string, boolean>;
}

const buildInitialUnlockedCounts = () => Object.fromEntries(storyModeStories.map((story) => [story.id, 1]));

const StoryMode = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStoryId, setActiveStoryId] = useState(storyModeStories[0]?.id ?? "");
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [unlockedCounts, setUnlockedCounts] = useState<Record<string, number>>(buildInitialUnlockedCounts);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedSegments, setSubmittedSegments] = useState<Record<string, boolean>>({});
  const [segmentVocab, setSegmentVocab] = useState<DictionaryEntry[]>([]);
  const [segmentVocabLoading, setSegmentVocabLoading] = useState(false);
  const [savedStatuses, setSavedStatuses] = useState<Record<number, boolean>>({});
  const [savingWordId, setSavingWordId] = useState<number | null>(null);
  const [hasHydratedProgress, setHasHydratedProgress] = useState(false);

  const progressStorageKey = useMemo(
    () => `yukihon_story_mode_progress_${user?.id ?? "guest"}`,
    [user?.id]
  );

  const activeStory = useMemo(
    () => storyModeStories.find((story) => story.id === activeStoryId) ?? storyModeStories[0],
    [activeStoryId]
  );
  const unlockedCount = unlockedCounts[activeStory.id] ?? 1;
  const activeSegment = activeStory.segments[Math.min(activeSegmentIndex, unlockedCount - 1)] ?? activeStory.segments[0];
  const activeSegmentId = activeSegment?.id ?? "";
  const selectedAnswer = selectedAnswers[activeSegmentId] ?? "";
  const isSubmitted = !!submittedSegments[activeSegmentId];
  const isCorrect = selectedAnswer === activeSegment?.checkpoint.correctOptionId;

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

  useEffect(() => {
    const initialUnlockedCounts = buildInitialUnlockedCounts();

    try {
      const raw = localStorage.getItem(progressStorageKey);
      if (!raw) {
        setUnlockedCounts(initialUnlockedCounts);
        setHasHydratedProgress(true);
        return;
      }

      const snapshot = JSON.parse(raw) as Partial<StoryModeSnapshot>;
      const nextStory = storyModeStories.find((story) => story.id === snapshot.activeStoryId) ?? storyModeStories[0];
      const mergedUnlockedCounts = {
        ...initialUnlockedCounts,
        ...(snapshot.unlockedCounts ?? {}),
      };
      const nextUnlockedCount = Math.max(1, Math.min(nextStory.segments.length, mergedUnlockedCounts[nextStory.id] ?? 1));

      setActiveStoryId(nextStory.id);
      setUnlockedCounts(mergedUnlockedCounts);
      setActiveSegmentIndex(Math.max(0, Math.min(nextUnlockedCount - 1, snapshot.activeSegmentIndex ?? 0)));
      setSelectedAnswers(snapshot.selectedAnswers ?? {});
      setSubmittedSegments(snapshot.submittedSegments ?? {});
    } catch {
      setUnlockedCounts(initialUnlockedCounts);
    } finally {
      setHasHydratedProgress(true);
    }
  }, [progressStorageKey]);

  useEffect(() => {
    if (!hasHydratedProgress) return;

    const snapshot: StoryModeSnapshot = {
      activeStoryId,
      activeSegmentIndex,
      unlockedCounts,
      selectedAnswers,
      submittedSegments,
    };

    localStorage.setItem(progressStorageKey, JSON.stringify(snapshot));
  }, [activeSegmentIndex, activeStoryId, hasHydratedProgress, progressStorageKey, selectedAnswers, submittedSegments, unlockedCounts]);

  useEffect(() => {
    if (!activeStory || !activeSegment) return;

    let cancelled = false;

    const loadSegmentVocab = async (story: StoryModeStory, segment: StorySegment) => {
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

    void loadSegmentVocab(activeStory, activeSegment);

    return () => {
      cancelled = true;
    };
  }, [activeStory, activeSegment]);

  const handleSelectStory = (storyId: string) => {
    setActiveStoryId(storyId);
    setActiveSegmentIndex(0);
  };

  const handleResetProgress = () => {
    localStorage.removeItem(progressStorageKey);
    setActiveStoryId(storyModeStories[0]?.id ?? "");
    setActiveSegmentIndex(0);
    setUnlockedCounts(buildInitialUnlockedCounts());
    setSelectedAnswers({});
    setSubmittedSegments({});
    toast({ title: "Đã reset Story Mode", description: "Tiến độ đọc truyện trên máy này đã quay về từ đầu." });
  };

  const handleSubmitCheckpoint = () => {
    if (!activeSegment || !selectedAnswer) {
      toast({ title: "Chọn đáp án trước", description: "Hãy chọn một đáp án để mở checkpoint của đoạn này." });
      return;
    }

    setSubmittedSegments((prev) => ({ ...prev, [activeSegment.id]: true }));

    if (selectedAnswer === activeSegment.checkpoint.correctOptionId) {
      setUnlockedCounts((prev) => ({
        ...prev,
        [activeStory.id]: Math.min(activeStory.segments.length, Math.max(prev[activeStory.id] ?? 1, activeSegmentIndex + 2)),
      }));
      toast({ title: "Đã mở đoạn kế tiếp", description: "Bạn có thể tiếp tục câu chuyện hoặc ở lại ôn vocab của đoạn này." });
      return;
    }

    toast({ title: "Chưa đúng rồi", description: "Đọc lại đoạn ngắn và thử chọn lại đáp án phù hợp hơn." });
  };

  const handleOpenNextSegment = () => {
    if (activeSegmentIndex + 1 >= unlockedCount) return;
    setActiveSegmentIndex((prev) => Math.min(prev + 1, unlockedCount - 1));
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

  const storyProgress = Math.round((unlockedCount / activeStory.segments.length) * 100);

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
          icon={<BookOpen className="h-6 w-6 text-rose-600" />}
          eyebrow="Story Mode"
          title="Hoc theo truyen ngan"
          description="Moi doan mo khoa vocab, grammar va checkpoint rieng, giup viec hoc co nhip va co boi canh hon."
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

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <MetricCard label="Truyen hien tai" value={activeStory.title} icon={<BookOpen className="h-4 w-4 text-rose-500" />} hint={activeStory.subtitle} />
          <MetricCard label="Tien do" value={`${storyProgress}%`} icon={<Sparkles className="h-4 w-4 text-emerald-500" />} hint={`${unlockedCount}/${activeStory.segments.length} doan da mo`} />
          <MetricCard label="JLPT" value={activeStory.jlptLevel} icon={<Brain className="h-4 w-4 text-sky-500" />} hint={`Khoang ${activeStory.estimatedMinutes} phut`} />
          <MetricCard label="Tone" value={activeStory.tone} icon={<Sparkles className="h-4 w-4 text-amber-500" />} hint={activeStory.description} />
        </div>

        <PageSection className="mb-4" title="Chon truyen" description="Mỗi truyện có nhịp riêng nhưng đều bám theo vocab và grammar có thể ôn lại ngay.">
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
                  <Badge className="rounded-full border border-rose-200 bg-white text-rose-700">{story.jlptLevel}</Badge>
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
                {activeStory.segments.map((segment, index) => {
                  const locked = index >= unlockedCount;
                  const active = index === activeSegmentIndex;

                  return (
                    <Button
                      key={segment.id}
                      className={active ? "rounded-2xl bg-rose-500 text-white hover:bg-rose-400" : "rounded-2xl border-border bg-card text-foreground/80 hover:bg-card"}
                      disabled={locked}
                      onClick={() => setActiveSegmentIndex(index)}
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
                  <Badge className="rounded-full border border-rose-200 bg-rose-50 text-rose-700">{activeStory.jlptLevel}</Badge>
                </div>

                <div className="rounded-[22px] bg-rose-50/70 p-5">
                  <p className="text-2xl leading-10 text-foreground">{activeSegment.japaneseText}</p>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{activeSegment.translation}</p>
                </div>
              </div>
            </PageSection>

            <PageSection title="Checkpoint cua doan" description="Tra loi dung de mo doan tiep theo va giu nhip doc lien mach.">
              <div className="rounded-[24px] border border-border bg-card p-4">
                <p className="text-base font-semibold text-foreground">{activeSegment.checkpoint.question}</p>
                <div className="mt-4 grid gap-2">
                  {activeSegment.checkpoint.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setSelectedAnswers((prev) => ({ ...prev, [activeSegmentId]: option.id }));
                        setSubmittedSegments((prev) => ({ ...prev, [activeSegmentId]: false }));
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
                    Kiem tra
                  </Button>
                  {isSubmitted && isCorrect && activeSegmentIndex + 1 < unlockedCount && activeSegmentIndex + 1 < activeStory.segments.length ? (
                    <Button className="rounded-2xl bg-emerald-500 text-white hover:bg-emerald-400" onClick={handleOpenNextSegment}>
                      Mo doan tiep
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : null}
                </div>

                {isSubmitted ? (
                  <div className={`mt-4 rounded-[20px] border px-4 py-4 ${isCorrect ? "border-emerald-200 bg-emerald-50/80" : "border-amber-200 bg-amber-50/80"}`}>
                    <p className={`text-sm font-semibold ${isCorrect ? "text-emerald-700" : "text-amber-800"}`}>
                      {isCorrect ? "Dung roi" : "Chua dung"}
                    </p>
                    <p className="mt-1 text-sm text-foreground/80">{activeSegment.checkpoint.explanation}</p>
                  </div>
                ) : null}
              </div>
            </PageSection>
          </div>

          <div className="space-y-4">
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

            <PageSection title="Grammar cua doan" description="Mỗi đoạn chỉ giữ 1-2 mẫu để bạn tiêu hóa nhẹ hơn.">
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

            <PageSection title="Buoc tiep theo" description="Khi doc xong doan nay, ban co the tiep tuc mot cach tu nhien.">
              <div className="space-y-3">
                <div className="rounded-[18px] border border-border bg-card px-4 py-3 text-sm text-foreground">
                  Hoan thanh checkpoint de mo khoa doan tiep theo cua truyen.
                </div>
                <div className="rounded-[18px] border border-border bg-card px-4 py-3 text-sm text-foreground">
                  Luu 1-2 vocab quan trong vao My Words de bien cau chuyen thanh mot phien hoc that su.
                </div>
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
