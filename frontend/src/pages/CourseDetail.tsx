import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckCircle2, Clock, Play } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePublishedLessons } from "@/hooks/learning/useLessons";
import { useMyProgress } from "@/hooks/learning/useProgress";

interface LessonSummary {
  id: number;
  title: string;
  description?: string;
  jlptLevel?: string;
  category?: string;
}

const COURSE_ALIASES: Record<string, string> = {
  "n5-foundations": "N5",
  "n4-conversations": "N4",
  "n3-fluency": "N3",
  "n2-professional": "N2",
  "n1-mastery": "N1",
};

const COURSE_META: Record<string, { title: string; description: string }> = {
  N5: {
    title: "Nền tảng N5",
    description:
      "Khởi động với các chủ đề nền tảng như chào hỏi, mẫu câu cơ bản và từ vựng thiết yếu.",
  },
  N4: {
    title: "Giao tiếp hằng ngày N4",
    description:
      "Tập trung vào các mẫu giao tiếp đời thường, giúp bạn nhìn rõ đường tiến bộ theo từng bài cụ thể.",
  },
  N3: {
    title: "Xây dựng độ trôi chảy N3",
    description:
      "Các bài trung cấp thiên về diễn đạt tự nhiên, ý kiến cá nhân và đọc hiểu văn bản dài hơn.",
  },
  N2: {
    title: "Tiếng Nhật chuyên nghiệp N2",
    description: "Nội dung nâng cao hơn cho công việc, tin tức, đọc hiểu và giao tiếp chính xác.",
  },
  N1: {
    title: "Thành thạo toàn diện N1",
    description:
      "Lộ trình chuyên sâu cho sắc thái nghĩa, cấu trúc khó và khả năng đọc hiểu tinh tế.",
  },
};

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Hoàn thành",
  IN_PROGRESS: "Đang học",
  NOT_STARTED: "Chưa bắt đầu",
};

const normalizeCourseLevel = (value?: string) => {
  if (!value) return "N4";
  const decoded = decodeURIComponent(value).toUpperCase();
  return COURSE_ALIASES[decoded.toLowerCase()] || decoded;
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const level = normalizeCourseLevel(courseId);
  const meta = COURSE_META[level] || COURSE_META.N4;
  const { data: allLessons = [], isLoading } = usePublishedLessons();
  const { data: progressItems = [] } = useMyProgress();

  const lessons = (allLessons as LessonSummary[]).filter(
    (lesson) => (lesson.jlptLevel || "N5") === level
  );
  const progressByLessonId = new Map(
    progressItems
      .filter((item) => item.lessonId != null)
      .map((item) => [item.lessonId as number, item])
  );
  const completedLessons = lessons.filter(
    (lesson) => progressByLessonId.get(lesson.id)?.status === "COMPLETED"
  ).length;
  const progress = lessons.length ? Math.round((completedLessons / lessons.length) * 100) : 0;
  const totalHours = Math.max(1, Math.ceil((lessons.length * 20) / 60));

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1380px]">
        <PageHeader
          action={
            <Button
              className="rounded-2xl border-border bg-card text-foreground/80 hover:bg-card"
              onClick={() => navigate("/courses")}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại khóa học
            </Button>
          }
          eyebrow="Chi tiết khóa học"
          icon={<BookOpen className="h-6 w-6 text-sky-600" />}
          title={meta.title}
          description={meta.description}
        />

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricCard
            hint="Tổng số bài đã xuất bản"
            icon={<BookOpen className="h-4 w-4 text-sky-500" />}
            label="Bài học"
            value={lessons.length}
          />
          <MetricCard
            hint="Ước tính 20 phút mỗi bài"
            icon={<Clock className="h-4 w-4 text-violet-500" />}
            label="Thời lượng"
            value={`${totalHours} giờ`}
          />
          <MetricCard
            hint="Theo số bài hoàn thành"
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            label="Tiến độ"
            value={`${progress}%`}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <PageSection
            title="Tổng quan khóa học"
            description="Tóm tắt nhanh để bạn nắm bố cục toàn khóa trước khi vào bài."
          >
            <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">
              JLPT {level}
            </Badge>
            <div className="mt-4 rounded-[20px] border border-border bg-card p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Đã hoàn thành</span>
                <span className="font-medium text-sky-700">
                  {completedLessons}/{lessons.length} bài
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#60a5fa,#22d3ee)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="mt-4 rounded-[20px] border border-emerald-200 bg-emerald-50/70 p-4">
              <p className="text-sm font-semibold text-emerald-800">Nhịp học gợi ý</p>
              <p className="mt-1 text-sm leading-6 text-foreground/80">
                Học 1 bài mới và review 1 bài cũ mỗi phiên để giữ trải nghiệm gọn và không bị ngợp.
              </p>
            </div>
          </PageSection>

          <PageSection
            title="Danh sách bài"
            description="Danh sách này lấy từ backend, nên nút học sẽ mở đúng lesson thật."
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-12 w-12 rounded-full border-4 border-sky-100 border-t-sky-500 animate-spin" />
              </div>
            ) : lessons.length === 0 ? (
              <EmptyState
                description={`Hiện chưa có lesson đã xuất bản cho ${level}. Có thể thêm nội dung ở Admin Content.`}
                icon={<BookOpen className="h-6 w-6" />}
                title="Chưa có bài học"
              />
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson, index) => {
                  const progressItem = progressByLessonId.get(lesson.id);
                  const completed = progressItem?.status === "COMPLETED";

                  return (
                    <div
                      key={lesson.id}
                      className="rounded-[22px] border border-white bg-card p-4 shadow-[0_10px_24px_rgba(148,163,184,0.10)]"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${completed ? "bg-emerald-50 text-emerald-600" : "bg-sky-50 text-sky-600"}`}
                          >
                            {completed ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <span className="text-sm font-semibold">{index + 1}</span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-foreground">
                              {lesson.title}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span>20 phút</span>
                              {lesson.category && <span>{lesson.category}</span>}
                              {progressItem?.status && (
                                <span>
                                  {STATUS_LABELS[progressItem.status] ??
                                    progressItem.status.replace("_", " ").toLowerCase()}
                                </span>
                              )}
                            </div>
                            {lesson.description && (
                              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <Link to={`/lessons/${lesson.id}`}>
                          <Button
                            className={
                              completed
                                ? "rounded-2xl border-border bg-white text-foreground/80"
                                : "rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                            }
                            variant={completed ? "outline" : "default"}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            {completed ? "Ôn lại" : "Bắt đầu"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </PageSection>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;
