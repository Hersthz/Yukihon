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

const quickStats = [
  { label: "Streak", value: "12", icon: Flame, color: "text-amber-500" },
  { label: "Từ đã học", value: "156", icon: BookOpen, color: "text-sky-500" },
  { label: "Quiz", value: "24", icon: Trophy, color: "text-emerald-500" },
  { label: "Tập trung", value: "87%", icon: Sparkles, color: "text-violet-500" },
];

const quickActions = [
  { title: "Tra cứu", subtitle: "Kanji, ví dụ, cách đọc", icon: Search, to: "/dictionary", accent: "bg-sky-100 text-sky-700" },
  { title: "Dịch", subtitle: "Dịch nhanh theo ngữ cảnh", icon: MessageSquareMore, to: "/translation", accent: "bg-violet-100 text-violet-700" },
  { title: "Ngữ pháp", subtitle: "Ôn cấu trúc thường gặp", icon: Brain, to: "/grammar", accent: "bg-emerald-100 text-emerald-700" },
  { title: "JLPT", subtitle: "Lộ trình theo cấp độ", icon: GraduationCap, to: "/jlpt-lessons", accent: "bg-amber-100 text-amber-700" },
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

const shellCard =
  "rounded-[24px] border border-white/70 bg-white/[0.72] shadow-[0_12px_30px_rgba(148,163,184,0.12)] backdrop-blur-xl";

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
      <div className="mx-auto max-w-[1500px]">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h2 className="text-[2rem] font-semibold leading-tight text-slate-900">
              {greeting}, {greetingName}!
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Bảng tổng quan gọn nhẹ để bạn nhìn nhanh tiến độ mà không phải kéo nhiều.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/dictionary">
              <Button
                variant="outline"
                className="h-10 rounded-2xl border-white/80 bg-white/75 text-slate-700 hover:bg-white"
              >
                <Search className="mr-2 h-4 w-4" />
                Tra cứu
              </Button>
            </Link>
            <Link to={nextLesson.to}>
              <Button className="h-10 rounded-2xl bg-sky-500 text-white hover:bg-sky-400">
                <ArrowRight className="mr-2 h-4 w-4" />
                Học tiếp
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
              className={`${shellCard} p-4`}
            >
              <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
                <div className="rounded-[22px] bg-[linear-gradient(135deg,#60a5fa,#38bdf8_55%,#6ee7b7)] p-4 text-white shadow-[0_12px_30px_rgba(56,189,248,0.22)]">
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
                    <Button className="mt-5 h-10 w-full rounded-2xl bg-white text-sky-700 hover:bg-slate-100">
                      Mở bài học
                    </Button>
                  </Link>
                </div>

                <div className="rounded-[22px] border border-slate-200 bg-slate-50/85 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Tiến độ hôm nay</p>
                      <p className="text-sm text-slate-500">1 bài JLPT ngắn + 10 từ trong sổ tay</p>
                    </div>
                    <Target className="h-5 w-5 text-slate-400" />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4">
                    {quickStats.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="rounded-[18px] border border-white bg-white px-3 py-3 shadow-[0_8px_18px_rgba(148,163,184,0.10)]"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                              {item.label}
                            </p>
                            <Icon className={`h-4 w-4 ${item.color}`} />
                          </div>
                          <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Tiến độ bài hiện tại</span>
                      <span className="font-medium text-sky-600">{nextLesson.progress}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${nextLesson.progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-[linear-gradient(90deg,#60a5fa,#22d3ee)]"
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
              className={`${shellCard} p-4`}
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Công cụ học tập</h3>
                <p className="text-sm text-slate-500">Đi nhanh vào phần bạn dùng nhiều nhất</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {quickActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.title} to={item.to} className="group">
                      <div className="rounded-[20px] border border-white bg-white/90 px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(148,163,184,0.12)]">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.accent}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-3 text-base font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
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
                className={`${shellCard} p-4`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Sổ tay của tôi</h3>
                    <p className="text-sm text-slate-500">Các bộ từ đang dùng</p>
                  </div>
                  <Link to="/my-words" className="text-sm text-slate-500 hover:text-slate-900">
                    Xem thêm
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {notebookCollections.map((item) => (
                    <div
                      key={item.name}
                      className={`rounded-[18px] border border-white bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(255,255,255,0.86))] px-4 py-4`}
                    >
                      <p className="text-base font-semibold text-slate-900">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.meta}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className={`${shellCard} p-4`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Khám phá</h3>
                    <p className="text-sm text-slate-500">Các bộ nội dung hữu ích để học tiếp</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {discoverSets.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[18px] border border-white bg-white/[0.92] px-4 py-4 shadow-[0_8px_18px_rgba(148,163,184,0.08)]"
                    >
                      <p className="text-base font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.info}</p>
                      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                        <span>{item.author}</span>
                        <Star className="h-4 w-4 text-amber-500" />
                      </div>
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
              className={`${shellCard} p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Mục tiêu hôm nay</h3>
                  <p className="text-sm text-slate-500">25 phút học tập trung</p>
                </div>
                <Zap className="h-5 w-5 text-slate-400" />
              </div>

              <div className="mt-4 space-y-3">
                {["1 bài hội thoại", "10 từ trong sổ tay", "1 bài quiz nhanh"].map((goal) => (
                  <div
                    key={goal}
                    className="flex items-center gap-3 rounded-[18px] border border-white bg-white/[0.92] px-4 py-3"
                  >
                    <div className="h-3 w-3 rounded-full bg-sky-400" />
                    <span className="text-sm font-medium text-slate-800">{goal}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`${shellCard} p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Lịch sử tra cứu</h3>
                  <p className="text-sm text-slate-500">Các từ bạn vừa quan tâm</p>
                </div>
                <Search className="h-5 w-5 text-slate-400" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {recentTopics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-sky-100 px-3 py-2 text-sm font-medium text-sky-800"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className={`${shellCard} p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Hoạt động gần đây</h3>
                  <p className="text-sm text-slate-500">Những gì bạn vừa hoàn thành</p>
                </div>
                <MessageSquareMore className="h-5 w-5 text-slate-400" />
              </div>

              <div className="mt-4 space-y-3">
                {activity.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[18px] border border-white bg-white/[0.92] px-4 py-3"
                  >
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
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
