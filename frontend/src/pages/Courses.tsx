import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ChevronRight,
  Clock,
  Compass,
  GraduationCap,
  Layers,
  Sparkles,
} from "lucide-react";

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

interface CourseMeta {
  id: string;
  title: string;
  description: string;
  skills: string[];
}

const LEVELS = ["all", "N5", "N4", "N3", "N2", "N1"];

const courseMeta: Record<string, CourseMeta> = {
  N5: {
    id: "N5",
    title: "N5 Foundations",
    description:
      "Bắt đầu từ nền tảng: chào hỏi, mẫu câu cơ bản, từ vựng thiết yếu và nhịp học đầu tiên.",
    skills: ["Vocab", "Grammar", "Kanji"],
  },
  N4: {
    id: "N4",
    title: "N4 Daily Conversations",
    description: "Tập trung vào giao tiếp hằng ngày, hoạt động thường gặp và mẫu câu đời sống.",
    skills: ["Speaking", "Grammar", "Listening"],
  },
  N3: {
    id: "N3",
    title: "N3 Building Fluency",
    description: "Mở rộng vốn từ, đọc hiểu và diễn đạt ý kiến tự nhiên hơn ở trình độ trung cấp.",
    skills: ["Reading", "Listening", "Grammar"],
  },
  N2: {
    id: "N2",
    title: "N2 Professional Japanese",
    description:
      "Đi sâu vào ngữ cảnh công việc, tin tức, văn bản dài và cách diễn đạt chính xác hơn.",
    skills: ["Reading", "Kanji", "Listening"],
  },
  N1: {
    id: "N1",
    title: "N1 Complete Mastery",
    description:
      "Lộ trình nâng cao cho sắc thái nghĩa, đọc hiểu chuyên sâu và năng lực ngôn ngữ tinh tế.",
    skills: ["All skills"],
  },
};

const levelTone: Record<string, string> = {
  N5: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  N4: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  N3: "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400",
  N2: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  N1: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const estimateHours = (lessonCount: number) => Math.max(1, Math.ceil((lessonCount * 20) / 60));

const Courses = () => {
  const [selectedLevel, setSelectedLevel] = useState("all");
  const { data: allLessons = [], isLoading: isLessonLoading } = usePublishedLessons();
  const { data: progressItems = [] } = useMyProgress();

  const progressByLessonId = useMemo(() => {
    return new Map(
      progressItems
        .filter((item) => item.lessonId != null)
        .map((item) => [item.lessonId as number, item])
    );
  }, [progressItems]);

  const courses = useMemo(() => {
    const lessonsByLevel = (allLessons as LessonSummary[]).reduce<Record<string, LessonSummary[]>>(
      (acc, lesson) => {
        const level = lesson.jlptLevel || "N5";
        if (!acc[level]) acc[level] = [];
        acc[level].push(lesson);
        return acc;
      },
      {}
    );

    return Object.values(courseMeta).map((meta) => {
      const lessons = lessonsByLevel[meta.id] || [];
      const completed = lessons.filter(
        (lesson) => progressByLessonId.get(lesson.id)?.status === "COMPLETED"
      ).length;
      const progress = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;

      return {
        ...meta,
        level: `JLPT ${meta.id}`,
        lessons,
        lessonCount: lessons.length,
        completed,
        hours: estimateHours(lessons.length),
        progress,
      };
    });
  }, [allLessons, progressByLessonId]);

  const filteredCourses = useMemo(() => {
    return selectedLevel === "all"
      ? courses
      : courses.filter((course) => course.id === selectedLevel);
  }, [courses, selectedLevel]);

  const activeCourses = courses.filter((course) => course.progress > 0).length;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1420px]">
        <PageHeader
          icon={<GraduationCap className="h-6 w-6 text-primary" />}
          title="Khóa học"
          description="Danh mục khóa học được kết nối từ lesson đã xuất bản, giúp bạn đi từ lộ trình tổng quan vào từng bài thật."
          eyebrow="Courses"
        />

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricCard
            hint="Theo các cấp JLPT có trong hệ thống"
            icon={<BookOpen className="h-4 w-4 text-sky-500" />}
            label="Khóa học"
            value={courses.length}
          />
          <MetricCard
            hint="Bộ lọc đang mở"
            icon={<Layers className="h-4 w-4 text-primary" />}
            label="Mức JLPT"
            value={selectedLevel === "all" ? "Tất cả" : selectedLevel}
          />
          <MetricCard
            hint="Có tiến độ học từ backend"
            icon={<Sparkles className="h-4 w-4 text-emerald-500" />}
            label="Đang theo học"
            value={activeCourses}
          />
        </div>

        <PageSection
          className="mb-4"
          title="Bộ lọc level"
          description="Chọn cấp JLPT để lọc danh sách khóa học."
        >
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((level) => {
              const active = selectedLevel === level;
              return (
                <button
                  key={level}
                  className={`rounded-2xl border-2 px-4 py-2 text-sm font-medium transition cursor-pointer ${
                    active
                      ? level === "all"
                        ? "border-primary bg-primary/10 text-primary"
                        : levelTone[level]
                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => setSelectedLevel(level)}
                  type="button"
                >
                  {level === "all" ? "Tất cả" : level}
                </button>
              );
            })}
          </div>
        </PageSection>

        <PageSection
          title="Danh sách khóa học"
          description="Mỗi khóa gom các lesson cùng cấp JLPT, có tiến độ và đường vào bài học thật."
        >
          {isLessonLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <EmptyState
              description="Thử chọn lại level khác để mở rộng danh sách."
              icon={<Compass className="h-6 w-6" />}
              title="Không có khóa học phù hợp"
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => (
                <div key={course.id} className="yukihon-card-flat p-4 cursor-default">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{course.title}</h3>
                      <Badge
                        className={`mt-2 rounded-full border ${levelTone[course.id] || "border-border bg-muted text-foreground"}`}
                      >
                        {course.level}
                      </Badge>
                    </div>
                    {course.progress > 0 && (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {course.progress}%
                      </span>
                    )}
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">{course.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {course.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.lessonCount} bài
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.hours} giờ
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Tiến độ</span>
                      <span>
                        {course.completed}/{course.lessonCount || 0} bài
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <Link to={`/courses/${course.id}`}>
                    <Button className="mt-4 w-full rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90">
                      {course.progress > 0 ? "Tiếp tục học" : "Xem khóa học"}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </PageSection>
      </div>
    </DashboardLayout>
  );
};

export default Courses;
