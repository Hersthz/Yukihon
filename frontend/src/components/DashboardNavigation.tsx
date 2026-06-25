import { type ElementType, Fragment, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BookMarked,
  BookOpen,
  Bot,
  Brain,
  CalendarDays,
  ChevronRight,
  Compass,
  Globe2,
  GraduationCap,
  Home,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
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
import { useAutoMenu } from "@/hooks/useAutoMenu";
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

export const SIDEBAR_EXPANDED = 244;
export const SIDEBAR_COLLAPSED = 72;
export const TOPBAR_HEIGHT = 60;

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
      { label: "Học SRS", path: "/decks", icon: Layers, badge: "New" },
      { label: "Vocabulary", path: "/vocabulary", icon: BookOpen },
      { label: "Grammar", path: "/grammar", icon: Brain },
      { label: "Quiz", path: "/quiz", icon: Trophy, badge: "Hot" },
      { label: "Courses", path: "/courses", icon: Compass },
      { label: "My Words", path: "/my-words", icon: BookMarked },
    ],
  },
];

const ADMIN_ITEMS: NavItem[] = [
  { label: "Creator Studio", path: "/admin/creator-mode", icon: Wand2 },
  { label: "Story Admin", path: "/admin/story-mode", icon: BookOpen },
  { label: "Admin Panel", path: "/admin", icon: Shield },
];

const PERSONAL_ITEMS: NavItem[] = [{ label: "Profile", path: "/profile", icon: User }];

const PAGE_META: Record<string, { title: string }> = {
  "/dashboard": { title: "Dashboard" },
  "/calendar": { title: "Lịch học" },
  "/dictionary": { title: "Từ điển" },
  "/story-mode": { title: "Story Mode" },
  "/ai-chat": { title: "AI Chat" },
  "/translation": { title: "Dịch thuật" },
  "/community": { title: "Cộng đồng" },
  "/mistake-dna": { title: "Mistake DNA" },
  "/jlpt-lessons": { title: "JLPT Paths" },
  "/vocabulary": { title: "Từ vựng" },
  "/decks": { title: "Học SRS" },
  "/grammar": { title: "Ngữ pháp" },
  "/quiz": { title: "Quiz" },
  "/courses": { title: "Khóa học" },
  "/kanji-library": { title: "Kanji Library" },
  "/kanji": { title: "Kanji" },
  "/my-words": { title: "My Words" },
  "/profile": { title: "Hồ sơ" },
  "/credits": { title: "Credits" },
  "/admin": { title: "Admin" },
  "/admin/users": { title: "Người dùng" },
  "/admin/content": { title: "Content CMS" },
  "/admin/story-mode": { title: "StoryMode Admin" },
  "/admin/creator-mode": { title: "Creator Studio" },
  "/admin/app-settings": { title: "App Settings" },
};

const AUTO_MENU_ICONS: Record<string, ElementType> = {
  settings: Settings,
  dashboard: LayoutDashboard,
  users: Users,
  trophy: Trophy,
  book: BookOpen,
  table: LayoutDashboard,
};

const resolveAutoIcon = (name: string): ElementType => AUTO_MENU_ICONS[name] ?? Settings;

const isItemActive = (pathname: string, itemPath: string) =>
  pathname === itemPath || pathname.startsWith(`${itemPath}/`);

const humanize = (segment: string) =>
  decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

type Crumb = { path: string; label: string; isLast: boolean };

const buildCrumbs = (pathname: string): Crumb[] => {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];
  let acc = "";
  segments.forEach((segment, index) => {
    acc += `/${segment}`;
    crumbs.push({
      path: acc,
      label: PAGE_META[acc]?.title ?? humanize(segment),
      isLast: index === segments.length - 1,
    });
  });
  return crumbs;
};

