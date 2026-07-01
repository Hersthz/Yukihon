import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  Headphones,
  Image as ImageIcon,
  RotateCcw,
  XCircle,
  Zap,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, PageHeader, PageSection, StatStrip } from "@/components/layout/UserPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { quizApi, type QuizAttemptResponse, type QuizSessionResponse } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { useMistakeDna } from "@/hooks/learning/useMistakeDna";
import { cn } from "@/lib/utils";

interface QuizItem {
  id: number;
  title: string;
  description: string;
  quizType: string;
  difficultyLevel: string;
  jlptLevel: string;
  question: string;
  options?: string;
  correctAnswer: string;
  explanation?: string;
  audioUrl?: string;
  imageUrl?: string;
}

const parseQuizOptions = (value?: string) => {
  if (!value?.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
  } catch {
    return value
      .split(/\r?\n|;|\|/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const normalizeAnswer = (value?: string) => (value || "").trim().toLowerCase();

const formatAttemptTime = (value?: string) => {
  if (!value) {
    return "Vừa xong";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Vừa xong";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatPattern = (value?: string) => {
  if (!value) {
    return "Không lỗi";
  }

  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatSessionMode = (value?: string) => {
  switch ((value || "").toUpperCase()) {
    case "MISSED":
      return "Câu sai";
    case "QUICK":
      return "Luyện nhanh";
    default:
      return value || "Phiên";
  }
};

type PracticeMode = "quick" | "missed";

interface PracticeSummary {
  mode: PracticeMode;
  total: number;
  correct: number;
  weakestPattern?: string;
}

const difficultyTone: Record<string, string> = {
  BEGINNER: "border-emerald-200 bg-emerald-50 text-emerald-700",
  INTERMEDIATE: "border-amber-200 bg-amber-50 text-amber-700",
  ADVANCED: "border-rose-200 bg-rose-50 text-rose-700",
};

const Quiz = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [attemptResult, setAttemptResult] = useState<QuizAttemptResponse | null>(null);
  const [sessionResults, setSessionResults] = useState({ total: 0, correct: 0 });
  const [practiceMode, setPracticeMode] = useState<PracticeMode | null>(null);
  const [practiceQueue, setPracticeQueue] = useState<QuizItem[]>([]);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceAttempts, setPracticeAttempts] = useState<QuizAttemptResponse[]>([]);
  const [practiceSummary, setPracticeSummary] = useState<PracticeSummary | null>(null);
  const [historyTab, setHistoryTab] = useState<"wrong" | "all">("wrong");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: mistakeDna } = useMistakeDna();

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["quizzes"],
    queryFn: () => quizApi.getAll<QuizItem[]>(),
  });

  const { data: recentAttempts = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ["quiz-attempts"],
    queryFn: () => quizApi.getRecentAttempts({ limit: 50 }),
  });

  const { data: recentWrongAttempts = [] } = useQuery({
    queryKey: ["quiz-attempts", "wrong"],
    queryFn: () => quizApi.getRecentAttempts({ correct: false, limit: 50 }),
  });

  const { data: recentSessions = [] } = useQuery({
    queryKey: ["quiz-sessions"],
    queryFn: () => quizApi.getRecentSessions({ limit: 5 }),
  });

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((item: QuizItem) => {
      const byDifficulty =
        selectedDifficulty === "all" || item.difficultyLevel === selectedDifficulty;
      const byLevel = selectedLevel === "all" || item.jlptLevel === selectedLevel;
      return byDifficulty && byLevel;
    });
  }, [quizzes, selectedDifficulty, selectedLevel]);

  const stats = useMemo(
    () => ({
      total: quizzes.length,
      visible: filteredQuizzes.length,
    }),
    [filteredQuizzes.length, quizzes.length]
  );

  const quizById = useMemo(() => {
    const next = new Map<number, QuizItem>();
    quizzes.forEach((quiz: QuizItem) => next.set(quiz.id, quiz));
    return next;
  }, [quizzes]);

  const quizTitleById = useMemo(() => {
    const next = new Map<number, string>();
    quizzes.forEach((quiz: QuizItem) => next.set(quiz.id, quiz.title));
    return next;
  }, [quizzes]);

  const latestAttempts = useMemo(() => recentAttempts.slice(0, 5), [recentAttempts]);
  const wrongAttempts = useMemo(() => recentWrongAttempts, [recentWrongAttempts]);
  const visibleHistoryAttempts =
    historyTab === "wrong" ? wrongAttempts.slice(0, 5) : latestAttempts;
  const missedReviewQueue = useMemo(() => {
    const seen = new Set<number>();
    return wrongAttempts
      .map((attempt) => quizById.get(attempt.quizId))
      .filter((quiz): quiz is QuizItem => {
        if (!quiz || seen.has(quiz.id)) {
          return false;
        }
        seen.add(quiz.id);
        return true;
      })
      .slice(0, 10);
  }, [quizById, wrongAttempts]);

  const activeOptions = useMemo(() => parseQuizOptions(activeQuiz?.options), [activeQuiz?.options]);
  const answerValue = activeOptions.length > 0 ? selectedAnswer : typedAnswer;
  const isCorrect = normalizeAnswer(answerValue) === normalizeAnswer(activeQuiz?.correctAnswer);
  const resolvedIsCorrect = attemptResult?.correct ?? isCorrect;
  const sessionAccuracy = sessionResults.total
    ? Math.round((sessionResults.correct / sessionResults.total) * 100)
    : null;
  const activeQuizIndex = activeQuiz
    ? filteredQuizzes.findIndex((quiz: QuizItem) => quiz.id === activeQuiz.id)
    : -1;
  const nextPracticeQuiz =
    practiceQueue.length > 0 ? (practiceQueue[practiceIndex + 1] ?? null) : null;
  const nextListQuiz = activeQuizIndex >= 0 ? (filteredQuizzes[activeQuizIndex + 1] ?? null) : null;
  const nextQuiz = practiceQueue.length > 0 ? nextPracticeQuiz : nextListQuiz;

  const resetAttempt = () => {
    setSelectedAnswer("");
    setTypedAnswer("");
    setIsAnswered(false);
    setAttemptResult(null);
  };

  const startQuiz = (quiz: QuizItem) => {
    setPracticeMode(null);
    setPracticeQueue([]);
    setPracticeIndex(0);
    setPracticeAttempts([]);
    setPracticeSummary(null);
    setActiveQuiz(quiz);
    resetAttempt();
  };

  const buildPracticeSummary = (
    attempts: QuizAttemptResponse[],
    mode: PracticeMode
  ): PracticeSummary => {
    const wrongByPattern = attempts
      .filter((attempt) => !attempt.correct)
      .reduce<Record<string, number>>((acc, attempt) => {
        const key = attempt.mistakePattern || "unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

    const weakestPattern = Object.entries(wrongByPattern)
      .sort((left, right) => right[1] - left[1])
      .map(([pattern]) => pattern)[0];

    return {
      mode,
      total: attempts.length,
      correct: attempts.filter((attempt) => attempt.correct).length,
      weakestPattern,
    };
  };

  const startPracticeQueue = (queue: QuizItem[], mode: PracticeMode) => {
    if (queue.length === 0) {
      toast({
        title: mode === "quick" ? "Chưa có quiz để luyện nhanh" : "Chưa có câu sai để luyện lại",
        description:
          mode === "quick"
            ? "Thử nới bộ lọc hoặc thêm quiz mới."
            : "Làm sai một vài câu trước rồi quay lại luyện lại.",
      });
      return;
    }

    setPracticeMode(mode);
    setPracticeQueue(queue.slice(0, 10));
    setPracticeIndex(0);
    setPracticeAttempts([]);
    setPracticeSummary(null);
    setActiveQuiz(queue[0]);
    resetAttempt();
  };

  const goToNextQuiz = () => {
    if (!nextQuiz) {
      return;
    }

    if (practiceQueue.length > 0) {
      setPracticeIndex((current) => current + 1);
      setActiveQuiz(nextQuiz);
      resetAttempt();
      return;
    }

    startQuiz(nextQuiz);
  };

  const { mutate: recordSession } = useMutation({
    mutationFn: quizApi.recordSession,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["quiz-sessions"] });
    },
    onError: () => {
      toast({
        title: "Không thể lưu phiên trắc nghiệm",
        description: "Kết quả từng câu vẫn được lưu, nhưng tổng kết phiên chưa được ghi lại.",
        variant: "destructive",
      });
    },
  });

  const { mutate: recordAttempt, isPending: isSavingAttempt } = useMutation({
    mutationFn: quizApi.recordAttempt,
    onSuccess: (attempt) => {
      setAttemptResult(attempt);
      setIsAnswered(true);
      setSessionResults((current) => ({
        total: current.total + 1,
        correct: current.correct + (attempt.correct ? 1 : 0),
      }));
      if (practiceMode && practiceQueue.length > 0) {
        const nextAttempts = [...practiceAttempts, attempt];
        setPracticeAttempts(nextAttempts);
        if (practiceIndex >= practiceQueue.length - 1) {
          const summary = buildPracticeSummary(nextAttempts, practiceMode);
          setPracticeSummary(summary);
          recordSession({
            mode: summary.mode,
            totalQuestions: summary.total,
            correctCount: summary.correct,
            weakestPattern: summary.weakestPattern,
          });
        }
      }
      void queryClient.invalidateQueries({ queryKey: ["mistake-dna"] });
      void queryClient.invalidateQueries({ queryKey: ["progress"] });
      void queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
      void queryClient.invalidateQueries({ queryKey: ["quiz-attempts", "wrong"] });
    },
    onError: () => {
      toast({
        title: "Không thể lưu kết quả quiz",
        description: "Bạn có thể thử kiểm tra đáp án lại sau vài giây.",
        variant: "destructive",
      });
    },
  });

  const checkAnswer = useCallback(() => {
    if (!activeQuiz || isAnswered || isSavingAttempt || !answerValue.trim()) {
      return;
    }

    recordAttempt({ quizId: activeQuiz.id, answer: answerValue });
  }, [activeQuiz, answerValue, isAnswered, isSavingAttempt, recordAttempt]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!activeQuiz) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        Boolean(target?.isContentEditable);

      if (
        activeOptions.length > 0 &&
        !isAnswered &&
        !isSavingAttempt &&
        /^[1-4]$/.test(event.key)
      ) {
        const option = activeOptions[Number(event.key) - 1];
        if (option) {
          event.preventDefault();
          setSelectedAnswer(option);
        }
        return;
      }

      if (event.key === "Enter" && !isTypingTarget) {
        if (!isAnswered && answerValue.trim()) {
          event.preventDefault();
          checkAnswer();
        } else if (isAnswered && nextQuiz) {
          event.preventDefault();
          goToNextQuiz();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeOptions,
    activeQuiz,
    answerValue,
    checkAnswer,
    goToNextQuiz,
    isAnswered,
    isSavingAttempt,
    nextQuiz,
  ]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1380px]">
        <PageHeader
          icon={<Zap className="h-6 w-6 text-primary" />}
          title="Trắc nghiệm"
          description="Chuyển về dạng danh mục gọn hơn để bạn lọc nhanh và nhìn nhiều bộ quiz trong một lượt."
          eyebrow="Luyện tập"
          action={
            <Button
              className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={filteredQuizzes.length === 0}
              onClick={() => startPracticeQueue(filteredQuizzes.slice(0, 10), "quick")}
            >
              <Zap className="mr-2 h-4 w-4" />
              Luyện nhanh 10 câu
            </Button>
          }
        />

        <StatStrip
          className="mb-4"
          items={[
            { label: "tổng quiz", value: stats.total },
            { label: "đang hiển thị", value: stats.visible },
            {
              label: "độ chính xác",
              value: sessionAccuracy == null ? "--" : `${sessionAccuracy}%`,
            },
          ]}
        />

        {mistakeDna && (
          <PageSection
            className="mb-4"
            title="AI Mistake DNA"
            description="Xem những điểm yếu lặp lại trong lịch sử trắc nghiệm của bạn trước khi bắt đầu bộ tiếp theo."
            action={
              <Link to="/mistake-dna">
                <Button className="rounded-2xl bg-rose-500 text-white hover:bg-rose-400">
                  Mở hồ sơ
                </Button>
              </Link>
            }
          >
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px_260px]">
              <div className="rounded-[22px] border border-border bg-background px-4 py-4">
                <p className="text-base font-semibold text-foreground">
                  {mistakeDna.dominantPatternTitle}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{mistakeDna.summary}</p>
              </div>
              <div className="rounded-[22px] border border-border bg-background px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Độ chính xác trắc nghiệm
                </p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {mistakeDna.averageQuizAccuracy}%
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Trung bình qua các lần làm gần đây
                </p>
              </div>
              <div className="rounded-[22px] border border-border bg-background px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Điểm rủi ro
                </p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {mistakeDna.overallRiskScore}%
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tổng hợp lỗi trắc nghiệm, bài học dang dở và phần ôn đến hạn
                </p>
              </div>
            </div>
          </PageSection>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Select onValueChange={setSelectedLevel} value={selectedLevel}>
            <SelectTrigger className="h-10 w-40 rounded-xl border-border bg-card text-foreground/80">
              <SelectValue placeholder="Chọn level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả level</SelectItem>
              {["N5", "N4", "N3", "N2", "N1"].map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedDifficulty} value={selectedDifficulty}>
            <SelectTrigger className="h-10 w-44 rounded-xl border-border bg-card text-foreground/80">
              <SelectValue placeholder="Chọn độ khó" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả độ khó</SelectItem>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {practiceSummary && (
          <PageSection
            className="mb-4"
            title={
              practiceSummary.mode === "quick"
                ? "Tổng kết luyện nhanh"
                : "Tổng kết luyện lại câu sai"
            }
            description="Điểm tổng và pattern yếu nhất của phiên vừa làm."
            action={
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() =>
                  startPracticeQueue(
                    practiceSummary.mode === "quick"
                      ? filteredQuizzes.slice(0, 10)
                      : missedReviewQueue,
                    practiceSummary.mode
                  )
                }
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Luyện lại phiên này
              </Button>
            }
          >
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[20px] border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Điểm tổng
                </p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {practiceSummary.correct}/{practiceSummary.total}
                </p>
              </div>
              <div className="rounded-[20px] border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Accuracy
                </p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {practiceSummary.total
                    ? Math.round((practiceSummary.correct / practiceSummary.total) * 100)
                    : 0}
                  %
                </p>
              </div>
              <div className="rounded-[20px] border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Pattern yếu nhất
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {formatPattern(practiceSummary.weakestPattern)}
                </p>
              </div>
            </div>
          </PageSection>
        )}

        {recentSessions.length > 0 && (
          <PageSection
            className="mb-4"
            title="Phiên luyện gần đây"
            description="Backend lưu cả phiên luyện để bạn xem lại tổng điểm, mode và pattern yếu nhất."
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {recentSessions.map((session: QuizSessionResponse) => (
                <div
                  key={session.id}
                  className="rounded-[18px] border border-border bg-background p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {formatSessionMode(session.mode)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatAttemptTime(session.completedAt)}
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {session.correctCount}/{session.totalQuestions}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {Math.round(session.accuracyRate)}% chính xác
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Pattern:{" "}
                    <span className="font-semibold text-foreground">
                      {formatPattern(session.weakestPattern)}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </PageSection>
        )}

        {activeQuiz && (
          <PageSection
            className="mb-4"
            title={activeQuiz.title}
            description="Làm quiz ngay trong danh mục, xem đáp án và giải thích mà không bị rời khỏi luồng lọc."
            action={
              <Button variant="outline" className="rounded-2xl" onClick={() => setActiveQuiz(null)}>
                Đóng
              </Button>
            }
          >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                    {activeQuiz.jlptLevel}
                  </span>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold",
                      difficultyTone[activeQuiz.difficultyLevel] ||
                        "border-border bg-muted text-foreground/80"
                    )}
                  >
                    {activeQuiz.difficultyLevel}
                  </span>
                  <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                    {activeQuiz.quizType.replaceAll("_", " ")}
                  </span>
                  {practiceQueue.length > 0 && (
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Câu {practiceIndex + 1}/{practiceQueue.length}
                    </span>
                  )}
                </div>

                {activeQuiz.imageUrl && (
                  <div className="overflow-hidden rounded-[20px] border border-border bg-muted">
                    <img
                      src={activeQuiz.imageUrl}
                      alt=""
                      className="max-h-72 w-full object-cover"
                    />
                  </div>
                )}

                {activeQuiz.audioUrl && (
                  <div className="rounded-[18px] border border-border bg-card p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Headphones className="h-4 w-4 text-primary" />
                      Âm thanh câu hỏi
                    </div>
                    <audio controls src={activeQuiz.audioUrl} className="w-full" />
                  </div>
                )}

                <div className="rounded-[20px] border border-border bg-muted p-4">
                  <p className="text-sm font-semibold text-muted-foreground">Câu hỏi</p>
                  <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-foreground">
                    {activeQuiz.question}
                  </p>
                </div>

                {activeOptions.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeOptions.map((option) => {
                      const optionIsCorrect =
                        normalizeAnswer(option) === normalizeAnswer(activeQuiz.correctAnswer);
                      const optionIsSelected = selectedAnswer === option;

                      return (
                        <Button
                          key={option}
                          type="button"
                          variant="outline"
                          className={cn(
                            "h-auto min-h-12 justify-start rounded-2xl border-border bg-card px-4 py-3 text-left whitespace-normal",
                            !isAnswered &&
                              optionIsSelected &&
                              "border-primary/50 bg-primary/10 text-primary",
                            isAnswered &&
                              optionIsCorrect &&
                              "border-emerald-300 bg-emerald-50 text-emerald-800",
                            isAnswered &&
                              optionIsSelected &&
                              !optionIsCorrect &&
                              "border-rose-300 bg-rose-50 text-rose-800"
                          )}
                          disabled={isAnswered}
                          onClick={() => setSelectedAnswer(option)}
                        >
                          <span className="flex-1">{option}</span>
                          {isAnswered && optionIsCorrect && <CheckCircle2 className="h-4 w-4" />}
                          {isAnswered && optionIsSelected && !optionIsCorrect && (
                            <XCircle className="h-4 w-4" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <Input
                    value={typedAnswer}
                    onChange={(event) => setTypedAnswer(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        checkAnswer();
                      }
                    }}
                    disabled={isAnswered}
                    placeholder="Nhập đáp án của bạn..."
                    className="h-12 rounded-2xl border-border bg-card"
                  />
                )}

                {isAnswered && (
                  <div
                    className={cn(
                      "rounded-[20px] border p-4",
                      resolvedIsCorrect
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-rose-200 bg-rose-50 text-rose-900"
                    )}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      {resolvedIsCorrect ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                      {resolvedIsCorrect ? "Chính xác" : "Chưa đúng"}
                    </div>
                    <p className="mt-2 text-sm">
                      Đáp án đúng: <span className="font-semibold">{activeQuiz.correctAnswer}</span>
                    </p>
                    {activeQuiz.explanation && (
                      <p className="mt-2 text-sm leading-6">{activeQuiz.explanation}</p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!answerValue.trim() || isAnswered || isSavingAttempt}
                    onClick={checkAnswer}
                  >
                    {isSavingAttempt ? "Đang lưu..." : "Kiểm tra đáp án"}
                  </Button>
                  <Button variant="outline" className="rounded-2xl" onClick={resetAttempt}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Làm lại
                  </Button>
                  {isAnswered && nextQuiz && (
                    <Button variant="outline" className="rounded-2xl" onClick={goToNextQuiz}>
                      Bài tiếp theo
                    </Button>
                  )}
                </div>
              </div>

              <div className="rounded-[20px] border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">Tóm tắt</p>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between gap-3">
                    <span>Đáp án đã chọn</span>
                    <span className="max-w-40 truncate font-semibold text-foreground">
                      {answerValue || "Chưa chọn"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Trạng thái</span>
                    <span className="font-semibold text-foreground">
                      {isAnswered ? (resolvedIsCorrect ? "Đúng" : "Sai") : "Đang làm"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Session</span>
                    <span className="font-semibold text-foreground">
                      {sessionResults.correct}/{sessionResults.total}
                    </span>
                  </div>
                  {attemptResult?.mistakePattern && (
                    <div className="flex items-center justify-between gap-3">
                      <span>Pattern</span>
                      <span className="font-semibold capitalize text-foreground">
                        {attemptResult.mistakePattern}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 rounded-[18px] border border-dashed border-border bg-muted p-4 text-sm leading-6 text-muted-foreground">
                  {activeQuiz.imageUrl ? (
                    <span className="inline-flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Có hình minh họa cho câu này.
                    </span>
                  ) : (
                    "Bạn có thể thêm image/audio trong CMS để quiz nghe-nhìn giàu hơn."
                  )}
                </div>
              </div>
            </div>
          </PageSection>
        )}

        <PageSection
          className="mb-4"
          title="Lịch sử trắc nghiệm"
          description="5 lần làm gần nhất, gồm đúng/sai, pattern lỗi và thời điểm làm bài."
          action={
            <div className="flex flex-wrap gap-2">
              <Button
                variant={historyTab === "wrong" ? "default" : "outline"}
                className="rounded-2xl"
                onClick={() => setHistoryTab("wrong")}
              >
                Câu sai
              </Button>
              <Button
                variant={historyTab === "all" ? "default" : "outline"}
                className="rounded-2xl"
                onClick={() => setHistoryTab("all")}
              >
                Tất cả
              </Button>
              <Button
                className="rounded-2xl bg-rose-500 text-white hover:bg-rose-400"
                disabled={missedReviewQueue.length === 0}
                onClick={() => startPracticeQueue(missedReviewQueue, "missed")}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Luyện lại câu sai
              </Button>
            </div>
          }
        >
          {isHistoryLoading ? (
            <div className="grid gap-3 md:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-[18px] border border-border bg-muted"
                />
              ))}
            </div>
          ) : visibleHistoryAttempts.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-border bg-muted px-4 py-8 text-center">
              <p className="text-sm font-semibold text-foreground">Chưa có lịch sử quiz</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Làm một câu quiz để bắt đầu ghi lại tiến độ thật.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {visibleHistoryAttempts.map((attempt) => {
                const quizTitle = quizTitleById.get(attempt.quizId) || `Quiz #${attempt.quizId}`;

                return (
                  <div
                    key={attempt.id}
                    className={cn(
                      "rounded-[18px] border p-4",
                      attempt.correct
                        ? "border-emerald-200 bg-emerald-50/80"
                        : "border-rose-200 bg-rose-50/80"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                          attempt.correct
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        )}
                      >
                        {attempt.correct ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        {attempt.correct ? "Đúng" : "Sai"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        {formatAttemptTime(attempt.attemptedAt)}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm font-semibold leading-5 text-foreground">
                      {quizTitle}
                    </p>
                    <p className="mt-2 truncate text-xs text-muted-foreground">
                      Đáp án:{" "}
                      <span className="font-semibold text-foreground">{attempt.answer}</span>
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Pattern:{" "}
                      <span className="font-semibold text-foreground">
                        {formatPattern(attempt.mistakePattern)}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </PageSection>

        <PageSection
          title="Danh sách quiz"
          description="Card thấp hơn và action rõ hơn để đỡ ngột ngạt khi danh sách dài."
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <EmptyState
              description="Không có quiz phù hợp với bộ lọc hiện tại. Thử nới filter để xem thêm bài."
              icon={<Zap className="h-6 w-6" />}
              title="Chưa có quiz phù hợp"
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredQuizzes.map((quiz: QuizItem) => (
                <motion.div
                  key={quiz.id}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[22px] border border-white bg-card p-4 shadow-[0_10px_24px_rgba(148,163,184,0.10)]"
                  initial={{ opacity: 0, y: 10 }}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                      {quiz.jlptLevel}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-semibold",
                        difficultyTone[quiz.difficultyLevel] ||
                          "border-border bg-muted text-foreground/80"
                      )}
                    >
                      {quiz.difficultyLevel}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground">{quiz.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {quiz.description}
                  </p>
                  <p className="mt-3 line-clamp-3 rounded-[18px] border border-border bg-muted p-3 text-sm text-muted-foreground">
                    {quiz.question}
                  </p>

                  <Button
                    className="mt-4 w-full rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => startQuiz(quiz)}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    {activeQuiz?.id === quiz.id ? "Đang làm quiz" : "Bắt đầu quiz"}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </PageSection>
      </div>
    </DashboardLayout>
  );
};

export default Quiz;
