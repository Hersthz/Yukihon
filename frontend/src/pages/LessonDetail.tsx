import { type ComponentProps, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, PlayCircle, Target } from "lucide-react";
import {
  learningAnalyticsApi,
  progressApi,
  quizApi,
  type LearningAnalyticsEventPayload,
} from "@/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader } from "@/components/layout/UserPage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLesson } from "@/hooks/learning/useLessons";
import { useLearningPath } from "@/hooks/learning/useLearningPath";
import { useMyProgress } from "@/hooks/learning/useProgress";
import { useToast } from "@/hooks/use-toast";
import LessonContentPanel from "@/pages/lesson-detail/LessonContentPanel";
import LessonOverviewPanel from "@/pages/lesson-detail/LessonOverviewPanel";
import { estimateMinutes, formatStatus } from "@/pages/lesson-detail/utils";

interface LessonQuiz {
  id: number;
  lessonId?: number | null;
  title: string;
  description?: string;
  question: string;
  options?: string;
  correctAnswer: string;
  explanation?: string;
  jlptLevel?: string;
}

const createLessonSessionId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `lesson-${Date.now()}-${Math.round(Math.random() * 100_000)}`;
};

const LessonDetail = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const parsedLessonId = Number(lessonId);
  const [noteText, setNoteText] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null);
  const [gradingQuiz, setGradingQuiz] = useState(false);
  const lessonSessionIdRef = useRef<string>(createLessonSessionId());
  const lessonOpenedAtRef = useRef<number>(Date.now());
  const startedInSessionRef = useRef(false);
  const completedInSessionRef = useRef(false);

  const { data: lesson, isLoading } = useLesson(
    Number.isFinite(parsedLessonId) ? parsedLessonId : undefined
  );
  const { data: progress = [], isLoading: isProgressLoading } = useMyProgress();
  const { data: learningPath } = useLearningPath();
  const lessonEntityId = lesson?.id;
  const lessonJlptLevel = lesson?.jlptLevel;

  const lessonProgress = useMemo(
    () => progress.find((item) => item.lessonId === parsedLessonId) ?? null,
    [parsedLessonId, progress]
  );

  const quizProgressByQuizId = useMemo(
    () =>
      new Map(
        progress.filter((item) => item.quizId != null).map((item) => [item.quizId as number, item])
      ),
    [progress]
  );

  const { data: relatedQuizzes = [], isLoading: isQuizLoading } = useQuery({
    queryKey: ["lesson-quizzes", parsedLessonId],
    queryFn: async () => {
      if (!Number.isFinite(parsedLessonId) || !lesson) return [];

      return (await quizApi.getByLesson(parsedLessonId)) as LessonQuiz[];
    },
    enabled: Number.isFinite(parsedLessonId) && !!lesson,
  });

  const progressPercent = useMemo(() => {
    if (!lessonProgress) return 0;
    if (lessonProgress.status === "COMPLETED") return 100;
    if ((lessonProgress.score ?? 0) > 0 && (lessonProgress.totalScore ?? 0) > 0) {
      return Math.max(
        0,
        Math.min(
          100,
          Math.round(((lessonProgress.score ?? 0) * 100) / (lessonProgress.totalScore ?? 1))
        )
      );
    }
    return lessonProgress.status === "IN_PROGRESS" ? 55 : 0;
  }, [lessonProgress]);

  const upcomingLesson = useMemo(() => {
    if (!learningPath?.recommendedLessons?.length) return null;
    return learningPath.recommendedLessons.find((item) => item.id !== parsedLessonId) ?? null;
  }, [learningPath?.recommendedLessons, parsedLessonId]);

  useEffect(() => {
    setNoteText(lessonProgress?.notes ?? "");
  }, [lessonProgress?.notes]);

  useEffect(() => {
    lessonSessionIdRef.current = createLessonSessionId();
    lessonOpenedAtRef.current = Date.now();
    startedInSessionRef.current = false;
    completedInSessionRef.current = false;
  }, [parsedLessonId]);

  useEffect(() => {
    completedInSessionRef.current = lessonProgress?.status === "COMPLETED";
  }, [lessonProgress?.status]);

  const trackLessonEvent = (
    payload: Omit<
      LearningAnalyticsEventPayload,
      "contentType" | "contentId" | "sessionId" | "jlptLevel"
    >
  ) => {
    if (!lesson) return;

    void learningAnalyticsApi
      .trackEvent({
        ...payload,
        contentType: "LESSON",
        contentId: lesson.id,
        sessionId: lessonSessionIdRef.current,
        jlptLevel: lesson.jlptLevel,
      })
      .catch(() => undefined);
  };

  const saveProgress = async (
    status: "IN_PROGRESS" | "COMPLETED",
    options?: { score?: number; silent?: boolean }
  ) => {
    if (!lesson || !user) return;

    const payload = {
      lessonId: lesson.id,
      score: options?.score ?? (status === "COMPLETED" ? 100 : (lessonProgress?.score ?? 0)),
      totalScore: 100,
      status,
      notes: noteText.trim(),
    } as const;

    try {
      if (lessonProgress?.id) {
        await progressApi.update(lessonProgress.id, payload);
      } else {
        await progressApi.createForUser(user.id, payload);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["progress", "me"] }),
        queryClient.invalidateQueries({ queryKey: ["learning-path"] }),
      ]);

      if (status === "IN_PROGRESS") {
        const shouldTrackStart =
          !startedInSessionRef.current &&
          lessonProgress?.status !== "IN_PROGRESS" &&
          lessonProgress?.status !== "COMPLETED";

        if (shouldTrackStart) {
          startedInSessionRef.current = true;
          trackLessonEvent({
            eventType: "START_LEARNING",
            durationSeconds: 0,
            score: payload.score,
          });
        }
      }

      if (status === "COMPLETED" && !completedInSessionRef.current) {
        if (!startedInSessionRef.current) {
          startedInSessionRef.current = true;
          trackLessonEvent({
            eventType: "START_LEARNING",
            durationSeconds: 0,
            score: payload.score,
          });
        }

        completedInSessionRef.current = true;
        trackLessonEvent({
          eventType: "COMPLETE_LESSON",
          durationSeconds: Math.max(0, Math.round((Date.now() - lessonOpenedAtRef.current) / 1000)),
          score: options?.score ?? payload.score,
        });
      }

      if (!options?.silent) {
        toast({
          title: status === "COMPLETED" ? "Da hoan thanh bai hoc" : "Da bat dau bai hoc",
          description:
            status === "COMPLETED"
              ? "Tien do va goi y hoc da duoc cap nhat."
              : "Ban co the quay lai hoc tiep bat cu luc nao.",
        });
      }
    } catch {
      toast({
        title: "Khong luu duoc tien do",
        description: "Vui long thu lai.",
        variant: "destructive",
      });
    }
  };

  const saveNote = async () => {
    if (!lesson || !user || !lessonProgress?.id) return;

    try {
      await progressApi.update(lessonProgress.id, {
        lessonId: lesson.id,
        score: lessonProgress.score ?? 0,
        totalScore: lessonProgress.totalScore ?? 100,
        status: lessonProgress.status,
        notes: noteText.trim(),
      });
      await queryClient.invalidateQueries({ queryKey: ["progress", "me"] });
      toast({ title: "Da luu ghi chu", description: "Ghi chu hoc bai da duoc cap nhat." });
    } catch {
      toast({
        title: "Khong luu duoc ghi chu",
        description: "Vui long thu lai.",
        variant: "destructive",
      });
    }
  };

  const submitCheckpointQuiz = async () => {
    if (!lesson || !user || relatedQuizzes.length === 0) return;

    const unanswered = relatedQuizzes.some((quiz) => !quizAnswers[quiz.id]);
    if (unanswered) {
      toast({
        title: "Chua hoan thanh checkpoint",
        description: "Hay chon dap an cho tat ca cau hoi truoc khi cham.",
      });
      return;
    }

    setGradingQuiz(true);
    try {
      if (!startedInSessionRef.current) {
        startedInSessionRef.current = true;
        trackLessonEvent({ eventType: "START_LEARNING", durationSeconds: 0 });
      }

      const correctCount = relatedQuizzes.filter(
        (quiz) => quizAnswers[quiz.id] === quiz.correctAnswer
      ).length;
      const score = Math.round((correctCount / relatedQuizzes.length) * 100);
      const passed = score >= 70;

      const analyticsEvents: LearningAnalyticsEventPayload[] = relatedQuizzes.flatMap(
        (quiz): LearningAnalyticsEventPayload[] => {
          const selectedAnswer = quizAnswers[quiz.id];
          const isCorrect = selectedAnswer === quiz.correctAnswer;
          const existing = quizProgressByQuizId.get(quiz.id);

          if (!isCorrect) {
            return [
              {
                eventType: "QUIZ_WRONG",
                contentType: "LESSON",
                contentId: lesson.id,
                sessionId: lessonSessionIdRef.current,
                jlptLevel: lesson.jlptLevel,
                score: 0,
                metadata: {
                  quizId: quiz.id,
                  selectedAnswer,
                },
              },
            ];
          }

          if ((existing?.score ?? null) === 0) {
            return [
              {
                eventType: "QUIZ_CORRECT_AFTER_REVIEW",
                contentType: "LESSON",
                contentId: lesson.id,
                sessionId: lessonSessionIdRef.current,
                jlptLevel: lesson.jlptLevel,
                score: 100,
                metadata: {
                  quizId: quiz.id,
                },
              },
            ];
          }

          return [];
        }
      );

      await Promise.all(
        relatedQuizzes.map(async (quiz) => {
          const existing = quizProgressByQuizId.get(quiz.id);
          const payload = {
            quizId: quiz.id,
            score: quizAnswers[quiz.id] === quiz.correctAnswer ? 100 : 0,
            totalScore: 100,
            status: passed ? "COMPLETED" : "IN_PROGRESS",
            notes: `Lesson checkpoint score: ${score}%`,
          } as const;

          if (existing?.id) {
            await progressApi.update(existing.id, payload);
          } else {
            await progressApi.createForUser(user.id, payload);
          }
        })
      );

      setQuizScore(score);
      setQuizPassed(passed);

      if (passed) {
        await saveProgress("COMPLETED", { score, silent: true });
      } else {
        await saveProgress("IN_PROGRESS", { score, silent: true });
      }

      if (analyticsEvents.length > 0) {
        void Promise.allSettled(
          analyticsEvents.map((event) => learningAnalyticsApi.trackEvent(event))
        );
      }

      await queryClient.invalidateQueries({ queryKey: ["progress", "me"] });
      toast({
        title: passed ? "Checkpoint dat yeu cau" : "Checkpoint chua dat",
        description: passed
          ? `Ban dat ${score}%. Lesson da duoc hoan thanh.`
          : `Ban dat ${score}%. Hay doc lai bai va thu lai quiz.`,
      });
    } catch {
      toast({
        title: "Khong cham duoc checkpoint",
        description: "Vui long thu lai.",
        variant: "destructive",
      });
    } finally {
      setGradingQuiz(false);
    }
  };

  useEffect(() => {
    return () => {
      if (!lessonEntityId || !startedInSessionRef.current || completedInSessionRef.current) {
        return;
      }

      void learningAnalyticsApi
        .trackEvent({
          eventType: "ABANDON_LESSON",
          contentType: "LESSON",
          contentId: lessonEntityId,
          sessionId: lessonSessionIdRef.current,
          jlptLevel: lessonJlptLevel,
          durationSeconds: Math.max(0, Math.round((Date.now() - lessonOpenedAtRef.current) / 1000)),
        })
        .catch(() => undefined);
    };
  }, [lessonEntityId, lessonJlptLevel]);

  if (!Number.isFinite(parsedLessonId)) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-[1200px]">
          <EmptyState
            title="Lesson khong hop le"
            description="Khong tim thay bai hoc ban muon mo."
            icon={<BookOpen className="h-6 w-6" />}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1240px]">
        <PageHeader
          eyebrow="Lesson"
          icon={<BookOpen className="h-6 w-6 text-sky-600" />}
          title={lesson?.title || "Dang tai bai hoc"}
          description={
            lesson?.description || "Noi dung bai hoc va tien do hoc se hien thi tai day."
          }
          action={
            <>
              <Button
                className="rounded-2xl border-border bg-card text-foreground/80"
                onClick={() => navigate("/jlpt-lessons")}
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ve danh sach
              </Button>
              <Button
                className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400"
                disabled={!lesson || !user || isProgressLoading}
                onClick={() => void saveProgress("IN_PROGRESS")}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                {lessonProgress?.status === "IN_PROGRESS" ? "Dang hoc" : "Bat dau"}
              </Button>
              <Button
                className="rounded-2xl bg-emerald-500 text-white hover:bg-emerald-400"
                disabled={!lesson || !user || isProgressLoading}
                onClick={() => void saveProgress("COMPLETED")}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Danh dau xong
              </Button>
            </>
          }
        />

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <MetricCard
            label="Trang thai"
            value={isProgressLoading ? "..." : formatStatus(lessonProgress?.status)}
            icon={<Target className="h-4 w-4 text-sky-500" />}
            hint="Theo tien do cua ban"
          />
          <MetricCard
            label="Tien do"
            value={isProgressLoading ? "..." : `${progressPercent}%`}
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            hint="Cap nhat sau moi lan hoc"
          />
          <MetricCard
            label="Thoi luong"
            value={lesson ? `${estimateMinutes(lesson.content)} phut` : "..."}
            icon={<Clock3 className="h-4 w-4 text-amber-500" />}
            hint="Uoc tinh theo do dai noi dung"
          />
          <MetricCard
            label="JLPT"
            value={lesson?.jlptLevel || "N5"}
            icon={<BookOpen className="h-4 w-4 text-violet-500" />}
            hint={lesson?.category || "Lesson"}
          />
        </div>

        {isLoading ? (
          <div className="rounded-[28px] border border-white bg-card/70 p-10">
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-100 border-t-sky-500" />
            </div>
          </div>
        ) : !lesson ? (
          <EmptyState
            title="Khong tim thay bai hoc"
            description="Bai hoc nay co the da bi xoa hoac chua duoc xuat ban."
            icon={<BookOpen className="h-6 w-6" />}
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
            <LessonOverviewPanel
              lesson={lesson as ComponentProps<typeof LessonOverviewPanel>["lesson"]}
              lessonProgress={lessonProgress}
              noteText={noteText}
              upcomingLesson={
                upcomingLesson as ComponentProps<typeof LessonOverviewPanel>["upcomingLesson"]
              }
              onNoteChange={setNoteText}
              onSaveNote={() => void saveNote()}
            />
            <LessonContentPanel
              lesson={lesson as ComponentProps<typeof LessonContentPanel>["lesson"]}
              progressPercent={progressPercent}
              relatedQuizzes={relatedQuizzes}
              isQuizLoading={isQuizLoading}
              quizAnswers={quizAnswers}
              quizScore={quizScore}
              quizPassed={quizPassed}
              gradingQuiz={gradingQuiz}
              onAnswerChange={(quizId, value) =>
                setQuizAnswers((prev) => ({ ...prev, [quizId]: value }))
              }
              onSubmitCheckpoint={() => void submitCheckpointQuiz()}
              onResetQuiz={() => {
                setQuizAnswers({});
                setQuizScore(null);
                setQuizPassed(null);
              }}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LessonDetail;
