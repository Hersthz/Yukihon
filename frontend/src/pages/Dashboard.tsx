import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Clock3,
  Flame,
  GraduationCap,
  LayoutGrid,
  MessageSquareMore,
  Search,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  roles: string[];
}

interface MeResponse {
  id: number;
  email: string;
  displayName: string;
  roles: string[];
}

const API_BASE_URL = "http://localhost:8080";

const stats = [
  { label: "Streak", value: "12", icon: Flame, tone: "text-amber-200" },
  { label: "Từ đã học", value: "156", icon: BookOpen, tone: "text-sky-200" },
  { label: "Quiz", value: "24", icon: Trophy, tone: "text-emerald-200" },
  { label: "Tập trung", value: "87%", icon: Sparkles, tone: "text-cyan-200" },
];

const tools = [
  { title: "Tra cứu", subtitle: "Tìm từ, ví dụ, kanji", icon: Search, to: "/dictionary" },
  { title: "Dịch", subtitle: "Dịch nhanh theo ngữ cảnh", icon: MessageSquareMore, to: "/translation" },
  { title: "Ngữ pháp", subtitle: "Ôn mẫu câu thường gặp", icon: Brain, to: "/grammar" },
  { title: "JLPT", subtitle: "Lộ trình theo cấp độ", icon: GraduationCap, to: "/jlpt-lessons" },
];

const notebookCollections = [
  { name: "Minna no Nihongo", meta: "2052 từ | 50 bài", updated: "Cập nhật hôm nay" },
  { name: "Giao tiếp cơ bản", meta: "883 từ | 18 bài", updated: "2 ngày trước" },
  { name: "Kanji - Kyu", meta: "49 từ", updated: "Tuần này" },
  { name: "Động từ N4", meta: "124 từ", updated: "Tuần này" },
];

const discoverSets = [
  { title: "Tết Việt Nam", info: "50 từ", author: "Maziiko" },
  { title: "Valentine", info: "51 từ", author: "Maziiko" },
  { title: "Ngữ pháp N3", info: "211 từ", author: "thanhhang4715" },
  { title: "Mimikara Oboeru N2", info: "3524 từ", author: "hoangvan2481" },
];

const recentTopics = ["夜", "暮らす", "特別", "喜ぶ", "困る", "読書", "学び", "静けさ"];

