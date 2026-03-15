import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckCircle2, Clock, Lock, Play } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  vocabCount: number;
  completed: boolean;
  locked: boolean;
}

interface CourseData {
  id: string;
  title: string;
  level: string;
  description: string;
  lessons: Lesson[];
  totalHours: number;
  progress: number;
}

const mockCourses: Record<string, CourseData> = {
  "n5-foundations": {
    id: "n5-foundations",
    title: "N5 Foundations",
    level: "JLPT N5",
    description: "Khởi động với các chủ đề nền tảng như chào hỏi, số đếm, động từ cơ bản và mốc thời gian thường dùng.",
    totalHours: 20,
    progress: 0,
    lessons: [
      { id: "n5-lesson-1", title: "Greetings & Self Introduction", duration: "15 min", vocabCount: 12, completed: false, locked: false },
      { id: "n5-lesson-2", title: "Numbers 1-100", duration: "20 min", vocabCount: 15, completed: false, locked: true },
      { id: "n5-lesson-3", title: "Basic Verbs: Eat, Drink, Go", duration: "18 min", vocabCount: 10, completed: false, locked: true },
      { id: "n5-lesson-4", title: "Days of the Week", duration: "12 min", vocabCount: 8, completed: false, locked: true },
    ],
  },
  "n4-conversations": {
    id: "n4-conversations",
    title: "N4 Daily Conversations",
    level: "JLPT N4",
    description: "Tập trung vào các mẫu giao tiếp đời thường, giúp bạn nhìn rõ đường tiến bộ theo từng bài cụ thể.",
    totalHours: 28,
    progress: 62,
    lessons: [
      { id: "n4-vocab-01", title: "Daily Conversations: Greetings", duration: "20 min", vocabCount: 12, completed: true, locked: false },
      { id: "n4-lesson-2", title: "Shopping & Money", duration: "25 min", vocabCount: 18, completed: true, locked: false },
      { id: "n4-lesson-3", title: "Directions & Transportation", duration: "22 min", vocabCount: 15, completed: true, locked: false },
      { id: "n4-lesson-4", title: "Restaurant Ordering", duration: "18 min", vocabCount: 14, completed: false, locked: false },
      { id: "n4-lesson-5", title: "Making Appointments", duration: "20 min", vocabCount: 12, completed: false, locked: true },
    ],
  },
  "n3-fluency": {
    id: "n3-fluency",
    title: "N3 Building Fluency",
    level: "JLPT N3",
    description: "Các bài trung cấp thiên về diễn đạt tự nhiên, ý kiến cá nhân và đọc hiểu văn bản dài hơn.",
    totalHours: 35,
    progress: 18,
    lessons: [
      { id: "n3-lesson-1", title: "Expressing Opinions", duration: "25 min", vocabCount: 20, completed: false, locked: false },
      { id: "n3-lesson-2", title: "Formal vs Casual Speech", duration: "30 min", vocabCount: 18, completed: false, locked: true },
      { id: "n3-lesson-3", title: "Reading News Articles", duration: "35 min", vocabCount: 25, completed: false, locked: true },
    ],
  },
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = mockCourses[courseId || ""] || mockCourses["n4-conversations"];
  const completedLessons = course.lessons.filter((lesson) => lesson.completed).length;
  const progress = Math.round((completedLessons / course.lessons.length) * 100);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1380px]">
        <PageHeader
          action={
            <Button className="rounded-2xl border-white/80 bg-white/90 text-slate-700 hover:bg-white" onClick={() => navigate("/courses")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại khóa học
            </Button>
          }
          eyebrow="Course Detail"
          icon={<BookOpen className="h-6 w-6 text-sky-600" />}
          title={course.title}
          description={course.description}
        />

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricCard hint="Tổng số bài trong khóa" icon={<BookOpen className="h-4 w-4 text-sky-500" />} label="Bài học" value={course.lessons.length} />
          <MetricCard hint="Tổng thời lượng ước tính" icon={<Clock className="h-4 w-4 text-violet-500" />} label="Thời lượng" value={`${course.totalHours} giờ`} />
          <MetricCard hint="Theo số bài hoàn thành" icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} label="Tiến độ" value={`${progress}%`} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <PageSection title="Tổng quan khóa học" description="Phần tóm tắt ngắn gọn để bạn nắm bố cục toàn khóa mà không cần lướt nhiều.">
            <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">{course.level}</Badge>
            <div className="mt-4 rounded-[20px] border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">Đã hoàn thành</span>
                <span className="font-medium text-sky-700">
                  {completedLessons}/{course.lessons.length} bài
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,#60a5fa,#22d3ee)]" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="mt-4 rounded-[20px] border border-emerald-200 bg-emerald-50/70 p-4">
              <p className="text-sm font-semibold text-emerald-800">Nhịp học gợi ý</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">Học 1 bài mới và review 1 bài cũ mỗi phiên để giữ trải nghiệm gọn và không bị ngợp.</p>
            </div>
          </PageSection>

          <PageSection title="Danh sách bài" description="Bài học được trình bày thấp hơn và liền mạch hơn để bạn thấy toàn bộ roadmap rõ ràng.">
            <div className="space-y-3">
              {course.lessons.map((lesson, index) => (
                <div key={lesson.id} className="rounded-[22px] border border-white bg-white p-4 shadow-[0_10px_24px_rgba(148,163,184,0.10)]">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                          lesson.completed
                            ? "bg-emerald-50 text-emerald-600"
                            : lesson.locked
                              ? "bg-slate-100 text-slate-400"
                              : "bg-sky-50 text-sky-600"
                        }`}
                      >
                        {lesson.completed ? <CheckCircle2 className="h-5 w-5" /> : lesson.locked ? <Lock className="h-4 w-4" /> : <span className="text-sm font-semibold">{index + 1}</span>}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-900">{lesson.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <span>{lesson.duration}</span>
                          <span>{lesson.vocabCount} từ vựng</span>
                        </div>
                      </div>
                    </div>

                    {!lesson.locked ? (
                      <Link to={`/lessons/${lesson.id}`}>
                        <Button className={lesson.completed ? "rounded-2xl border-slate-200 bg-white text-slate-700" : "rounded-2xl bg-slate-900 text-white hover:bg-slate-800"} variant={lesson.completed ? "outline" : "default"}>
                          <Play className="mr-2 h-4 w-4" />
                          {lesson.completed ? "Ôn lại" : "Bắt đầu"}
                        </Button>
                      </Link>
                    ) : (
                      <Button className="rounded-2xl border-slate-200 bg-slate-100 text-slate-400" disabled variant="outline">
                        <Lock className="mr-2 h-4 w-4" />
                        Khoá
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </PageSection>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;
