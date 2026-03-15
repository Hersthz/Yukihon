import { type ElementType, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BookMarked,
  BookOpen,
  Brain,
  ChevronRight,
  Compass,
  Flame,
  Globe2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareMore,
  Search,
  Settings,
  Shield,
  Sparkles,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

type NavItem = {
  label: string;
  path: string;
  icon: ElementType;
  badge?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const PRIMARY_GROUPS: NavGroup[] = [
  {
    label: "Khám phá",
    items: [
      { label: "Tổng quan", path: "/dashboard", icon: LayoutDashboard },
      { label: "Tra cứu", path: "/dictionary", icon: Search },
      { label: "Dịch thuật", path: "/translation", icon: Globe2 },
      { label: "Cộng đồng", path: "/community", icon: Users },
      { label: "JLPT", path: "/jlpt-lessons", icon: GraduationCap },
    ],
  },
  {
    label: "Luyện tập",
    items: [
      { label: "Từ vựng", path: "/vocabulary", icon: BookOpen },
      { label: "Ngữ pháp", path: "/grammar", icon: Brain },
      { label: "Bài kiểm tra", path: "/quiz", icon: Zap, badge: "Hot" },
      { label: "Khóa học", path: "/courses", icon: Compass },
      { label: "Từ của tôi", path: "/my-words", icon: BookMarked },
    ],
  },
];

const SECONDARY_ITEMS: NavItem[] = [
  { label: "Hồ sơ", path: "/profile", icon: User },
  { label: "Cài đặt", path: "/settings", icon: Settings },
];

const PAGE_META: Record<
  string,
  { title: string; description: string; eyebrow: string }
> = {
  "/dashboard": {
    title: "Không gian học tập",
    description: "Theo dõi tiến độ, quay lại bài học gần nhất và giữ nhịp học đều mỗi ngày.",
    eyebrow: "Winter dashboard",
  },
  "/dictionary": {
    title: "Tra cứu từ điển",
    description: "Tìm từ, ví dụ và ngữ cảnh nhanh trong một giao diện yên tĩnh, dễ tập trung.",
    eyebrow: "Lookup",
  },
  "/translation": {
    title: "Dịch thuật",
    description: "Dịch cụm từ và so sánh sắc thái diễn đạt theo ngữ cảnh.",
    eyebrow: "Translate",
  },
  "/community": {
    title: "Cộng đồng",
    description: "Theo dõi thảo luận, hỏi đáp và các chủ đề đang được quan tâm.",
    eyebrow: "Community",
  },
  "/jlpt-lessons": {
    title: "Lộ trình JLPT",
    description: "Học theo cấp độ với cấu trúc rõ ràng từ N5 đến N1.",
    eyebrow: "Roadmap",
  },
  "/vocabulary": {
    title: "Kho từ vựng",
    description: "Ôn tập theo cụm chủ đề, thẻ nhớ và nhịp độ học cá nhân.",
    eyebrow: "Vocabulary",
  },
  "/grammar": {
    title: "Ngữ pháp",
    description: "Xây nền ngữ pháp với ví dụ thực tế và trình tự học hợp lý.",
    eyebrow: "Grammar",
  },
  "/quiz": {
    title: "Bài kiểm tra",
    description: "Kiểm tra nhanh để khóa kiến thức và nhìn rõ điểm cần ôn lại.",
    eyebrow: "Practice",
  },
  "/courses": {
    title: "Khóa học",
    description: "Tập trung vào những khóa học dài hơi với cấu trúc rõ ràng.",
    eyebrow: "Courses",
  },
  "/my-words": {
    title: "Từ của tôi",
    description: "Quản lý bộ sưu tập từ cá nhân, ghi chú và phân loại ôn tập.",
    eyebrow: "Notebook",
  },
  "/profile": {
    title: "Hồ sơ học tập",
    description: "Quản lý thông tin cá nhân và theo dõi cột mốc học tập của bạn.",
    eyebrow: "Profile",
  },
  "/settings": {
    title: "Cài đặt",
    description: "Tùy chỉnh trải nghiệm học và môi trường hiển thị phù hợp mắt nhìn.",
    eyebrow: "Preferences",
  },
};

const isItemActive = (pathname: string, itemPath: string) =>
  pathname === itemPath || pathname.startsWith(`${itemPath}/`);

const DashboardNavigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const pageMeta = useMemo(
    () =>
      PAGE_META[location.pathname] ?? {
        title: "Yukihon",
        description: "Không gian học tiếng Nhật dịu mắt, rõ ràng và tập trung.",
        eyebrow: "Workspace",
      },
    [location.pathname]
  );

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("yukihon_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const userName = user?.displayName || "Learner";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("yukihon_token");
    localStorage.removeItem("yukihon_user");
    navigate("/");
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/6 px-4 pb-4 pt-4">
        <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] shadow-[0_12px_32px_rgba(15,23,42,0.45)]">
          <span className="text-lg font-semibold text-white">ゆ</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-2xl font-semibold leading-none text-white">Yukihon</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
            Study in silence
          </p>
        </div>
      </div>
        <div className="mt-4 flex items-center gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.04] px-3 py-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300/80 via-cyan-200/70 to-emerald-200/60 text-sm font-semibold text-slate-900">
            {userInitial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{userName}</p>
            <div className="mt-1 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-300" />
                12
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-sky-300" />
                87%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex-1 overflow-y-auto px-3 pb-6">
        {PRIMARY_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              {group.label}
            </p>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const active = isItemActive(location.pathname, item.path);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex items-center justify-between rounded-[18px] px-3 py-3 transition-all duration-200",
                      active
                        ? "border border-sky-300/[0.14] bg-white/[0.07] text-white"
                        : "border border-transparent text-slate-300 hover:border-white/6 hover:bg-white/[0.035] hover:text-white"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-2xl transition-colors",
                          active
                            ? "bg-sky-400/18 text-sky-200"
                            : "bg-slate-950/30 text-slate-400 group-hover:text-slate-200"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="truncate text-sm font-medium">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-all",
                          active ? "text-sky-200" : "text-slate-600 group-hover:text-slate-300"
                        )}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

          <div className="mb-4">
            <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Cá nhân
            </p>
            <div className="space-y-1.5">
              {SECONDARY_ITEMS.map((item) => {
                const active = isItemActive(location.pathname, item.path);
                const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-[18px] px-3 py-3 text-sm font-medium transition-all",
                    active
                      ? "border border-sky-300/[0.14] bg-white/[0.07] text-white"
                      : "text-slate-300 hover:bg-white/[0.035] hover:text-white"
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/30 text-slate-400 group-hover:text-slate-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  {item.label}
                </Link>
              );
            })}

            {isAdmin() && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="group flex items-center gap-3 rounded-[18px] px-3 py-3 text-sm font-medium text-violet-200 transition-all hover:bg-violet-400/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-200">
                  <Shield className="h-4 w-4" />
                </div>
                Admin panel
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/6 px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-between rounded-[18px] border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:border-red-300/20 hover:bg-red-400/[0.08] hover:text-red-100"
        >
          <span className="flex items-center gap-3">
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[288px] border-r border-white/[0.06] bg-[#09111d]/[0.78] backdrop-blur-xl lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.07),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(226,232,240,0.035),transparent_24%)]" />
        <div className="relative h-full">{SidebarContent}</div>
      </aside>

      <div className="fixed left-0 right-0 top-0 z-50 border-b border-white/6 bg-[#08101b]/70 backdrop-blur-xl lg:left-[288px]">
        <div className="flex h-[72px] items-center justify-between gap-6 px-5 sm:px-7 lg:px-8 xl:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-white transition hover:bg-white/[0.08] lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-white sm:text-[2rem]">{pageMeta.title}</h1>
            </div>
          </div>

          <div className="hidden min-w-0 flex-1 items-center justify-end gap-3 md:flex">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            <button
              type="button"
              className="inline-flex h-11 items-center gap-3 rounded-[24px] border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-left transition hover:bg-white/[0.08]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300/80 via-cyan-200/70 to-emerald-200/60 text-sm font-semibold text-slate-900">
                {userInitial}
              </div>
              <div className="hidden xl:block">
                <p className="text-sm font-medium text-white">{userName}</p>
                <p className="text-xs text-slate-500">Màn đêm dịu mắt</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm lg:hidden"
              aria-label="Close navigation"
            />

            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-[60] w-[88vw] max-w-[320px] border-r border-white/[0.08] bg-[#09111d]/[0.96] backdrop-blur-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-white/6 px-4 py-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Navigation</p>
                  <p className="text-lg font-semibold text-white">Yukihon</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-white"
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardNavigation;
