import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, PlayCircle, Target } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { progressApi } from "@/api";
import { useMyProgress } from "@/hooks/learning/useProgress";
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

const LessonDetail = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const parsedLessonId = Number(lessonId);

  const { data: lesson, isLoading } = useLesson(Number.isFinite(parsedLessonId) ? parsedLessonId : undefined);
  const { data: progress = [], isLoading: isProgressLoading } = useMyProgress();

  const lessonProgress = useMemo(
    () => progress.find((item) => item.lessonId === parsedLessonId) ?? null,
    [parsedLessonId, progress]
  );

  const progressPercent = useMemo(() => {
    if (!lessonProgress) return 0;
    if (lessonProgress.status === "COMPLETED") return 100;
    if ((lessonProgress.score ?? 0) > 0 && (lessonProgress.totalScore ?? 0) > 0) {
      return Math.max(0, Math.min(100, Math.round(((lessonProgress.score ?? 0) * 100) / (lessonProgress.totalScore ?? 1))));
    }
    return lessonProgress.status === "IN_PROGRESS" ? 55 : 0;
  }, [lessonProgress]);

  const saveProgress = async (status: "IN_PROGRESS" | "COMPLETED") => {
    if (!lesson || !user) return;

    const payload = {
      lessonId: lesson.id,
      score: status === "COMPLETED" ? 100 : lessonProgress?.score ?? 0,
      totalScore: 100,
      status,
      notes: lessonProgress?.notes ?? "",
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

      toast({
        title: status === "COMPLETED" ? "Da hoan thanh bai hoc" : "Da bat dau bai hoc",
        description: status === "COMPLETED" ? "Tien do va goi y hoc da duoc cap nhat." : "Ban co the quay lai hoc tiep bat cu luc nao.",
      });
    } catch {
      toast({ title: "Khong luu duoc tien do", description: "Vui long thu lai.", variant: "destructive" });
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

                <Link to="/my-words" className="block rounded-[20px] border border-amber-200 bg-amber-50/70 p-4 text-sm text-foreground/80">
                  Sau khi hoc xong, ban co the quay sang so tay tu vung de review bang spaced repetition.
                </Link>
              </div>
            </PageSection>

            <PageSection title="Noi dung bai hoc" description="Phien ban doc nhanh cho flow hoc co the tiep tuc ngay trong du an hien tai.">
              {lesson.content ? (
                <div className="rounded-[22px] border border-border bg-card p-5">
                  <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#60a5fa,#22d3ee)]" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-7 text-foreground/85">{lesson.content}</div>
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
