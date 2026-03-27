import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, PlayCircle, Target } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { progressApi, quizApi } from "@/api";
import { useMyProgress } from "@/hooks/learning/useProgress";
import { useLearningPath } from "@/hooks/learning/useLearningPath";
import { useLesson } from "@/hooks/learning/useLessons";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const formatStatus = (status?: string | null) => {
  switch (status) {
    case "COMPLETED":
      return "Da hoan thanh";
    case "IN_PROGRESS":
      return "Dang hoc";
    default:
      return "Chua bat dau";
  }
};

const estimateMinutes = (content?: string | null) => {
  const length = content?.length ?? 0;
  if (length > 5000) return 20;
  if (length > 2500) return 16;
  return 12;
};

const parseQuizOptions = (value?: string | null): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
  } catch {
    return [];
  }
};

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

const LessonDetail = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const parsedLessonId = Number(lessonId);
  const [noteText, setNoteText] = useState("");

  const { data: lesson, isLoading } = useLesson(Number.isFinite(parsedLessonId) ? parsedLessonId : undefined);
  const { data: progress = [], isLoading: isProgressLoading } = useMyProgress();
  const { data: learningPath } = useLearningPath();
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizPassed, setQuizPassed] = useState<boolean | null>(null);
  const [gradingQuiz, setGradingQuiz] = useState(false);

  const lessonProgress = useMemo(
    () => progress.find((item) => item.lessonId === parsedLessonId) ?? null,
    [parsedLessonId, progress]
  );

  const quizProgressByQuizId = useMemo(
    () =>
      new Map(
        progress
          .filter((item) => item.quizId != null)
          .map((item) => [item.quizId as number, item])
      ),
    [progress]
  );

  const { data: relatedQuizzes = [], isLoading: isQuizLoading } = useQuery({
    queryKey: ["lesson-quizzes", parsedLessonId],
    queryFn: async () => {
      if (!Number.isFinite(parsedLessonId) || !lesson) return [];

      const linked = (await quizApi.getByLesson(parsedLessonId)) as LessonQuiz[];
      if (linked.length > 0) return linked;

      const fallback = (await quizApi.getByLevel(lesson.jlptLevel || "N5")) as LessonQuiz[];
      return fallback.slice(0, 3);
    },
    enabled: Number.isFinite(parsedLessonId) && !!lesson,
  });

  const progressPercent = useMemo(() => {
    if (!lessonProgress) return 0;
    if (lessonProgress.status === "COMPLETED") return 100;
    if ((lessonProgress.score ?? 0) > 0 && (lessonProgress.totalScore ?? 0) > 0) {
      return Math.max(0, Math.min(100, Math.round(((lessonProgress.score ?? 0) * 100) / (lessonProgress.totalScore ?? 1))));
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

  const saveProgress = async (
    status: "IN_PROGRESS" | "COMPLETED",
    options?: { score?: number; silent?: boolean }
  ) => {
    if (!lesson || !user) return;

    const payload = {
      lessonId: lesson.id,
      score: options?.score ?? (status === "COMPLETED" ? 100 : lessonProgress?.score ?? 0),
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

      if (!options?.silent) {
        toast({
          title: status === "COMPLETED" ? "Da hoan thanh bai hoc" : "Da bat dau bai hoc",
          description: status === "COMPLETED" ? "Tien do va goi y hoc da duoc cap nhat." : "Ban co the quay lai hoc tiep bat cu luc nao.",
        });
      }
    } catch {
      toast({ title: "Khong luu duoc tien do", description: "Vui long thu lai.", variant: "destructive" });
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
      toast({ title: "Khong luu duoc ghi chu", description: "Vui long thu lai.", variant: "destructive" });
    }
  };

  const submitCheckpointQuiz = async () => {
    if (!lesson || !user || relatedQuizzes.length === 0) return;

    const unanswered = relatedQuizzes.some((quiz) => !quizAnswers[quiz.id]);
    if (unanswered) {
      toast({ title: "Chua hoan thanh checkpoint", description: "Hay chon dap an cho tat ca cau hoi truoc khi cham." });
      return;
    }

    setGradingQuiz(true);
    try {
      const correctCount = relatedQuizzes.filter((quiz) => quizAnswers[quiz.id] === quiz.correctAnswer).length;
      const score = Math.round((correctCount / relatedQuizzes.length) * 100);
      const passed = score >= 70;

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

      await queryClient.invalidateQueries({ queryKey: ["progress", "me"] });
      toast({
        title: passed ? "Checkpoint dat yeu cau" : "Checkpoint chua dat",
        description: passed ? `Ban dat ${score}%. Lesson da duoc hoan thanh.` : `Ban dat ${score}%. Hay doc lai bai va thu lai quiz.`,
      });
    } catch {
      toast({ title: "Khong cham duoc checkpoint", description: "Vui long thu lai.", variant: "destructive" });
    } finally {
      setGradingQuiz(false);
    }
  };

  if (!Number.isFinite(parsedLessonId)) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-[1200px]">
          <EmptyState title="Lesson khong hop le" description="Khong tim thay bai hoc ban muon mo." icon={<BookOpen className="h-6 w-6" />} />
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
          description={lesson?.description || "Noi dung bai hoc va tien do hoc se hien thi tai day."}
          action={
            <>
              <Button className="rounded-2xl border-border bg-card text-foreground/80" onClick={() => navigate("/jlpt-lessons")} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ve danh sach
              </Button>
              <Button className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400" disabled={!lesson || !user || isProgressLoading} onClick={() => void saveProgress("IN_PROGRESS")}>
                <PlayCircle className="mr-2 h-4 w-4" />
                {lessonProgress?.status === "IN_PROGRESS" ? "Dang hoc" : "Bat dau"}
              </Button>
              <Button className="rounded-2xl bg-emerald-500 text-white hover:bg-emerald-400" disabled={!lesson || !user || isProgressLoading} onClick={() => void saveProgress("COMPLETED")}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Danh dau xong
              </Button>
            </>
          }
        />

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <MetricCard label="Trang thai" value={isProgressLoading ? "..." : formatStatus(lessonProgress?.status)} icon={<Target className="h-4 w-4 text-sky-500" />} hint="Theo tien do cua ban" />
          <MetricCard label="Tien do" value={isProgressLoading ? "..." : `${progressPercent}%`} icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} hint="Cap nhat sau moi lan hoc" />
          <MetricCard label="Thoi luong" value={lesson ? `${estimateMinutes(lesson.content)} phut` : "..."} icon={<Clock3 className="h-4 w-4 text-amber-500" />} hint="Uoc tinh theo do dai noi dung" />
          <MetricCard label="JLPT" value={lesson?.jlptLevel || "N5"} icon={<BookOpen className="h-4 w-4 text-violet-500" />} hint={lesson?.category || "Lesson"} />
        </div>

        {isLoading ? (
          <PageSection title="Dang tai">
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-100 border-t-sky-500" />
            </div>
          </PageSection>
        ) : !lesson ? (
          <EmptyState title="Khong tim thay bai hoc" description="Bai hoc nay co the da bi xoa hoac chua duoc xuat ban." icon={<BookOpen className="h-6 w-6" />} />
        ) : (
          <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
            <PageSection title="Tong quan bai hoc" description="Day la noi ban co the bat dau, tiep tuc va danh dau hoan thanh bai hoc.">
              <div className="space-y-4">
                <div className="rounded-[20px] border border-border bg-card p-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">{lesson.jlptLevel || "N5"}</Badge>
                    {lesson.category ? <Badge className="rounded-full border border-border bg-muted text-muted-foreground">{lesson.category}</Badge> : null}
                    {lesson.status ? <Badge className="rounded-full border border-border bg-white text-foreground/70">{lesson.status}</Badge> : null}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-foreground/80">
                    {lesson.description || "Bai hoc nay chua co mo ta ngan. Ban co the vao thang noi dung ben phai de hoc ngay."}
                  </p>
                </div>

                <div className="rounded-[20px] border border-emerald-200 bg-emerald-50/70 p-4">
                  <p className="text-sm font-semibold text-emerald-800">Nhip hoc goi y</p>
                  <p className="mt-1 text-sm text-foreground/80">
                    Bat dau bai hoc de dua no vao luong ca nhan hoa, va danh dau hoan thanh khi hoc xong de dashboard cap nhat bai tiep theo.
                  </p>
                </div>

                {(lesson.audioUrl || lesson.videoUrl || lesson.imageUrl) && (
                  <div className="rounded-[20px] border border-border bg-card p-4">
                    <p className="text-sm font-semibold text-foreground">Tai nguyen di kem</p>
                    <div className="mt-3 space-y-3">
                      {lesson.imageUrl ? <img alt={lesson.title} className="w-full rounded-2xl border border-border object-cover" src={lesson.imageUrl} /> : null}
                      {lesson.audioUrl ? <audio className="w-full" controls src={lesson.audioUrl} /> : null}
                      {lesson.videoUrl ? <video className="w-full rounded-2xl border border-border" controls src={lesson.videoUrl} /> : null}
                    </div>
                  </div>
                )}

                <div className="rounded-[20px] border border-border bg-card p-4">
                  <p className="text-sm font-semibold text-foreground">Ghi chu ca nhan</p>
                  <Textarea
                    className="mt-3 min-h-[120px] rounded-[18px] border-border bg-background/60"
                    disabled={!lessonProgress}
                    onChange={(event) => setNoteText(event.target.value)}
                    placeholder={lessonProgress ? "Tom tat diem can nho, tu moi, hoac cau can on lai." : "Bat dau lesson truoc de luu ghi chu hoc bai."}
                    value={noteText}
                  />
                  <Button className="mt-3 rounded-2xl" disabled={!lessonProgress} onClick={() => void saveNote()}>
                    Luu ghi chu
                  </Button>
                </div>

                <Link to="/my-words" className="block rounded-[20px] border border-amber-200 bg-amber-50/70 p-4 text-sm text-foreground/80">
                  Sau khi hoc xong, ban co the quay sang so tay tu vung de review bang spaced repetition.
                </Link>

                {upcomingLesson ? (
                  <Link to={`/lessons/${upcomingLesson.id}`} className="block rounded-[20px] border border-sky-200 bg-sky-50/70 p-4 text-sm text-foreground/80">
                    Bai tiep theo goi y: <span className="font-semibold text-sky-700">{upcomingLesson.title}</span>
                  </Link>
                ) : null}
              </div>
            </PageSection>

            <PageSection title="Noi dung bai hoc" description="Phien ban doc nhanh cho flow hoc co the tiep tuc ngay trong du an hien tai.">
              {lesson.content ? (
                <div className="space-y-4">
                  <div className="rounded-[22px] border border-border bg-card p-5">
                    <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,#60a5fa,#22d3ee)]" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-7 text-foreground/85">{lesson.content}</div>
                  </div>

                  <div className="rounded-[22px] border border-amber-200 bg-amber-50/70 p-5">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Lesson checkpoint quiz</h3>
                        <p className="mt-1 text-sm text-foreground/75">Hoan thanh quiz nay de he thong tu dong chot completion cho lesson.</p>
                      </div>
                      {quizScore != null ? (
                        <Badge className={quizPassed ? "rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700" : "rounded-full border border-rose-200 bg-rose-50 text-rose-700"}>
                          {quizScore}%
                        </Badge>
                      ) : null}
                    </div>

                    {isQuizLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-100 border-t-amber-500" />
                      </div>
                    ) : relatedQuizzes.length === 0 ? (
                      <EmptyState title="Chua co checkpoint quiz" description="Hay lien ket quiz voi lesson trong CMS de flow completion day du hon." icon={<Target className="h-6 w-6" />} />
                    ) : (
                      <div className="space-y-4">
                        {relatedQuizzes.map((quiz, index) => {
                          const options = parseQuizOptions(quiz.options);
                          const selected = quizAnswers[quiz.id];

                          return (
                            <div key={quiz.id} className="rounded-[20px] border border-amber-200 bg-white/80 p-4">
                              <p className="text-sm font-semibold text-foreground">
                                Cau {index + 1}: {quiz.title}
                              </p>
                              <p className="mt-2 text-sm text-foreground/80">{quiz.question}</p>

                              <div className="mt-3 grid gap-2">
                                {options.map((option) => {
                                  const active = selected === option;
                                  return (
                                    <button
                                      key={`${quiz.id}-${option}`}
                                      type="button"
                                      onClick={() => setQuizAnswers((prev) => ({ ...prev, [quiz.id]: option }))}
                                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                                        active ? "border-amber-300 bg-amber-100 text-amber-900" : "border-border bg-card text-foreground/80 hover:bg-muted"
                                      }`}
                                    >
                                      {option}
                                    </button>
                                  );
                                })}
                              </div>

                              {quizScore != null ? (
                                <p className="mt-3 text-xs text-muted-foreground">
                                  Dap an dung: {quiz.correctAnswer}. {quiz.explanation || "Khong co giai thich bo sung."}
                                </p>
                              ) : null}
                            </div>
                          );
                        })}

                        <div className="flex flex-wrap gap-2">
                          <Button className="rounded-2xl bg-amber-500 text-white hover:bg-amber-400" disabled={gradingQuiz} onClick={() => void submitCheckpointQuiz()}>
                            Cham checkpoint
                          </Button>
                          {quizPassed === false ? (
                            <Button className="rounded-2xl" disabled={gradingQuiz} onClick={() => { setQuizAnswers({}); setQuizScore(null); setQuizPassed(null); }} variant="outline">
                              Lam lai
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <EmptyState title="Noi dung dang trong" description="Lesson da ton tai nhung chua co content de hoc." icon={<BookOpen className="h-6 w-6" />} />
              )}
            </PageSection>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LessonDetail;