const dashboardActivity = [
  { title: "Hoàn thành quiz ngữ pháp N4", time: "12 phút trước" },
  { title: "Lưu 5 từ vào sổ tay cá nhân", time: "Hôm nay" },
  { title: "Mở lại bài Daily Conversations", time: "Hôm qua" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem("yukihon_user");
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const nextLesson = {
    title: "Daily Conversations: Greetings",
    level: "N4",
    progress: 60,
    duration: "12 phút",
    to: "/jlpt-lessons",
  };

  useEffect(() => {
    const token = localStorage.getItem("yukihon_token");
    if (!token) {
      navigate("/auth");
      return;
    }

    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("yukihon_token");
          localStorage.removeItem("yukihon_user");
          navigate("/auth");
          return;
        }

        if (!res.ok) return;

        const data = (await res.json()) as MeResponse;
        const mapped = {
          id: data.id,
          email: data.email,
          displayName: data.displayName,
          roles: data.roles,
        };

        setUser(mapped);
        localStorage.setItem("yukihon_user", JSON.stringify(mapped));
      } catch {
        // Keep cached user silently.
      }
    };

    fetchMe();
  }, [navigate]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào ngày mới";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  }, []);

  const greetingName = user?.displayName || "bạn";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1560px]">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold text-white">
                {greeting}, {greetingName}!
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Tiếp tục nhịp học của bạn trong không gian yên tĩnh và dễ nhìn.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link to="/dictionary">
                <Button
                  variant="outline"
                  className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.06]"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Tra cứu
                </Button>
              </Link>
              <Link to={nextLesson.to}>
                <Button className="h-11 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Học tiếp
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 }}
              className="rounded-[28px] border border-white/[0.08] bg-white/[0.045] p-5 backdrop-blur-xl"
            >
              <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
                <div className="rounded-[24px] bg-sky-500 px-5 py-5 text-white">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/70">Tiếp tục học</p>
                  <h3 className="mt-4 text-2xl font-semibold leading-tight">
                    {nextLesson.title}
                  </h3>
                  <div className="mt-5 flex items-center gap-2">
                    <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
                      {nextLesson.level}
                    </Badge>
                    <span className="flex items-center gap-1 text-sm text-white/80">
                      <Clock3 className="h-3.5 w-3.5" />
                      {nextLesson.duration}
                    </span>
                  </div>
                  <Link to={nextLesson.to}>
                    <Button className="mt-6 h-11 w-full rounded-2xl bg-white text-sky-700 hover:bg-slate-100">
                      Mở bài học
                    </Button>
                  </Link>
                </div>

                <div className="rounded-[24px] border border-white/[0.08] bg-slate-950/25 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Tiến độ hôm nay</p>
                      <p className="text-sm text-slate-400">
                        1 bài JLPT ngắn + 10 từ trong sổ tay
                      </p>
                    </div>
                    <LayoutGrid className="h-5 w-5 text-slate-500" />
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-4">
                    {stats.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="rounded-[20px] border border-white/[0.08] bg-white/[0.035] px-4 py-4"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              {item.label}
                            </p>
                            <Icon className={`h-4 w-4 ${item.tone}`} />
                          </div>
                          <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-400">Tiến độ bài hiện tại</span>
                      <span className="font-medium text-sky-200">{nextLesson.progress}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${nextLesson.progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-[linear-gradient(90deg,rgba(96,165,250,0.95),rgba(103,232,249,0.85))]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-[28px] border border-white/[0.08] bg-white/[0.045] p-5 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Công cụ học tập</h3>
                  <p className="text-sm text-slate-400">Đi nhanh vào những phần bạn dùng nhiều nhất</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.title} to={tool.to} className="group">
                      <div className="rounded-[22px] border border-white/[0.08] bg-slate-950/25 px-4 py-4 transition hover:border-white/[0.12] hover:bg-white/[0.05]">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-200">
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-4 text-lg font-semibold text-white">{tool.title}</p>
                        <p className="mt-1 text-sm text-slate-400">{tool.subtitle}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="rounded-[28px] border border-white/[0.08] bg-white/[0.045] p-5 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Sổ tay của tôi</h3>
                  <p className="text-sm text-slate-400">Các bộ từ và danh sách bạn đang dùng</p>
                </div>
                <Link to="/my-words" className="text-sm text-slate-400 hover:text-white">
                  Xem thêm
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {notebookCollections.map((item, index) => (
                  <div
                    key={item.name}
                    className={`rounded-[22px] border px-4 py-4 ${
                      index === 0
                        ? "border-sky-400/30 bg-sky-500/14"
                        : "border-white/[0.08] bg-slate-950/25"
                    }`}
                  >
                    <p className="text-lg font-semibold text-white">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.meta}</p>
                    <p className="mt-5 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {item.updated}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="rounded-[28px] border border-white/[0.08] bg-white/[0.045] p-5 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Khám phá</h3>
                  <p className="text-sm text-slate-400">Các bộ nội dung hữu ích để học tiếp</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {discoverSets.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[22px] border border-white/[0.08] bg-slate-950/25 px-4 py-4"
                  >
                    <p className="text-lg font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.info}</p>
                    <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
                      <span>{item.author}</span>
                      <Star className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-[28px] border border-white/[0.08] bg-white/[0.045] p-5 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Mục tiêu hôm nay</h3>
                  <p className="text-sm text-slate-400">25 phút học tập trung</p>
                </div>
                <Zap className="h-5 w-5 text-slate-500" />
              </div>

              <div className="mt-5 space-y-3">
                {["1 bài hội thoại", "10 từ trong sổ tay", "1 bài quiz nhanh"].map((goal) => (
                  <div
                    key={goal}
                    className="flex items-center gap-3 rounded-[20px] border border-white/[0.08] bg-slate-950/25 px-4 py-4"
                  >
                    <div className="h-3 w-3 rounded-full bg-sky-200" />
                    <span className="text-base text-slate-200">{goal}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[28px] border border-white/[0.08] bg-white/[0.045] p-5 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Lịch sử tra cứu</h3>
                  <p className="text-sm text-slate-400">Các từ bạn vừa quan tâm</p>
                </div>
                <Search className="h-5 w-5 text-slate-500" />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {recentTopics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-sky-500/16 px-3 py-2 text-sm text-slate-100"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="rounded-[28px] border border-white/[0.08] bg-white/[0.045] p-5 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Hoạt động gần đây</h3>
                  <p className="text-sm text-slate-400">Những gì bạn vừa hoàn thành</p>
                </div>
                <MessageSquareMore className="h-5 w-5 text-slate-500" />
              </div>

              <div className="mt-5 space-y-3">
                {dashboardActivity.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[20px] border border-white/[0.08] bg-slate-950/25 px-4 py-4"
                  >
                    <p className="text-base text-white">{item.title}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
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
