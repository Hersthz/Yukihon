import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Filter, Headphones, Image as ImageIcon, RotateCcw, Target, Trophy, XCircle, Zap } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { quizApi, type QuizAttemptResponse } from "@/api";
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
    return Array.isArray(parsed)
      ? parsed.map((item) => String(item).trim()).filter(Boolean)
      : [];
  } catch {
    return value
      .split(/\r?\n|;|\|/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const normalizeAnswer = (value?: string) => (value || "").trim().toLowerCase();

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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: mistakeDna } = useMistakeDna();

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["quizzes"],
    queryFn: () => quizApi.getAll<QuizItem[]>(),
  });

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((item: QuizItem) => {
      const byDifficulty = selectedDifficulty === "all" || item.difficultyLevel === selectedDifficulty;
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
  const nextQuiz = activeQuizIndex >= 0
    ? filteredQuizzes[activeQuizIndex + 1] ?? null
    : null;

  const resetAttempt = () => {
    setSelectedAnswer("");
    setTypedAnswer("");
    setIsAnswered(false);
    setAttemptResult(null);
  };

  const startQuiz = (quiz: QuizItem) => {
    setActiveQuiz(quiz);
    resetAttempt();
  };

  const { mutate: recordAttempt, isPending: isSavingAttempt } = useMutation({
    mutationFn: quizApi.recordAttempt,
    onSuccess: (attempt) => {
      setAttemptResult(attempt);
      setIsAnswered(true);
      setSessionResults((current) => ({
        total: current.total + 1,
        correct: current.correct + (attempt.correct ? 1 : 0),
      }));
      void queryClient.invalidateQueries({ queryKey: ["mistake-dna"] });
      void queryClient.invalidateQueries({ queryKey: ["progress"] });
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
      const isTypingTarget = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || Boolean(target?.isContentEditable);

      if (activeOptions.length > 0 && !isAnswered && !isSavingAttempt && /^[1-4]$/.test(event.key)) {
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
          startQuiz(nextQuiz);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeOptions, activeQuiz, answerValue, checkAnswer, isAnswered, isSavingAttempt, nextQuiz]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1380px]">
        <PageHeader
          icon={<Zap className="h-6 w-6 text-amber-600" />}
          title="Quiz"
          description="Chuyển về dạng danh mục gọn hơn để bạn lọc nhanh và nhìn nhiều bộ quiz trong một lượt."
          eyebrow="Practice"
        />

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricCard hint="Toàn bộ ngân hàng quiz" icon={<Zap className="h-4 w-4 text-sky-500" />} label="Tổng quiz" value={stats.total} />
          <MetricCard hint="Theo bộ lọc hiện tại" icon={<Trophy className="h-4 w-4 text-emerald-500" />} label="Đang hiển thị" value={stats.visible} />
          <MetricCard
            hint={sessionResults.total ? `${sessionResults.correct}/${sessionResults.total} câu đúng trong lượt này` : "Bắt đầu một quiz để ghi nhận nhịp làm bài hiện tại"}
            icon={<Target className="h-4 w-4 text-violet-500" />}
            label="Session accuracy"
            value={sessionAccuracy == null ? "--" : `${sessionAccuracy}%`}
          />
        </div>

        {mistakeDna && (
          <PageSection
            className="mb-4"
            title="AI Mistake DNA"
            description="Read the repeated weak spots behind your quiz history before jumping into the next set."
            action={
              <Link to="/mistake-dna">
                <Button className="rounded-2xl bg-rose-500 text-white hover:bg-rose-400">Open profile</Button>
              </Link>
            }
          >
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px_260px]">
              <div className="rounded-[22px] border border-border bg-background px-4 py-4">
                <p className="text-base font-semibold text-foreground">{mistakeDna.dominantPatternTitle}</p>
                <p className="mt-2 text-sm text-muted-foreground">{mistakeDna.summary}</p>
              </div>
              <div className="rounded-[22px] border border-border bg-background px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Quiz accuracy</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{mistakeDna.averageQuizAccuracy}%</p>
                <p className="mt-1 text-sm text-muted-foreground">Average across recent checkpoint attempts</p>
              </div>
              <div className="rounded-[22px] border border-border bg-background px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Risk score</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{mistakeDna.overallRiskScore}%</p>
                <p className="mt-1 text-sm text-muted-foreground">Mixes quiz slips, open lessons, and due reviews</p>
              </div>
            </div>
          </PageSection>
        )}

        <PageSection className="mb-4" title="Bộ lọc" description="Ưu tiên quét nhanh thay vì đẩy người dùng vào một hero quá cao.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_240px_240px]">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Chọn level và độ khó để giữ vùng kết quả cô đọng hơn.</p>
            </div>

            <Select onValueChange={setSelectedLevel} value={selectedLevel}>
              <SelectTrigger className="h-11 rounded-2xl border-border bg-card text-foreground/80">
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
              <SelectTrigger className="h-11 rounded-2xl border-border bg-card text-foreground/80">
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
        </PageSection>

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
                  <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", difficultyTone[activeQuiz.difficultyLevel] || "border-border bg-muted text-foreground/80")}>
                    {activeQuiz.difficultyLevel}
                  </span>
                  <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                    {activeQuiz.quizType.replaceAll("_", " ")}
                  </span>
                </div>

                {activeQuiz.imageUrl && (
                  <div className="overflow-hidden rounded-[20px] border border-border bg-muted">
                    <img src={activeQuiz.imageUrl} alt="" className="max-h-72 w-full object-cover" />
                  </div>
                )}

                {activeQuiz.audioUrl && (
                  <div className="rounded-[18px] border border-border bg-card p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Headphones className="h-4 w-4 text-amber-500" />
                      Âm thanh câu hỏi
                    </div>
                    <audio controls src={activeQuiz.audioUrl} className="w-full" />
                  </div>
                )}

                <div className="rounded-[20px] border border-border bg-muted p-4">
                  <p className="text-sm font-semibold text-muted-foreground">Câu hỏi</p>
                  <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-foreground">{activeQuiz.question}</p>
                </div>

                {activeOptions.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeOptions.map((option) => {
                      const optionIsCorrect = normalizeAnswer(option) === normalizeAnswer(activeQuiz.correctAnswer);
                      const optionIsSelected = selectedAnswer === option;

                      return (
                        <Button
                          key={option}
                          type="button"
                          variant="outline"
                          className={cn(
                            "h-auto min-h-12 justify-start rounded-2xl border-border bg-card px-4 py-3 text-left whitespace-normal",
                            !isAnswered && optionIsSelected && "border-amber-300 bg-amber-50 text-amber-800",
                            isAnswered && optionIsCorrect && "border-emerald-300 bg-emerald-50 text-emerald-800",
                            isAnswered && optionIsSelected && !optionIsCorrect && "border-rose-300 bg-rose-50 text-rose-800"
                          )}
                          disabled={isAnswered}
                          onClick={() => setSelectedAnswer(option)}
                        >
                          <span className="flex-1">{option}</span>
                          {isAnswered && optionIsCorrect && <CheckCircle2 className="h-4 w-4" />}
                          {isAnswered && optionIsSelected && !optionIsCorrect && <XCircle className="h-4 w-4" />}
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
                      resolvedIsCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900"
                    )}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      {resolvedIsCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      {resolvedIsCorrect ? "Chính xác" : "Chưa đúng"}
                    </div>
                    <p className="mt-2 text-sm">
                      Đáp án đúng: <span className="font-semibold">{activeQuiz.correctAnswer}</span>
                    </p>
                    {activeQuiz.explanation && <p className="mt-2 text-sm leading-6">{activeQuiz.explanation}</p>}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    className="rounded-2xl bg-amber-500 text-white hover:bg-amber-400"
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
                    <Button variant="outline" className="rounded-2xl" onClick={() => startQuiz(nextQuiz)}>
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
                    <span className="max-w-40 truncate font-semibold text-foreground">{answerValue || "Chưa chọn"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Trạng thái</span>
                    <span className="font-semibold text-foreground">{isAnswered ? (resolvedIsCorrect ? "Đúng" : "Sai") : "Đang làm"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Session</span>
                    <span className="font-semibold text-foreground">{sessionResults.correct}/{sessionResults.total}</span>
                  </div>
                  {attemptResult?.mistakePattern && (
                    <div className="flex items-center justify-between gap-3">
                      <span>Pattern</span>
                      <span className="font-semibold capitalize text-foreground">{attemptResult.mistakePattern}</span>
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

        <PageSection title="Danh sách quiz" description="Card thấp hơn và action rõ hơn để đỡ ngột ngạt khi danh sách dài.">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 rounded-full border-4 border-amber-100 border-t-amber-500 animate-spin" />
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
                    <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", difficultyTone[quiz.difficultyLevel] || "border-border bg-muted text-foreground/80")}>
                      {quiz.difficultyLevel}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground">{quiz.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{quiz.description}</p>
                  <p className="mt-3 line-clamp-3 rounded-[18px] border border-border bg-muted p-3 text-sm text-muted-foreground">{quiz.question}</p>

                  <Button
                    className="mt-4 w-full rounded-2xl bg-amber-500 text-white hover:bg-amber-400"
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
