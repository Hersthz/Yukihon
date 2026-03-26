import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, BookOpen, GraduationCap, PlayCircle, Target, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LessonCard2 from "@/components/learning/LessonCard2";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Button } from "@/components/ui/button";
import { useLearningPath } from "@/hooks/learning/useLearningPath";
import { usePublishedLessons } from "@/hooks/learning/useLessons";
import { useMyProgress } from "@/hooks/learning/useProgress";

const LEVELS = ["N5", "N4", "N3", "N2", "N1"];

interface LessonSummary {
  id: number;
  title: string;
  description?: string;
  jlptLevel?: string;
  imageUrl?: string;
}

const levelTone: Record<string, string> = {
  N5: "bg-emerald-50 border-emerald-200 text-emerald-700",
  N4: "bg-sky-50 border-sky-200 text-sky-700",
  N3: "bg-violet-50 border-violet-200 text-violet-700",
  N2: "bg-amber-50 border-amber-200 text-amber-700",
  N1: "bg-rose-50 border-rose-200 text-rose-700",
};

const JLPTLessons = () => {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState("N4");
  const { data: allLessons = [], isLoading } = usePublishedLessons();
  const { data: learningPath } = useLearningPath();
  const { data: progressItems = [] } = useMyProgress();

  useEffect(() => {
    if (learningPath?.targetJlptLevel) {
      setSelectedLevel(learningPath.targetJlptLevel);
    }
  }, [learningPath?.targetJlptLevel]);

  const lessonsByLevel = useMemo(() => {
    return (allLessons as LessonSummary[]).reduce((acc: Record<string, LessonSummary[]>, lesson) => {
      const level = lesson.jlptLevel || "N4";
      if (!acc[level]) acc[level] = [];
      acc[level].push(lesson);
      return acc;
    }, {});
  }, [allLessons]);

  const currentLevelLessons = lessonsByLevel[selectedLevel] || [];
  const progressByLessonId = useMemo(() => {
    return new Map(
      progressItems
        .filter((item) => item.lessonId != null)
        .map((item) => [item.lessonId as number, item])
    );
  }, [progressItems]);

  const completedCount = currentLevelLessons.filter((lesson) => progressByLessonId.get(lesson.id)?.status === "COMPLETED").length;
  const progress = currentLevelLessons.length ? Math.round((completedCount / currentLevelLessons.length) * 100) : 0;
  const nextLessonId = learningPath?.nextLesson?.id;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1420px]">
        <PageHeader
          icon={<GraduationCap className="h-6 w-6 text-sky-600" />}
          title="JLPT"
          description="Rút gọn bố cục để bạn nhìn được level, tiến độ và danh sách bài ngay trong một vùng gọn hơn."
          eyebrow="JLPT Path"
          action={
            <Button className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400" onClick={() => navigate(nextLessonId ? `/lessons/${nextLessonId}` : "/jlpt-lessons")}>
              <PlayCircle className="mr-2 h-4 w-4" />
              {nextLessonId ? "Hoc tiep bai goi y" : "Bat dau lo trinh"}
            </Button>
          }
        />

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricCard hint="Theo level hiện tại" icon={<BookOpen className="h-4 w-4 text-sky-500" />} label="Bài học" value={currentLevelLessons.length} />
          <MetricCard hint="Khi bắt đầu hoàn thành" icon={<Award className="h-4 w-4 text-emerald-500" />} label="Đã xong" value={completedCount} />
          <MetricCard hint="Tổng quan nhanh" icon={<TrendingUp className="h-4 w-4 text-violet-500" />} label="Tiến độ" value={`${progress}%`} />
        </div>

        <PageSection className="mb-4" title="Chọn cấp độ" description="Filter ngang gọn thay cho block lớn, giúp chừa diện tích cho danh sách bài.">
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((level) => {
              const active = selectedLevel === level;
              return (
                <button
                  key={level}
                  className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                    active ? `${levelTone[level]} shadow-[0_10px_20px_rgba(148,163,184,0.10)]` : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setSelectedLevel(level)}
                  type="button"
                >
                  {level}
                </button>
              );
            })}
          </div>
        </PageSection>

        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <PageSection title={`Mục tiêu ${selectedLevel}`} description="Một overview nhỏ để nhắc nhịp học trước khi vào danh sách bài.">
            <div className="space-y-4">
              <div className="rounded-[20px] border border-sky-200 bg-sky-50/80 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-sky-700">Tập trung hôm nay</p>
                <p className="mt-2 text-sm leading-6 text-foreground/80">
                  {learningPath?.recommendationSummary || "Học 1 bài mới, ôn 10 từ và giữ nhịp đều thay vì mở quá nhiều module cùng lúc."}
                </p>
              </div>
              <div className="rounded-[20px] border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tổng quát level</span>
                  <span className="font-medium text-sky-700">{progress}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    className="h-full rounded-full bg-[linear-gradient(90deg,#60a5fa,#22d3ee)]"
                    initial={{ width: 0 }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
              <div className="rounded-[20px] border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <Target className="mt-1 h-5 w-5 text-violet-500" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Nhịp học đề xuất</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {learningPath?.dailyGoalMinutes
                        ? `${learningPath.dailyGoalMinutes} phút mỗi phiên để bám sát mục tiêu ${learningPath.targetJlptLevel}.`
                        : "15 đến 20 phút một phiên để nhìn được toàn bộ lộ trình mà không bị quá tải."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </PageSection>

          <PageSection title="Danh sách bài học" description="Card sáng, thấp và đều giúp quét nhanh hơn trên màn hình rộng.">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-12 w-12 rounded-full border-4 border-sky-100 border-t-sky-500 animate-spin" />
              </div>
            ) : currentLevelLessons.length === 0 ? (
              <EmptyState
                description={`Hiện chưa có nội dung cho ${selectedLevel}. Khi có bài mới, chúng sẽ hiển thị ở đây.`}
                icon={<GraduationCap className="h-6 w-6" />}
                title="Chưa có bài học"
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {currentLevelLessons.map((lesson) => (
                  <LessonCard2
                    estimatedTime={20}
                    key={lesson.id}
                    lesson={lesson}
                    isCompleted={progressByLessonId.get(lesson.id)?.status === "COMPLETED"}
                    onStart={(id) => navigate(`/lessons/${id}`)}
                  />
                ))}
              </div>
            )}
          </PageSection>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JLPTLessons;
