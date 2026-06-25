import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { WinterMark, WinterThemeToggle } from "@/components/winter";

type SectionId = "hero" | "how-it-works" | "jlpt" | "features" | "testimonials";

const NAV_SECTIONS: { id: SectionId; label: string }[] = [
  { id: "hero", label: "Trang chủ" },
  { id: "how-it-works", label: "Phương pháp" },
  { id: "jlpt", label: "JLPT" },
  { id: "features", label: "Tính năng" },
  { id: "testimonials", label: "Cảm nhận" },
];

interface NavigationProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

const Navigation = ({ isDark, onToggleTheme }: NavigationProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const isHome = location.pathname === "/";
  const primaryCta = useMemo(() => (isAuthenticated ? "/dashboard" : "/auth"), [isAuthenticated]);

  const scrollToSection = useCallback(
    (id: SectionId) => {
      const run = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      };

      if (!isHome) {
        navigate("/", { replace: false });
        setTimeout(run, 80);
        return;
      }

      run();
    },
    [isHome, navigate]
  );

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 18);

      const sections = [...NAV_SECTIONS].reverse();
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && y >= element.offsetTop - 180) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "pt-3" : "pt-5"
      )}
    >
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between px-4 sm:px-6">
        <div
          className={cn(
            "winter-glass flex w-full items-center justify-between gap-4 px-4 py-3 transition-all sm:px-5",
            scrolled && "shadow-lg"
          )}
        >
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                color: "hsl(var(--w-accent-fg))",
                background:
                  "linear-gradient(135deg, hsl(var(--w-accent)), hsl(var(--w-accent-strong)))",
                boxShadow: "0 8px 20px -10px hsl(var(--w-accent) / 0.8)",
              }}
            >
              <WinterMark size={20} />
            </div>
            <div className="min-w-0">
              <p
                className="truncate text-xl font-black tracking-tight"
                style={{ color: "hsl(var(--w-ink))" }}
              >
                Yukihon
              </p>
              <p
                className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] sm:block"
                style={{ color: "hsl(var(--w-ink-faint))" }}
              >
                Học nhẹ nhàng, đi đường dài
              </p>
            </div>
          </Link>

          <div
            className="hidden items-center gap-1 rounded-full p-1 lg:flex"
            style={{
              background: "hsl(var(--w-accent) / 0.06)",
              border: "1px solid hsl(var(--w-glass-border))",
            }}
          >
            {NAV_SECTIONS.map((section) => {
              const active = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="rounded-full px-4 py-1.5 text-sm font-semibold transition-all"
                  style={{
                    color: active ? "hsl(var(--w-accent-fg))" : "hsl(var(--w-ink-soft))",
                    background: active
                      ? "linear-gradient(135deg, hsl(var(--w-accent)), hsl(var(--w-accent-strong)))"
                      : "transparent",
                    boxShadow: active ? "0 8px 18px -10px hsl(var(--w-accent) / 0.7)" : "none",
                  }}
                  type="button"
                >
                  {section.label}
                </button>
              );
            })}
          </div>

          <div className="hidden items-center gap-2.5 lg:flex">
            <WinterThemeToggle isDark={isDark} onToggle={onToggleTheme} />
            <Link
              to={isAuthenticated ? "/dashboard" : "/auth"}
              className="px-2 text-sm font-semibold transition-colors"
              style={{ color: "hsl(var(--w-ink-soft))" }}
            >
              {isAuthenticated ? "Tổng quan" : "Đăng nhập"}
            </Link>
            <Link to={primaryCta} className="winter-btn px-5 py-2.5 text-sm">
              {isAuthenticated ? "Vào học" : "Bắt đầu miễn phí"}
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <WinterThemeToggle isDark={isDark} onToggle={onToggleTheme} />
            <button
              type="button"
              onClick={() => setMobileOpen((previous) => !previous)}
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                color: "hsl(var(--w-ink))",
                background: "hsl(var(--w-card))",
                border: "1px solid hsl(var(--w-glass-border))",
              }}
              aria-label="Mở menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={cn(
          "mx-auto mt-3 max-w-[1280px] overflow-hidden px-4 transition-all duration-300 sm:px-6 lg:hidden",
          mobileOpen ? "max-h-[440px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="winter-glass p-4">
          <div className="space-y-2">
            {NAV_SECTIONS.map((section) => (
              <button
                key={section.id}
                className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all"
                style={{
                  color: "hsl(var(--w-ink))",
                  background: "hsl(var(--w-accent) / 0.07)",
                }}
                onClick={() => {
                  scrollToSection(section.id);
                  setMobileOpen(false);
                }}
                type="button"
              >
                <span>{section.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link to="/courses" onClick={() => setMobileOpen(false)} className="winter-btn-ghost">
              Khám phá khóa học
            </Link>
            <Link to={primaryCta} onClick={() => setMobileOpen(false)} className="winter-btn">
              {isAuthenticated ? "Vào học" : "Bắt đầu miễn phí"}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
