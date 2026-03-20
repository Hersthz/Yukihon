import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, Clock, Compass, GraduationCap, Layers, Sparkles } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Course {
  id: string;
  title: string;
  level: string;
  description: string;
  lessons: number;
  hours: number;
  skills: string[];
  progress: number;
}

const levelTone: Record<string, string> = {
  "JLPT N5": "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "JLPT N4": "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  "JLPT N3": "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "JLPT N2": "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "JLPT N1": "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  "N3-N2": "border-border bg-muted text-foreground",
};

const courses: Course[] = [
  {
    id: "n5-foundations",
    title: "N5 Foundations",
    level: "JLPT N5",
    description: "Bắt đầu từ nền tảng với hiragana, katakana, ngữ pháp cơ bản và nhóm từ vựng thiết yếu.",
    lessons: 45,
    hours: 20,
    skills: ["Vocab", "Grammar", "Kanji"],
    progress: 0,
  },
  {
    id: "n4-conversations",
    title: "N4 Daily Conversations",
    level: "JLPT N4",
    description: "Tập trung vào giao tiếp hằng ngày với các tình huống đời sống và mẫu câu quen thuộc.",
    lessons: 60,
    hours: 28,
    skills: ["Speaking", "Grammar", "Listening"],
    progress: 62,
  },
  {
    id: "n3-fluency",
    title: "N3 Building Fluency",
    level: "JLPT N3",
    description: "Mở rộng vốn từ và khả năng diễn đạt tự nhiên hơn bằng nội dung trung cấp.",
    lessons: 75,
    hours: 35,
    skills: ["Reading", "Listening", "Grammar"],
    progress: 18,
  },
  {
    id: "n2-professional",
    title: "N2 Professional Japanese",
    level: "JLPT N2",
    description: "Học các chủ đề nâng cao hơn như công việc, tin tức và ngữ cảnh học thuật.",
    lessons: 90,
    hours: 42,
    skills: ["Reading", "Kanji", "Listening"],
    progress: 0,
  },
  {
    id: "n1-mastery",
    title: "N1 Complete Mastery",
    level: "JLPT N1",
    description: "Lộ trình chuyên sâu để tiếp cận các nội dung có độ tinh tế và ngữ nghĩa cao hơn.",
    lessons: 120,
    hours: 60,
    skills: ["All skills"],
    progress: 0,
  },
  {
    id: "business-japanese",
    title: "Business Japanese",
    level: "N3-N2",
    description: "Một nhánh học ứng dụng cho email, cuộc họp, tác phong giao tiếp và tài liệu công việc.",
    lessons: 40,
    hours: 18,
    skills: ["Email", "Speaking"],
    progress: 8,
  },
];

const levels = ["all", "JLPT N5", "JLPT N4", "JLPT N3", "JLPT N2", "JLPT N1", "N3-N2"];

const Courses = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const filteredCourses = useMemo(() => {
    return selectedLevel === "all" ? courses : courses.filter((course) => course.level === selectedLevel);
  }, [selectedLevel]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1420px]">
        <PageHeader
          icon={<GraduationCap className="h-6 w-6 text-primary" />}
          title="Khóa học"
          description="Danh mục khóa học được nén gọn để bạn nhìn rõ nhiều lựa chọn cùng lúc."
          eyebrow="Courses"
        />

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricCard hint="Toàn bộ lộ trình hiện có" icon={<BookOpen className="h-4 w-4 text-sky-500" />} label="Khóa học" value={courses.length} />
          <MetricCard hint="Bộ lọc đang mở" icon={<Layers className="h-4 w-4 text-primary" />} label="Mức JLPT" value={selectedLevel === "all" ? "Tất cả" : selectedLevel} />
          <MetricCard hint="Có thể tiếp tục học ngay" icon={<Sparkles className="h-4 w-4 text-emerald-500" />} label="Đang theo học" value={courses.filter((course) => course.progress > 0).length} />
        </div>

        <PageSection className="mb-4" title="Bộ lọc level" description="Chọn cấp JLPT để lọc danh sách.">
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => {
              const active = selectedLevel === level;
              return (
                <button
                  key={level}
                  className={`rounded-2xl border-2 px-4 py-2 text-sm font-medium transition cursor-pointer ${
                    active
                      ? `${level === "all" ? "border-primary bg-primary/10 text-primary" : levelTone[level]}`
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

        <PageSection title="Danh sách khóa học" description="Card thấp hơn và chia thông tin thành các cụm rõ để quét nhanh hơn.">
          {filteredCourses.length === 0 ? (
            <EmptyState description="Thử chọn lại level khác để mở rộng danh sách." icon={<Compass className="h-6 w-6" />} title="Không có khóa học phù hợp" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => (
                <div key={course.id} className="yukihon-card-flat p-4 cursor-default">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{course.title}</h3>
                      <Badge className={`mt-2 rounded-full border ${levelTone[course.level] || "border-border bg-muted text-foreground"}`}>
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
                      <span key={skill} className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.lessons} bài
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.hours} giờ
                    </span>
                  </div>

                  {course.progress > 0 && (
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Tiến độ</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                  )}

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
