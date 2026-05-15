import { type ElementType, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BookMarked,
  BookOpen,
  Bot,
  Brain,
  CalendarDays,
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
  Trophy,
  User,
  Users,
  Wand2,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeChat } from "@/hooks/community/useRealtimeChat";
import { useReminders } from "@/hooks/use-reminders";

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

const SIDEBAR_EXPANDED = 296;
const SIDEBAR_COLLAPSED = 112;

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Explore",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Calendar", path: "/calendar", icon: CalendarDays },
      { label: "Dictionary", path: "/dictionary", icon: Search },
      { label: "Story Mode", path: "/story-mode", icon: BookOpen, badge: "New" },
      { label: "AI Chat", path: "/ai-chat", icon: Bot, badge: "Beta" },
      { label: "Translation", path: "/translation", icon: Globe2 },
      { label: "Community", path: "/community", icon: Users },
      { label: "Mistake DNA", path: "/mistake-dna", icon: Sparkles },
      { label: "JLPT Paths", path: "/jlpt-lessons", icon: GraduationCap },
    ],
  },
  {
    label: "Practice",
    items: [
      { label: "Vocabulary", path: "/vocabulary", icon: BookOpen },
      { label: "Grammar", path: "/grammar", icon: Brain },
      { label: "Quiz", path: "/quiz", icon: Trophy, badge: "Hot" },
      { label: "Courses", path: "/courses", icon: Compass },
      { label: "My Words", path: "/my-words", icon: BookMarked },
    ],
  },
];

const PERSONAL_ITEMS: NavItem[] = [{ label: "Profile", path: "/profile", icon: User }];

const PAGE_META: Record<string, { eyebrow: string; title: string }> = {
  "/dashboard": { eyebrow: "Study cockpit", title: "Dashboard" },
  "/calendar": { eyebrow: "Daily rhythm", title: "Calendar" },
  "/dictionary": { eyebrow: "Search and save", title: "Dictionary" },
  "/story-mode": { eyebrow: "Narrative practice", title: "Story Mode" },
  "/ai-chat": { eyebrow: "Personal helper", title: "AI Chat" },
  "/translation": { eyebrow: "Translate and compare", title: "Translation" },
  "/community": { eyebrow: "Learn together", title: "Community" },
  "/mistake-dna": { eyebrow: "Pattern insights", title: "Mistake DNA" },
  "/jlpt-lessons": { eyebrow: "Structured learning", title: "JLPT Paths" },
  "/vocabulary": { eyebrow: "Words and review", title: "Vocabulary" },
  "/grammar": { eyebrow: "Pattern library", title: "Grammar" },
  "/quiz": { eyebrow: "Quick checks", title: "Quiz" },
  "/courses": { eyebrow: "Full programs", title: "Courses" },
  "/kanji-library": { eyebrow: "Characters and meaning", title: "Kanji Library" },
  "/my-words": { eyebrow: "Your notebook", title: "My Words" },
  "/profile": { eyebrow: "Account and goals", title: "Profile" },
  "/admin": { eyebrow: "Control room", title: "Admin Dashboard" },
  "/admin/users": { eyebrow: "Operations", title: "User Management" },
  "/admin/content": { eyebrow: "Editorial workspace", title: "Content CMS" },
  "/admin/story-mode": { eyebrow: "Narrative CMS", title: "StoryMode Admin" },
  "/admin/creator-mode": { eyebrow: "Builder workspace", title: "Creator Studio" },
};

const isItemActive = (pathname: string, itemPath: string) =>
  pathname === itemPath || pathname.startsWith(`${itemPath}/`);

