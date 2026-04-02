import { type ElementType, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BookMarked,
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  Compass,
  Flame,
  Globe2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Shield,
  Sparkles,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeChat } from "@/hooks/community/useRealtimeChat";

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

interface DashboardNavigationProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const PRIMARY_GROUPS: NavGroup[] = [
  {
    label: "Khám phá",
    items: [
      { label: "Tổng quan", path: "/dashboard", icon: LayoutDashboard },
      { label: "Tra cứu", path: "/dictionary", icon: Search },
      { label: "Story Mode", path: "/story-mode", icon: BookOpen, badge: "New" },
      { label: "Dịch", path: "/translation", icon: Globe2 },
      { label: "Cộng đồng", path: "/community", icon: Users },
      { label: "Mistake DNA", path: "/mistake-dna", icon: Sparkles },
      { label: "JLPT", path: "/jlpt-lessons", icon: GraduationCap },
    ],
  },
  {
    label: "Luyện tập",
    items: [
      { label: "Từ vựng", path: "/vocabulary", icon: BookOpen },
      { label: "Ngữ pháp", path: "/grammar", icon: Brain },
      { label: "Quiz", path: "/quiz", icon: Zap, badge: "Hot" },
      { label: "Khóa học", path: "/courses", icon: Compass },
      { label: "Kanji", path: "/kanji-library", icon: BookOpen },
      { label: "Từ của tôi", path: "/my-words", icon: BookMarked },
    ],
  },
];

const SECONDARY_ITEMS: NavItem[] = [
  { label: "Tài khoản", path: "/profile", icon: User },
];

const PAGE_META: Record<string, string> = {
  "/dashboard": "Không gian học tập",
  "/dictionary": "Tra cứu",
  "/story-mode": "Story Mode",
  "/translation": "Dịch",
  "/community": "Cộng đồng",
  "/mistake-dna": "Mistake DNA",
  "/jlpt-lessons": "JLPT",
  "/vocabulary": "Từ vựng",
  "/grammar": "Ngữ pháp",
  "/quiz": "Quiz",
  "/courses": "Khóa học",
  "/kanji-library": "Kanji",
  "/my-words": "Từ của tôi",
  "/profile": "Tài khoản",
  "/settings": "Tài khoản",
  "/admin/creator-mode": "Creator Studio",
};

const isItemActive = (pathname: string, itemPath: string) => pathname === itemPath || pathname.startsWith(`${itemPath}/`);

