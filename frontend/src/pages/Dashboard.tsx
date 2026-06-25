import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarCheck,
  ChevronRight,
  Coins,
  ListChecks,
  Snowflake,
  Sparkles,
  Target,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/layout/UserPage";
import { useAuth } from "@/hooks/use-auth";
import { useLearningPath } from "@/hooks/learning/useLearningPath";

const monthLabel = () => new Date().toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

const fullDateLabel = () =>
  new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/** Calm winter banner for the "current course" card — CSS/SVG, no image. */
const CourseBanner = () => {
  const flakes = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        left: (i * 37) % 100,
        size: 3 + ((i * 7) % 5),
        delay: -(i * 1.7),
        duration: 9 + ((i * 5) % 8),
        drift: ((i % 3) - 1) * 30,
      })),
    []
  );
  return (
    <div
      className="relative h-48 overflow-hidden rounded-2xl"
      style={{
        background:
          "linear-gradient(180deg, hsl(206 72% 86%) 0%, hsl(204 64% 93%) 55%, hsl(0 0% 100%) 100%)",
      }}
    >
      {flakes.map((f, i) => (
        <span
          key={i}
          className="animate-snow-fall absolute top-[-10px] rounded-full bg-white"
          style={{
            left: `${f.left}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            opacity: 0.7,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
            ["--snow-drift" as string]: `${f.drift}px`,
          }}
        />
      ))}
      <svg
        className="absolute inset-x-0 bottom-0 w-full"
        style={{ height: "55%" }}
        viewBox="0 0 600 160"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 110 L150 70 L300 105 L450 65 L600 100 L600 160 L0 160 Z"
          fill="#fff"
          opacity="0.75"
        />
        <path d="M0 135 L180 100 L380 130 L600 105 L600 160 L0 160 Z" fill="#fff" />
      </svg>
      <BookOpen
        className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-primary"
        style={{ opacity: 0.85 }}
        strokeWidth={1.2}
      />
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { data: learningPath, isLoading } = useLearningPath();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (!user) void refreshUser();
  }, [isAuthenticated, user, refreshUser, navigate]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào ngày mới";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  }, []);

  const greetingName = user?.displayName || "bạn";
  const level = learningPath?.targetJlptLevel || "N5";
  const goalMin = learningPath?.dailyGoalMinutes ?? 15;
  const completion = learningPath?.completionRate ?? 0;
  const nextLesson = learningPath?.nextLesson ?? null;
  const recommended = learningPath?.recommendedLessons ?? [];
  const deadlinePlan = learningPath?.deadlinePlan ?? null;

  const metrics = [
    {
      label: "Chuỗi ngày hiện tại",
      value: `${learningPath?.currentStreak ?? 0} ngày`,
      hint: "Giữ nhịp học mỗi ngày",
      icon: <Snowflake className="h-4 w-4" />,
    },
    {
      label: "Bài học đã hoàn thành",
      value: `${learningPath?.completedLessonsInTrack ?? 0} bài`,
      hint: monthLabel(),
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      label: "Điểm tích lũy",
      value: `${learningPath?.totalXP ?? 0} XP`,
      hint: "Tổng điểm kinh nghiệm",
      icon: <Coins className="h-4 w-4" />,
    },
    {
      label: "Mục tiêu mỗi ngày",
      value: `${goalMin} phút`,
      hint: `Mục tiêu ${level}`,
      icon: <Target className="h-4 w-4" />,
    },
  ];

  const goals = [
    {
      icon: <ListChecks className="h-4 w-4" />,
      title: `${goalMin} phút mỗi ngày`,
      sub: "Mục tiêu thời lượng học",
    },
    {
      icon: <CalendarCheck className="h-4 w-4" />,
      title: deadlinePlan?.hasDeadline
        ? `Hoàn thành ${level} trước ${deadlinePlan.deadlineDate}`
        : `Hoàn thành lộ trình ${level}`,
      sub: deadlinePlan?.hasDeadline
        ? `Còn ${Math.max(0, deadlinePlan.daysRemaining)} ngày`
        : "Chưa đặt deadline",
    },
  ];

  const activities = recommended.slice(0, 3);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1320px]">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-6 text-[2rem] font-bold tracking-tight text-foreground md:text-[2.4rem]"
        >
          {greeting}, {greetingName}
        </motion.h1>

        {/* Metric row */}
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((m) => (
            <MetricCard
              key={m.label}
              label={m.label}
              value={isLoading ? "…" : m.value}
              hint={m.hint}
              icon={m.icon}
            />
          ))}
        </div>

        {/* Main grid */}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Current course */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="yukihon-card p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[1.15rem] font-bold tracking-tight text-foreground">
                  Khóa học hiện tại
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {learningPath?.recommendationSummary ||
                    "Theo dõi tiến độ và quay lại đúng bài học tiếp theo của bạn."}
                </p>
              </div>
            </div>

            <CourseBanner />

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  {nextLesson?.title || `Tiếng Nhật ${level}`}
                </span>
                <span className="font-semibold text-primary">{completion}% hoàn thành</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tiếng Nhật {level} · Đang học</span>
                <Link
                  to={nextLesson ? `/lessons/${nextLesson.id}` : "/jlpt-lessons"}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {nextLesson ? "Mở bài học" : "Xem lộ trình"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.section>

          {/* Right rail */}
          <div className="space-y-5">
            {/* Goals */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
              className="yukihon-card p-5"
            >
              <h2 className="text-[1.05rem] font-bold tracking-tight text-foreground">
                Mục tiêu học tập
              </h2>
              <p className="mt-0.5 text-sm capitalize text-muted-foreground">{fullDateLabel()}</p>
              <div className="mt-4 space-y-3">
                {goals.map((g) => (
                  <div
                    key={g.title}
                    className="flex items-start gap-3 rounded-2xl p-3"
                    style={{ background: "hsl(var(--primary) / 0.06)" }}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                      {g.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{g.title}</p>
                      <p className="text-xs text-muted-foreground">{g.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Recent activity / next steps */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
              className="yukihon-card p-5"
            >
              <h2 className="text-[1.05rem] font-bold tracking-tight text-foreground">
                Hoạt động gần đây
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Những bài nên mở trong phiên học kế tiếp
              </p>
              <div className="mt-4 space-y-2.5">
                {activities.length > 0 ? (
                  activities.map((lesson) => (
                    <Link
                      key={lesson.id}
                      to={`/lessons/${lesson.id}`}
                      className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card/60 p-3 transition-colors hover:border-primary/30"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                        <Award className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {lesson.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {lesson.jlptLevel} · {lesson.estimatedMinutes} phút
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/[0.03] p-4 text-sm text-muted-foreground">
                    Khi có bài học phù hợp hơn, các gợi ý sẽ hiển thị ở đây.
                  </div>
                )}
              </div>
            </motion.section>

            {/* Quick tip */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
              className="yukihon-card flex items-center gap-3 p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">
                Học đều mỗi ngày giúp bạn giữ chuỗi và ghi nhớ lâu hơn.
              </p>
            </motion.section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