const DashboardNavigation = ({ collapsed, onToggleCollapse }: DashboardNavigationProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, logout, user } = useAuth();
  const { data: autoMenu = [] } = useAutoMenu();

  const onCommunityPage = isItemActive(location.pathname, "/community");

  const { unreadCount, markRead } = useRealtimeChat({
    roomId: "general",
    enabled: isAuthenticated && !onCommunityPage,
    currentUserId: user?.id,
    loadHistory: false,
    trackUnread: true,
  });
  const {
    summary: reminderSummary,
    loading: remindersLoading,
    refresh: refreshReminders,
  } = useReminders(isAuthenticated);

  useEffect(() => {
    if (onCommunityPage) {
      markRead();
    }
  }, [markRead, onCommunityPage]);

  const crumbs = useMemo(() => buildCrumbs(location.pathname), [location.pathname]);
  const currentTitle = crumbs[crumbs.length - 1]?.label ?? "Yukihon";

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
          "group relative flex items-center rounded-lg text-sm transition-colors duration-150",
          compact ? "h-10 justify-center" : "gap-3 px-3 py-2",
          active
            ? "bg-primary/10 font-semibold text-primary"
            : "font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
        )}
      >
        {active && !compact && (
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary" />
        )}
        <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")} />
        {!compact && (
          <>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {computedBadge && (
              <span className="rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                {computedBadge}
              </span>
            )}
          </>
        )}
      </Link>
    );
  };

  const renderGroup = (label: string, items: NavItem[], compact: boolean) => (
    <div key={label} className="mb-4">
      {compact ? (
        <div className="mx-auto mb-2 h-px w-6 bg-border" />
      ) : (
        <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">
          {label}
        </p>
      )}
      <div className="space-y-0.5">{items.map((item) => renderItem(item, compact))}</div>
    </div>
  );

  const sidebarContent = (compact: boolean) => (
    <div className="flex h-full flex-col">
      {/* Header: ☰ toggle + brand */}
      <div
        className={cn(
          "flex items-center border-b border-border/70",
          compact ? "h-[60px] justify-center px-2" : "h-[60px] gap-2 px-3"
        )}
      >
        <button
          aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-foreground/70 transition hover:bg-muted hover:text-foreground"
          onClick={onToggleCollapse}
          type="button"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>
        {!compact && (
          <Link
            to="/dashboard"
            className="flex min-w-0 items-center gap-2"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ffcdc4]">
              <span className="display-font text-lg font-bold text-foreground">Y</span>
            </div>
            <span className="display-font truncate text-lg font-bold tracking-tight text-foreground">
              Yukihon
            </span>
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav className={cn("flex-1 overflow-y-auto py-3", compact ? "px-2" : "px-2")}>
        {NAV_GROUPS.map((group) => renderGroup(group.label, group.items, compact))}

        {autoMenu.map((group) =>
          renderGroup(
            group.group,
            group.items.map((item) => ({
              label: item.title,
              path: item.url,
              icon: resolveAutoIcon(item.icon),
            })),
            compact
          )
        )}

        {renderGroup("Personal", PERSONAL_ITEMS, compact)}
        {isAdmin() && renderGroup("Admin", ADMIN_ITEMS, compact)}
      </nav>

      {/* Footer: user + sign out */}
      <div className={cn("border-t border-border/70 p-2", compact && "px-2")}>
        {!compact && (
          <div className="mb-1 flex items-center gap-2.5 rounded-lg px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e6f7ff] text-sm font-bold text-foreground">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">Light study system</p>
            </div>
          </div>
        )}
        <button
          title={compact ? "Đăng xuất" : undefined}
          type="button"
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center rounded-lg text-sm font-medium text-foreground/70 transition hover:bg-rose-50 hover:text-rose-600",
            compact ? "h-10 justify-center" : "gap-3 px-3 py-2"
          )}
        >
          <LogOut className="h-[18px] w-[18px]" />
          {!compact && "Đăng xuất"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar (flush, full-height) */}
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden border-r border-border/70 bg-white/95 backdrop-blur-xl transition-[width] duration-300 lg:block"
        style={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
      >
        {sidebarContent(collapsed)}
      </aside>

      {/* Desktop topbar with breadcrumb */}
      <header
        className="fixed right-0 top-0 z-30 hidden border-b border-border/70 bg-white/85 backdrop-blur-xl transition-[left] duration-300 lg:block"
        style={{ left: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED, height: TOPBAR_HEIGHT }}
      >
        <div className="flex h-full items-center justify-between gap-4 px-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
            <Link
              to="/dashboard"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <Home className="h-4 w-4" />
            </Link>
            {crumbs.map((crumb) => (
              <Fragment key={crumb.path}>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                {crumb.isLast ? (
                  <span className="truncate font-semibold text-foreground">{crumb.label}</span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="truncate text-muted-foreground transition hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                )}
              </Fragment>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/dictionary")}
              className="hidden items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted xl:flex"
            >
              <Search className="h-4 w-4" />
              <span className="text-xs">Tra cứu từ vựng, kanji…</span>
            </button>

            <Popover onOpenChange={(open) => open && void refreshReminders()}>
              <PopoverTrigger asChild>
                <button
                  aria-label="Thông báo"
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-white text-foreground/70 transition hover:bg-muted"
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
              <PopoverContent
                align="end"
                className="w-[360px] rounded-[1rem] border-border/70 bg-white p-3"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Nhắc nhở</p>
                    <p className="text-xs text-muted-foreground">
                      Ôn tập đến hạn, tiến độ truyện và tín hiệu chat.
                    </p>
                  </div>
                  {reminderSummary.urgentCount > 0 ? (
                    <Badge className="bg-rose-500 text-white">Gấp</Badge>
                  ) : null}
                </div>

                <div className="space-y-2">
                  {unreadCount > 0 && (
                    <button
                      className="w-full rounded-lg border border-sky-100 bg-sky-50/80 p-3 text-left transition hover:bg-sky-50"
                      onClick={() => {
                        markRead();
                        navigate("/community");
                      }}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Tin nhắn cộng đồng mới
                          </p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {unreadCount} tin chưa đọc trong phòng general.
                          </p>
                        </div>
                        <Badge variant="outline">{unreadCount}</Badge>
                      </div>
                    </button>
                  )}

                  {remindersLoading && (
                    <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                      Đang tải reminder...
                    </div>
                  )}

                  {!remindersLoading && reminderSummary.items.length === 0 && unreadCount === 0 && (
                    <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
                      <p className="text-sm font-semibold text-foreground">Không có gì đến hạn</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Hàng đợi đang sạch. Một cảnh hiếm gặp, tận hưởng đi.
                      </p>
                    </div>
                  )}

                  {!remindersLoading &&
                    reminderSummary.items.map((item) => (
                      <button
                        key={item.id}
                        className="w-full rounded-lg border border-border bg-card p-3 text-left transition hover:bg-muted/40"
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
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              {item.description}
                            </p>
                            <p className="mt-2 text-xs font-semibold text-primary">
                              {item.actionLabel}
                            </p>
                          </div>
                          <Badge variant="outline">{item.count}</Badge>
                        </div>
                      </button>
                    ))}
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-white px-2 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#ffded8] text-xs font-bold text-foreground">
                {userInitial}
              </div>
              <span className="hidden max-w-[120px] truncate text-sm font-semibold text-foreground sm:block">
                {userName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-[56px] items-center justify-between border-b border-border/70 bg-white/90 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ffcdc4]">
            <span className="display-font text-base font-bold text-foreground">Y</span>
          </div>
          <p className="truncate text-base font-semibold text-foreground">{currentTitle}</p>
        </div>
        <Button
          aria-label="Mở menu"
          size="icon"
          variant="outline"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile drawer */}
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
              className="fixed inset-y-0 left-0 z-50 w-[260px] overflow-hidden border-r border-border/70 bg-white lg:hidden"
              exit={{ x: "-110%" }}
              initial={{ x: "-110%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
            >
              <button
                aria-label="Đóng menu"
                className="absolute right-3 top-[14px] inline-flex h-8 w-8 items-center justify-center rounded-lg text-foreground/70 hover:bg-muted"
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
