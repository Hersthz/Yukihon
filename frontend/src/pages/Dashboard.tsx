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
  MessageSquareMore,
  Search,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const quickStats = [
  { label: "Streak", value: "12", icon: Flame, color: "text-amber-500" },
  { label: "Từ đã học", value: "156", icon: BookOpen, color: "text-sky-500" },
  { label: "Quiz", value: "24", icon: Trophy, color: "text-emerald-500" },
  { label: "Tập trung", value: "87%", icon: Sparkles, color: "text-primary" },
];

const quickActions = [
  { title: "Tra cứu", subtitle: "Kanji, ví dụ, cách đọc", icon: Search, to: "/dictionary", accent: "bg-sky-500/15 text-sky-600 dark:text-sky-400" },
  { title: "Dịch", subtitle: "Dịch nhanh theo ngữ cảnh", icon: MessageSquareMore, to: "/translation", accent: "bg-primary/15 text-primary" },
  { title: "Ngữ pháp", subtitle: "Ôn cấu trúc thường gặp", icon: Brain, to: "/grammar", accent: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  { title: "JLPT", subtitle: "Lộ trình theo cấp độ", icon: GraduationCap, to: "/jlpt-lessons", accent: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
];

const notebookCollections = [
  { name: "Minna no Nihongo", meta: "2052 từ | 50 bài" },
  { name: "Giao tiếp cơ bản", meta: "883 từ | 18 bài" },
  { name: "Kanji - Kyu", meta: "49 từ" },
  { name: "Động từ N4", meta: "124 từ" },
];

const discoverSets = [
  { title: "Tết Việt Nam", info: "50 từ", author: "Maziiko" },
  { title: "Valentine", info: "51 từ", author: "Maziiko" },
  { title: "Ngữ pháp N3", info: "211 từ", author: "thanhhang4715" },
  { title: "Mimikara Oboeru N2", info: "3524 từ", author: "hoangvan2481" },
];

const recentTopics = ["夜", "暮らす", "特別", "喜ぶ", "困る", "読書", "学び", "静けさ"];

const activity = [
  { title: "Hoàn thành quiz ngữ pháp N4", time: "12 phút trước" },
  { title: "Lưu 5 từ vào sổ tay cá nhân", time: "Hôm nay" },
  { title: "Mở lại bài Daily Conversations", time: "Hôm qua" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();

  const nextLesson = {
    title: "Daily Conversations: Greetings",
    level: "N4",
    progress: 60,
    duration: "12 phút",
    to: "/jlpt-lessons",
  };

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
              Bảng tổng quan gọn nhẹ để bạn nhìn nhanh tiến độ mà không phải kéo nhiều.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/dictionary">
              <Button
                variant="outline"
                className="h-10 rounded-2xl border-2 border-border bg-card text-foreground hover:bg-muted"
              >
                <Search className="mr-2 h-4 w-4" />
                Tra cứu
              </Button>
            </Link>
            <Link to={nextLesson.to}>
              <Button className="h-10 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90">
                <ArrowRight className="mr-2 h-4 w-4" />
                Học tiếp
              </Button>
            </Link>
          </div>
        </motion.section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            {/* Continue Learning + Today Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 }}
              className="yukihon-card p-4 cursor-default"
            >
              <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
                {/* Continue card */}
                <div className="rounded-[1.25rem] bg-gradient-to-br from-primary to-secondary p-4 text-white">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/70">Tiếp tục học</p>
                  <h3 className="mt-3 text-[1.6rem] font-semibold leading-tight">{nextLesson.title}</h3>
                  <div className="mt-4 flex items-center gap-2">
                    <Badge className="border-white/20 bg-white/15 text-white hover:bg-white/15">
                      {nextLesson.level}
                    </Badge>
                    <span className="flex items-center gap-1 text-sm text-white/85">
                      <Clock3 className="h-3.5 w-3.5" />
                      {nextLesson.duration}
                    </span>
                  </div>
                  <Link to={nextLesson.to}>
                    <Button className="mt-5 h-10 w-full rounded-2xl bg-white text-primary hover:bg-white/90">
                      Mở bài học
                    </Button>
                  </Link>
                </div>

                {/* Today stats */}
                <div className="rounded-[1.25rem] border-2 border-border bg-muted/30 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Tiến độ hôm nay</p>
                      <p className="text-sm text-muted-foreground">1 bài JLPT ngắn + 10 từ trong sổ tay</p>
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
                          <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tiến độ bài hiện tại</span>
                      <span className="font-medium text-primary">{nextLesson.progress}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${nextLesson.progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="yukihon-card p-4 cursor-default"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">Công cụ học tập</h3>
                <p className="text-sm text-muted-foreground">Đi nhanh vào phần bạn dùng nhiều nhất</p>
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

            {/* Notebook + Discover */}
            <div className="grid gap-4 xl:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="yukihon-card p-4 cursor-default"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Sổ tay của tôi</h3>
                    <p className="text-sm text-muted-foreground">Các bộ từ đang dùng</p>
                  </div>
                  <Link to="/my-words" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Xem thêm
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {notebookCollections.map((item) => (
                    <div
                      key={item.name}
                      className="yukihon-card-flat px-4 py-4 cursor-default"
                    >
                      <p className="text-base font-semibold text-foreground">{item.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.meta}</p>
                    </div>
                  ))}
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
                    <h3 className="text-lg font-semibold text-foreground">Khám phá</h3>
                    <p className="text-sm text-muted-foreground">Các bộ nội dung hữu ích để học tiếp</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {discoverSets.map((item) => (
                    <div
                      key={item.title}
                      className="yukihon-card-flat px-4 py-4 cursor-default"
                    >
                      <p className="text-base font-semibold text-foreground">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.info}</p>
                      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                        <span>{item.author}</span>
                        <Star className="h-4 w-4 text-amber-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Goals */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="yukihon-card p-4 cursor-default"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Mục tiêu hôm nay</h3>
                  <p className="text-sm text-muted-foreground">25 phút học tập trung</p>
                </div>
                <Zap className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="mt-4 space-y-3">
                {["1 bài hội thoại", "10 từ trong sổ tay", "1 bài quiz nhanh"].map((goal) => (
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

            {/* Recent Topics */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="yukihon-card p-4 cursor-default"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Lịch sử tra cứu</h3>
                  <p className="text-sm text-muted-foreground">Các từ bạn vừa quan tâm</p>
                </div>
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {recentTopics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-primary/10 px-3 py-2 text-sm font-medium text-primary border border-primary/20"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Activity */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="yukihon-card p-4 cursor-default"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Hoạt động gần đây</h3>
                  <p className="text-sm text-muted-foreground">Những gì bạn vừa hoàn thành</p>
                </div>
                <MessageSquareMore className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="mt-4 space-y-3">
                {activity.map((item) => (
                  <div
                    key={item.title}
                    className="yukihon-card-flat px-4 py-3 cursor-default"
                  >
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {item.time}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
