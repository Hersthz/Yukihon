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
  "JLPT N5": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "JLPT N4": "border-sky-200 bg-sky-50 text-sky-700",
  "JLPT N3": "border-violet-200 bg-violet-50 text-violet-700",
  "JLPT N2": "border-amber-200 bg-amber-50 text-amber-700",
  "JLPT N1": "border-rose-200 bg-rose-50 text-rose-700",
  "N3-N2": "border-slate-200 bg-slate-50 text-slate-700",
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
          icon={<GraduationCap className="h-6 w-6 text-violet-600" />}
          title="Khóa học"
          description="Danh mục khóa học được nén gọn để bạn nhìn rõ nhiều lựa chọn cùng lúc, không còn cảm giác như landing page."
          eyebrow="Courses"
        />

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricCard hint="Toàn bộ lộ trình hiện có" icon={<BookOpen className="h-4 w-4 text-sky-500" />} label="Khóa học" value={courses.length} />
          <MetricCard hint="Bộ lọc đang mở" icon={<Layers className="h-4 w-4 text-violet-500" />} label="Mức JLPT" value={selectedLevel === "all" ? "Tất cả" : selectedLevel} />
          <MetricCard hint="Có thể tiếp tục học ngay" icon={<Sparkles className="h-4 w-4 text-emerald-500" />} label="Đang theo học" value={courses.filter((course) => course.progress > 0).length} />
        </div>

        <PageSection className="mb-4" title="Bộ lọc level" description="Thanh chọn thấp, nhẹ và không đẩy content chính xuống quá nhiều.">
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => {
              const active = selectedLevel === level;
              return (
                <button
                  key={level}
                  className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                    active
                      ? `${level === "all" ? "border-slate-200 bg-slate-100 text-slate-800" : levelTone[level]} shadow-[0_10px_20px_rgba(148,163,184,0.10)]`
                      : "border-white/80 bg-white/90 text-slate-600 hover:bg-slate-50"
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
                <div key={course.id} className="rounded-[22px] border border-white bg-white p-4 shadow-[0_10px_24px_rgba(148,163,184,0.10)]">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{course.title}</h3>
                      <Badge className={`mt-2 rounded-full border ${levelTone[course.level] || "border-slate-200 bg-slate-50 text-slate-700"}`}>
                        {course.level}
                      </Badge>
                    </div>
                    {course.progress > 0 && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {course.progress}%
                      </span>
                    )}
                  </div>

                  <p className="text-sm leading-6 text-slate-600">{course.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {course.skills.map((skill) => (
                      <span key={skill} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
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
                      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                        <span>Tiến độ</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,#60a5fa,#22d3ee)]" style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                  )}

                  <Link to={`/courses/${course.id}`}>
                    <Button className="mt-4 w-full rounded-2xl bg-slate-900 text-white hover:bg-slate-800">
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
