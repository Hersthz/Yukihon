import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Clock3,
  Flame,
  GraduationCap,
  Search,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLearningPath } from "@/hooks/learning/useLearningPath";
import type { LearningPathLesson } from "@/api";

const quickActions = [
  { title: "Tra cứu", subtitle: "Kanji, ví dụ, cách đọc", icon: Search, to: "/dictionary", accent: "bg-sky-500/15 text-sky-600 dark:text-sky-400" },
  { title: "Ngữ pháp", subtitle: "Ôn cấu trúc thường gặp", icon: Brain, to: "/grammar", accent: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  { title: "Quiz", subtitle: "Kiểm tra nhanh mức độ nhớ", icon: Trophy, to: "/quiz", accent: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
  { title: "JLPT", subtitle: "Lộ trình theo cấp độ", icon: GraduationCap, to: "/jlpt-lessons", accent: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
];

const formatProgressStatus = (status: LearningPathLesson["progressStatus"]) => {
  switch (status) {
    case "COMPLETED":
      return "Đã xong";
    case "IN_PROGRESS":
      return "Đang học";
    default:
      return "Sẵn sàng";
  }
};

const formatCategory = (category: string | null | undefined) => {
  if (!category) return "Lesson";
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { data: learningPath, isLoading: isLearningPathLoading } = useLearningPath();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (!user) {
      void refreshUser();
    }
  }, [isAuthenticated, user, refreshUser, navigate]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào ngày mới";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  }, []);

  const greetingName = user?.displayName || "bạn";
  const nextLesson = learningPath?.nextLesson ?? null;
  const recommendedLessons = learningPath?.recommendedLessons ?? [];
  const todayGoals = learningPath?.todayGoals ?? [
    "Thiết lập mục tiêu JLPT trong phần Settings để hệ thống cá nhân hóa sâu hơn.",
    "Chọn một bài trọng tâm và giữ nhịp học đều trong hôm nay.",
  ];

  const quickStats = [
    { label: "Streak", value: String(learningPath?.currentStreak ?? 0), icon: Flame, color: "text-amber-500" },
    {
      label: "Hoàn thành",
      value: `${learningPath?.completedLessonsInTrack ?? 0}/${learningPath?.totalLessonsInTrack ?? 0}`,
      icon: BookOpen,
      color: "text-sky-500",
    },
    { label: "Đang học", value: String(learningPath?.inProgressLessons ?? 0), icon: Trophy, color: "text-emerald-500" },
    { label: "XP", value: String(learningPath?.totalXP ?? 0), icon: Sparkles, color: "text-primary" },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1500px]">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h2 className="text-[2rem] font-semibold leading-tight text-foreground">
              {greeting}, {greetingName}!
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {learningPath?.recommendationSummary || "Mình đang sắp xếp lộ trình học dựa trên mục tiêu JLPT, tiến độ và nhịp học hiện tại của bạn."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/settings">
              <Button
                variant="outline"
                className="h-10 rounded-2xl border-2 border-border bg-card text-foreground hover:bg-muted"
              >
                <Target className="mr-2 h-4 w-4" />
                Chỉnh mục tiêu
              </Button>
            </Link>
            <Link to="/jlpt-lessons">
              <Button className="h-10 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90">
                <ArrowRight className="mr-2 h-4 w-4" />
                {nextLesson ? "Học tiếp" : "Mở lộ trình"}
              </Button>
            </Link>
          </div>
        </motion.section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 }}
              className="yukihon-card p-4 cursor-default"
            >
              <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
                <div className="rounded-[1.25rem] bg-gradient-to-br from-primary to-secondary p-4 text-white">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/70">Tiếp tục học</p>
                  <h3 className="mt-3 text-[1.6rem] font-semibold leading-tight">
                    {nextLesson?.title || "Lộ trình của bạn đang sẵn sàng"}
                  </h3>
                  <p className="mt-2 text-sm text-white/80">
                    {nextLesson?.recommendationReason || "Chọn mục tiêu JLPT và hệ thống sẽ ưu tiên bài học phù hợp nhất cho hôm nay."}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Badge className="border-white/20 bg-white/15 text-white hover:bg-white/15">
                      {nextLesson?.jlptLevel || learningPath?.targetJlptLevel || "N5"}
                    </Badge>
                    <span className="flex items-center gap-1 text-sm text-white/85">
                      <Clock3 className="h-3.5 w-3.5" />
                      {nextLesson?.estimatedMinutes ?? learningPath?.dailyGoalMinutes ?? 15} phút
                    </span>
                  </div>
                  <Link to="/jlpt-lessons">
                    <Button className="mt-5 h-10 w-full rounded-2xl bg-white text-primary hover:bg-white/90">
                      {nextLesson ? "Mở bài học" : "Xem lộ trình"}
                    </Button>
                  </Link>
                </div>

                <div className="rounded-[1.25rem] border-2 border-border bg-muted/30 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Tiến độ cá nhân hóa</p>
                      <p className="text-sm text-muted-foreground">
                        Mục tiêu {learningPath?.targetJlptLevel || "N5"} • {learningPath?.dailyGoalMinutes ?? 15} phút mỗi ngày
                      </p>
                    </div>
                    <Target className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4">
                    {quickStats.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="yukihon-card-flat px-3 py-3 cursor-default"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                              {item.label}
                            </p>
                            <Icon className={`h-4 w-4 ${item.color}`} />
                          </div>
                          <p className="mt-2 text-2xl font-semibold text-foreground">
                            {isLearningPathLoading ? "..." : item.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tiến độ lộ trình hiện tại</span>
                      <span className="font-medium text-primary">{learningPath?.completionRate ?? 0}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${learningPath?.completionRate ?? 0}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="yukihon-card p-4 cursor-default"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">Công cụ học tập</h3>
                <p className="text-sm text-muted-foreground">Đi nhanh vào các phần bạn có thể dùng song song với lộ trình chính</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {quickActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.title} to={item.to} className="group">
                      <div className="yukihon-card-flat px-4 py-4">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.accent}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-3 text-base font-semibold text-foreground">{item.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            <div className="grid gap-4 xl:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="yukihon-card p-4 cursor-default"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Lộ trình đề xuất</h3>
                    <p className="text-sm text-muted-foreground">Những bài học nên ưu tiên dựa trên mục tiêu và tiến độ của bạn</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {recommendedLessons.length > 0 ? (
                    recommendedLessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        to="/jlpt-lessons"
                        className="block yukihon-card-flat px-4 py-4 transition-colors hover:bg-muted/70"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-foreground">{lesson.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{lesson.recommendationReason}</p>
                          </div>
                          <Badge variant="outline" className="rounded-full border-primary/30 text-primary">
                            {formatProgressStatus(lesson.progressStatus)}
                          </Badge>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span>{lesson.jlptLevel}</span>
                          <span>•</span>
                          <span>{formatCategory(lesson.category)}</span>
                          <span>•</span>
                          <span>{lesson.estimatedMinutes} phút</span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                            style={{ width: `${lesson.progressPercent}%` }}
                          />
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="yukihon-card-flat px-4 py-4 text-sm text-muted-foreground">
                      Chưa có bài gợi ý. Hãy thêm lesson đã xuất bản hoặc cập nhật mục tiêu JLPT trong Settings.
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="yukihon-card p-4 cursor-default"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Nhịp học hiện tại</h3>
                    <p className="text-sm text-muted-foreground">Tóm tắt nhanh để bạn biết mình nên dồn lực vào đâu</p>
                  </div>
                  <Zap className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { title: "Mục tiêu JLPT", value: learningPath?.targetJlptLevel || "N5" },
                    { title: "Daily goal", value: `${learningPath?.dailyGoalMinutes ?? 15} phút` },
                    { title: "Bài trong track", value: String(learningPath?.totalLessonsInTrack ?? 0) },
                    { title: "Bài đang học dở", value: String(learningPath?.inProgressLessons ?? 0) },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="yukihon-card-flat px-4 py-4 cursor-default"
                    >
                      <p className="text-sm text-muted-foreground">{item.title}</p>
                      <p className="mt-2 text-xl font-semibold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="yukihon-card p-4 cursor-default"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Mục tiêu hôm nay</h3>
                  <p className="text-sm text-muted-foreground">
                    {learningPath?.dailyGoalMinutes ?? 15} phút tập trung cho lộ trình {learningPath?.targetJlptLevel || "N5"}
                  </p>
                </div>
                <Zap className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="mt-4 space-y-3">
                {todayGoals.map((goal) => (
                  <div
                    key={goal}
                    className="flex items-center gap-3 yukihon-card-flat px-4 py-3 cursor-default"
                  >
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-sm font-medium text-foreground">{goal}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="yukihon-card p-4 cursor-default"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Điểm nhấn cá nhân hóa</h3>
                  <p className="text-sm text-muted-foreground">Các tín hiệu hệ thống đang dùng để gợi ý lộ trình</p>
                </div>
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  `Target ${learningPath?.targetJlptLevel || "N5"}`,
                  `${learningPath?.completionRate ?? 0}% hoàn thành`,
                  `${learningPath?.currentStreak ?? 0} ngày streak`,
                  `${learningPath?.inProgressLessons ?? 0} bài đang học`,
                ].map((signal) => (
                  <span
                    key={signal}
                    className="rounded-full bg-primary/10 px-3 py-2 text-sm font-medium text-primary border border-primary/20"
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="yukihon-card p-4 cursor-default"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Bước tiếp theo</h3>
                  <p className="text-sm text-muted-foreground">Các bài nên mở trong phiên học kế tiếp</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="mt-4 space-y-3">
                {recommendedLessons.slice(0, 3).map((lesson) => (
                  <div
                    key={lesson.id}
                    className="yukihon-card-flat px-4 py-3 cursor-default"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">{lesson.title}</p>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {lesson.jlptLevel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{lesson.recommendationReason}</p>
                  </div>
                ))}

                {recommendedLessons.length === 0 && (
                  <div className="yukihon-card-flat px-4 py-3 text-sm text-muted-foreground">
                    Khi có lesson phù hợp hơn, hệ thống sẽ hiển thị các bước tiếp theo ở đây.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
