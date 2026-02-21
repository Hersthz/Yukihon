// src/components/DashboardNavigation.tsx

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Zap,
  GraduationCap,
  Search,
  Globe,
  Users,
  Bookmark,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { id: "vocabulary", label: "Vocabulary", path: "/vocabulary", icon: BookOpen },
  { id: "grammar", label: "Grammar", path: "/grammar", icon: Brain },
  { id: "quiz", label: "Quiz", path: "/quiz", icon: Zap },
  { id: "jlpt", label: "JLPT", path: "/jlpt-lessons", icon: GraduationCap },
  { id: "dictionary", label: "Dictionary", path: "/dictionary", icon: Search },
  { id: "courses", label: "Courses", path: "/courses", icon: Globe },
];

const DashboardNavigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const navContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const activeItem = NAV_ITEMS.find((item) => location.pathname === item.path)?.id || "dashboard";

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Pill indicator position
  const updatePill = useCallback(() => {
    if (!navContainerRef.current) return;
    const btn = navContainerRef.current.querySelector(
      `[data-nav="${activeItem}"]`
    ) as HTMLElement | null;
    if (btn) {
      setPillStyle({ left: btn.offsetLeft, width: btn.offsetWidth });
    }
  }, [activeItem]);

  useEffect(updatePill, [updatePill]);
  useEffect(() => {
    window.addEventListener("resize", updatePill);
    return () => window.removeEventListener("resize", updatePill);
  }, [updatePill]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("yukihon_token");
    localStorage.removeItem("yukihon_user");
    navigate("/");
  };

  const userName = (() => {
    try {
      const stored = localStorage.getItem("yukihon_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.displayName || "User";
      }
    } catch { /* ignore */ }
    return "User";
  })();

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled ? "py-1.5" : "py-2.5"
      )}
    >
      {/* Glass background */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-500",
          scrolled
            ? "bg-slate-950/85 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.3)] border-b border-cyan-500/10"
            : "bg-slate-950/60 backdrop-blur-xl"
        )}
      />

      {/* Accent glow line */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0"
        )}
      />

      <nav className="container relative mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 group shrink-0">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 grid place-items-center text-xl font-bold text-white shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-shadow"
          >
            日
          </motion.div>
          <div className="hidden sm:block leading-tight">
            <div className="text-[1.05rem] font-extrabold tracking-tight text-white">
              Yukihon
            </div>
            <div className="text-[0.6rem] text-cyan-400/60 font-medium">
              学習プラットフォーム
            </div>
          </div>
        </Link>

        {/* Center nav (desktop) */}
        <div className="hidden lg:flex flex-1 justify-center">
          <div
            ref={navContainerRef}
            className="relative flex items-center gap-0.5 rounded-full p-1 border border-white/8 bg-white/5 backdrop-blur-sm"
          >
            {/* Active pill indicator */}
            <motion.div
              className="absolute top-1 h-[calc(100%-8px)] rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
              animate={{ left: `${pillStyle.left}px`, width: `${pillStyle.width}px` }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  data-nav={item.id}
                  className={cn(
                    "relative z-10 flex items-center gap-1.5 px-3 xl:px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200",
                    isActive
                      ? "text-cyan-400"
                      : "text-slate-400 hover:text-white/80"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right actions (desktop) */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {/* User dropdown */}
          <div ref={userMenuRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 grid place-items-center">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white/90 font-medium max-w-[100px] truncate">{userName}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", userMenuOpen && "rotate-180")} />
            </motion.button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden"
                >
                  <div className="p-3 border-b border-white/5">
                    <p className="text-sm font-semibold text-white truncate">{userName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Learning in progress</p>
                  </div>
                  <div className="p-1.5">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/8 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      to="/my-words"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/8 hover:text-white transition-colors"
                    >
                      <Bookmark className="w-4 h-4" />
                      My Words
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/8 hover:text-white transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    {isAdmin() && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                  </div>
                  <div className="p-1.5 border-t border-white/5">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl border border-white/10 text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden"
          >
            <div className="border-t border-white/5 bg-slate-950/95 backdrop-blur-2xl">
              <div className="container mx-auto px-4 py-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.id;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-400 border border-cyan-500/20"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      {item.label}
                    </Link>
                  );
                })}

                <div className="pt-3 mt-3 border-t border-white/5 space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <User className="w-4.5 h-4.5" />
                    Profile
                  </Link>
                  <Link
                    to="/my-words"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Bookmark className="w-4.5 h-4.5" />
                    My Words
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all w-full"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default DashboardNavigation;