const DashboardNavigation = ({ collapsed, onToggleCollapse }: DashboardNavigationProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, user } = useAuth();

  const onCommunityPage = isItemActive(location.pathname, "/community");

  const { unreadCount, markRead } = useRealtimeChat({
    roomId: "general",
    enabled: isAuthenticated && !onCommunityPage,
    currentUserId: user?.id,
    loadHistory: false,
    trackUnread: true,
  });

  useEffect(() => {
    if (onCommunityPage) {
      markRead();
    }
  }, [markRead, onCommunityPage]);

  const userName = user?.displayName || "Learner";
  const userInitial = userName.charAt(0).toUpperCase();
  const pageTitle = PAGE_META[location.pathname] || "Yukihon";

  const handleLogout = () => {
    localStorage.removeItem("yukihon_token");
    localStorage.removeItem("yukihon_user");
    navigate("/");
  };

  const renderItem = (item: NavItem, compact: boolean) => {
    const Icon = item.icon;
    const active = isItemActive(location.pathname, item.path);
    const computedBadge =
      item.path === "/community" && unreadCount > 0 ? (unreadCount > 99 ? "99+" : String(unreadCount)) : item.badge;

    return (
      <Link
        key={item.path}
        title={compact ? item.label : undefined}
        to={item.path}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "group flex items-center rounded-2xl transition-all duration-200",
          compact ? "justify-center px-2 py-2.5" : "justify-between px-3 py-2.5",
          active
            ? "bg-primary/15 text-primary border border-primary/20"
            : "text-foreground/70 hover:bg-muted hover:text-foreground border border-transparent"
        )}
      >
        <div className={cn("flex min-w-0 items-center", compact ? "justify-center" : "gap-3")}>
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
              active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          {!compact && <span className="truncate text-sm font-medium">{item.label}</span>}
        </div>

        {!compact && (
          <div className="flex items-center gap-2">
            {computedBadge && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]",
                  item.path === "/community" && unreadCount > 0
                    ? "bg-rose-500/15 text-rose-500"
                    : "bg-amber-500/15 text-amber-500"
                )}
              >
                {computedBadge}
              </span>
            )}
            <ChevronRight className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
          </div>
        )}
      </Link>
    );
  };

  const sidebarContent = (compact: boolean) => (
    <div className="flex h-full flex-col">
      <div className={cn("border-b border-border", compact ? "px-3 py-4" : "px-4 py-4")}>
        <div className={cn("flex items-center", compact ? "justify-center" : "gap-3")}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            <span className="text-lg font-semibold">ゆ</span>
          </div>
          {!compact && (
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold text-foreground">Yukihon</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Study in silence</p>
            </div>
          )}
        </div>

        {!compact && (
          <div className="mt-4 yukihon-card-flat px-3 py-3 cursor-default">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 text-sm font-semibold text-foreground">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
                <div className="mt-1 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-amber-500" />
                    12
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    87%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={cn("mt-4 flex-1 overflow-y-auto pb-4", compact ? "px-2" : "px-3")}>
        {PRIMARY_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            {!compact && <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{group.label}</p>}
            <div className="space-y-1.5">{group.items.map((item) => renderItem(item, compact))}</div>
          </div>
        ))}

        <div className="mb-4">
          {!compact && <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Cá nhân</p>}
          <div className="space-y-1.5">
            {SECONDARY_ITEMS.map((item) => renderItem(item, compact))}
            {isAdmin() && (
              <Link
                title={compact ? "Creator Studio" : undefined}
                to="/admin/creator-mode"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center rounded-2xl text-emerald-500 transition-all duration-200 hover:bg-emerald-500/10 border border-transparent",
                  compact ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Sparkles className="h-4 w-4" />
                </div>
                {!compact && <span className="text-sm font-medium">Creator studio</span>}
              </Link>
            )}
            {isAdmin() && (
              <Link
                title={compact ? "Admin" : undefined}
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center rounded-2xl text-amber-500 transition-all duration-200 hover:bg-amber-500/10 border border-transparent",
                  compact ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Shield className="h-4 w-4" />
                </div>
                {!compact && <span className="text-sm font-medium">Admin panel</span>}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className={cn("border-t border-border py-4", compact ? "px-2" : "px-3")}>
        <button
          title={compact ? "Đăng xuất" : undefined}
          type="button"
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center rounded-2xl border border-border bg-muted/50 text-sm font-medium text-muted-foreground transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500",
            compact ? "justify-center px-2 py-2.5" : "justify-between px-4 py-3"
          )}
        >
          <span className={cn("flex items-center", compact ? "justify-center" : "gap-3")}>
            <LogOut className="h-4 w-4" />
            {!compact && "Đăng xuất"}
          </span>
          {!compact && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-sidebar backdrop-blur-2xl lg:block",
          collapsed ? "w-[80px]" : "w-[224px]"
        )}
      >
        <div className="relative h-full">{sidebarContent(collapsed)}</div>
      </aside>

      {/* Top Bar */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-2xl",
          collapsed ? "left-[80px]" : "left-[224px]"
        )}
      >
        <div className="flex h-[64px] items-center justify-between gap-4 px-4 sm:px-5 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open navigation"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground/80 lg:hidden"
              onClick={() => setMobileOpen(true)}
              type="button"
            >
              <Menu className="h-5 w-5" />
            </button>

            <button
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground/80 transition hover:bg-muted lg:inline-flex"
              onClick={onToggleCollapse}
              type="button"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Winter dashboard</p>
              <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              aria-label="Notifications"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground/80 transition hover:bg-muted"
              type="button"
            >
              <Bell className="h-4 w-4" />
            </button>

            <div className="hidden items-center gap-3 yukihon-card-flat px-3 py-2 cursor-default sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 text-sm font-semibold text-foreground">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">Màn đêm dịu mát</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm lg:hidden"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              type="button"
            />
            <motion.aside
              animate={{ x: 0 }}
              className="fixed inset-y-0 left-0 z-50 w-[272px] border-r border-border bg-sidebar backdrop-blur-2xl lg:hidden"
              exit={{ x: "-100%" }}
              initial={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <button
                aria-label="Close navigation"
                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground/80"
                onClick={() => setMobileOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
              {sidebarContent(false)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardNavigation;