const DashboardNavigation = ({ collapsed, onToggleCollapse }: DashboardNavigationProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, logout, user } = useAuth();

  const onCommunityPage = isItemActive(location.pathname, "/community");

  const { unreadCount, markRead } = useRealtimeChat({
    roomId: "general",
    enabled: isAuthenticated && !onCommunityPage,
    currentUserId: user?.id,
    loadHistory: false,
    trackUnread: true,
  });
  const { summary: reminderSummary, loading: remindersLoading, refresh: refreshReminders } = useReminders(isAuthenticated);

  useEffect(() => {
    if (onCommunityPage) {
      markRead();
    }
  }, [markRead, onCommunityPage]);

  const pageMeta = useMemo(
    () => PAGE_META[location.pathname] ?? { eyebrow: "Yukihon workspace", title: "Learning space" },
    [location.pathname]
  );

  const userName = user?.displayName || "Learner";
  const userInitial = userName.charAt(0).toUpperCase();
  const notificationCount = unreadCount + reminderSummary.totalCount;

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const renderItem = (item: NavItem, compact: boolean) => {
    const Icon = item.icon;
    const active = isItemActive(location.pathname, item.path);
    const computedBadge =
      item.path === "/community" && unreadCount > 0
        ? unreadCount > 99
          ? "99+"
          : String(unreadCount)
        : item.badge;

    return (
      <Link
        key={item.path}
        title={compact ? item.label : undefined}
        to={item.path}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "group flex items-center rounded-[1.2rem] transition-all duration-200",
          compact ? "justify-center px-2 py-2.5" : "justify-between px-3 py-3",
          active
            ? "bg-[#eef9ee] text-foreground shadow-[inset_0_0_0_2px_rgba(34,197,94,0.12)]"
            : "text-foreground/72 hover:bg-white/90 hover:text-foreground"
        )}
      >
        <div className={cn("flex min-w-0 items-center", compact ? "justify-center" : "gap-3")}>
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-[1rem] transition-colors",
              active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-secondary"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          {!compact && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{item.label}</p>
              {computedBadge && (
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  {computedBadge}
                </p>
              )}
            </div>
          )}
        </div>

        {!compact && !computedBadge && (
          <ChevronRight className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
        )}
      </Link>
    );
  };

  const sidebarContent = (compact: boolean) => (
    <div className="flex h-full flex-col">
      <div className={cn("border-b border-border/80", compact ? "px-3 py-4" : "px-4 py-5")}>
        <Link
          to="/dashboard"
          className={cn("flex items-center", compact ? "justify-center" : "gap-3")}
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-[#ffcdc4] text-xl text-foreground">
            <span className="display-font text-2xl font-bold">Y</span>
          </div>
          {!compact && (
            <div className="min-w-0">
              <p className="truncate text-[1.35rem] font-black tracking-tight text-foreground">Yukihon</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Light study system
              </p>
            </div>
          )}
        </Link>

        {!compact && (
          <div className="mt-4 rounded-[1.45rem] border border-border/80 bg-[#f8fbf7] p-3 shadow-[0_12px_24px_-22px_rgba(32,48,74,0.35)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[#e6f7ff] text-sm font-bold text-foreground">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
                <div className="mt-1 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-[#ff8b4b]" />
                    12 day
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Focus
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={cn("flex-1 overflow-y-auto pb-4", compact ? "px-2 pt-4" : "px-3 pt-5")}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            {!compact && (
              <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {group.label}
              </p>
            )}
            <div className="space-y-1.5">{group.items.map((item) => renderItem(item, compact))}</div>
          </div>
        ))}

        <div className="mb-4">
          {!compact && (
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Personal
            </p>
          )}
          <div className="space-y-1.5">
            {PERSONAL_ITEMS.map((item) => renderItem(item, compact))}
            {isAdmin() && (
              <Link
                to="/admin/creator-mode"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center rounded-[1.2rem] transition-all duration-200",
                  compact ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-3",
                  "bg-[#fff7e5] text-foreground hover:bg-[#fff1cd]"
                )}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#d4efff] text-foreground">
                  <Wand2 className="h-4 w-4" />
                </div>
                {!compact && <span className="text-sm font-semibold">Creator Studio</span>}
              </Link>
            )}
            {isAdmin() && (
              <Link
                to="/admin/story-mode"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center rounded-[1.2rem] transition-all duration-200",
                  compact ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-3",
                  "bg-[#fff0f3] text-foreground hover:bg-[#ffe4eb]"
                )}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#ffd8df] text-foreground">
                  <BookOpen className="h-4 w-4" />
                </div>
                {!compact && <span className="text-sm font-semibold">Story Admin</span>}
              </Link>
            )}
            {isAdmin() && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center rounded-[1.2rem] transition-all duration-200",
                  compact ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-3",
                  "bg-[#f6f2ff] text-foreground hover:bg-[#efe6ff]"
                )}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#e2daff] text-foreground">
                  <Shield className="h-4 w-4" />
                </div>
                {!compact && <span className="text-sm font-semibold">Admin Panel</span>}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className={cn("border-t border-border/80 py-4", compact ? "px-2" : "px-3")}>
        <button
          title={compact ? "Sign out" : undefined}
          type="button"
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center rounded-[1.2rem] bg-white px-4 py-3 text-sm font-semibold text-foreground/72 transition hover:bg-[#fff2f2] hover:text-[#d14f4f]",
            compact ? "justify-center px-2" : "justify-between",
            "border border-border/80"
          )}
        >
          <span className={cn("flex items-center", compact ? "justify-center" : "gap-3")}>
            <LogOut className="h-4 w-4" />
            {!compact && "Sign out"}
          </span>
          {!compact && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-4 left-4 z-40 hidden overflow-hidden rounded-[2rem] border-2 border-border/80 bg-white/86 shadow-[0_28px_70px_-42px_rgba(32,48,74,0.42)] backdrop-blur-2xl lg:block",
          collapsed ? "w-[96px]" : "w-[280px]"
        )}
      >
        {sidebarContent(collapsed)}
      </aside>

      <div
        className="fixed right-4 top-4 z-50 hidden rounded-[1.8rem] border-2 border-border/80 bg-white/88 shadow-[0_24px_64px_-42px_rgba(32,48,74,0.38)] backdrop-blur-2xl lg:block"
        style={{ left: collapsed ? SIDEBAR_COLLAPSED + 24 : SIDEBAR_EXPANDED + 16 }}
      >
        <div className="flex h-[84px] items-center justify-between gap-4 px-5 xl:px-6">
          <div className="flex items-center gap-3">
            <button
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-border/80 bg-card text-foreground/80 transition hover:bg-muted"
              onClick={onToggleCollapse}
              type="button"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {pageMeta.eyebrow}
              </p>
              <h1 className="display-font text-[2rem] leading-none text-foreground">{pageMeta.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dictionary")}
              className="hidden min-w-[260px] items-center gap-3 rounded-[1.1rem] border border-border/80 bg-[#f8fbff] px-4 py-3 text-sm text-muted-foreground transition hover:bg-white xl:flex"
            >
              <Search className="h-4 w-4 text-primary" />
              Quick search vocabulary or kanji
            </button>

            <Popover onOpenChange={(open) => open && void refreshReminders()}>
              <PopoverTrigger asChild>
                <button
                  aria-label="Notifications"
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-border/80 bg-card text-foreground/80 transition hover:bg-muted"
                  type="button"
                >
                  <Bell className="h-4 w-4" />
                  {notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[360px] rounded-[1.4rem] border-border/80 bg-white p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Reminders</p>
                    <p className="text-xs text-muted-foreground">Due reviews, story progress, and chat signals.</p>
                  </div>
                  {reminderSummary.urgentCount > 0 ? <Badge className="bg-rose-500 text-white">Urgent</Badge> : null}
                </div>

                <div className="space-y-2">
                  {unreadCount > 0 && (
                    <button
                      className="w-full rounded-[1rem] border border-sky-100 bg-sky-50/80 p-3 text-left transition hover:bg-sky-50"
                      onClick={() => {
                        markRead();
                        navigate("/community");
                      }}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Tin nhắn cộng đồng mới</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{unreadCount} tin chưa đọc trong phòng general.</p>
                        </div>
                        <Badge variant="outline">{unreadCount}</Badge>
                      </div>
                    </button>
                  )}

                  {remindersLoading && (
                    <div className="rounded-[1rem] border border-border bg-muted/40 p-3 text-sm text-muted-foreground">Đang tải reminder...</div>
                  )}

                  {!remindersLoading && reminderSummary.items.length === 0 && unreadCount === 0 && (
                    <div className="rounded-[1rem] border border-border bg-muted/30 p-4 text-center">
                      <p className="text-sm font-semibold text-foreground">Không có gì đến hạn</p>
                      <p className="mt-1 text-xs text-muted-foreground">Hàng đợi đang sạch. Một cảnh hiếm gặp, tận hưởng đi.</p>
                    </div>
                  )}

                  {!remindersLoading && reminderSummary.items.map((item) => (
                    <button
                      key={item.id}
                      className="w-full rounded-[1rem] border border-border bg-card p-3 text-left transition hover:bg-muted/40"
                      onClick={() => navigate(item.actionPath)}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{item.title}</p>
                            <Badge
                              variant="outline"
                              className={
                                item.priority === "HIGH"
                                  ? "border-rose-200 bg-rose-50 text-rose-700"
                                  : item.priority === "MEDIUM"
                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                    : "border-sky-200 bg-sky-50 text-sky-700"
                              }
                            >
                              {item.priority}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                          <p className="mt-2 text-xs font-semibold text-primary">{item.actionLabel}</p>
                        </div>
                        <Badge variant="outline">{item.count}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <div className="hidden items-center gap-3 rounded-[1.2rem] border border-border/80 bg-white px-3 py-2.5 shadow-[0_10px_28px_-24px_rgba(32,48,74,0.35)] sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-[#ffded8] text-sm font-bold text-foreground">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">Light theme workspace</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 pt-4 lg:hidden">
        <div className="rounded-[1.2rem] border-2 border-border/80 bg-white/92 px-4 py-3 shadow-[0_18px_46px_-28px_rgba(32,48,74,0.3)] backdrop-blur-xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{pageMeta.eyebrow}</p>
          <p className="display-font text-2xl leading-none">{pageMeta.title}</p>
        </div>

        <Button
          aria-label="Open navigation"
          className="shadow-[0_18px_46px_-28px_rgba(32,48,74,0.3)]"
          size="icon"
          variant="outline"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-40 bg-[rgba(35,49,74,0.18)] backdrop-blur-sm lg:hidden"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              type="button"
            />
            <motion.aside
              animate={{ x: 0 }}
              className="fixed inset-y-4 left-4 z-50 w-[286px] overflow-hidden rounded-[2rem] border-2 border-border/80 bg-white/94 shadow-[0_32px_72px_-40px_rgba(32,48,74,0.42)] backdrop-blur-2xl lg:hidden"
              exit={{ x: "-110%" }}
              initial={{ x: "-110%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
            >
              <button
                aria-label="Close navigation"
                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-[1rem] border border-border/80 bg-card text-foreground/80"
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
