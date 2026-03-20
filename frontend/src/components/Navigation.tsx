// src/components/Navigation.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

type SectionId = "hero" | "how-it-works" | "jlpt" | "features" | "testimonials";

const NAV_SECTIONS: { id: SectionId; label: string }[] = [
  { id: "hero", label: "Home" },
  { id: "how-it-works", label: "How" },
  { id: "jlpt", label: "JLPT" },
  { id: "features", label: "Features" },
  { id: "testimonials", label: "Stories" },
];

const Navigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const [scrolled, setScrolled] = useState(false);
  const [pillStyle, setPillStyle] = useState({ left: 4, width: 0 });
  const navContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";

  const scrollToSection = useCallback(
    (id: SectionId) => {
      const doScroll = () => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      if (!isHome) {
        navigate("/", { replace: false });
        setTimeout(doScroll, 80);
      } else {
        doScroll();
      }
    },
    [isHome, navigate]
  );

  /* ── Scroll spy ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!isHome) return;
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 30);
      const ids = [...NAV_SECTIONS].reverse().map((s) => s.id);
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && y >= el.offsetTop - 160) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  /* ── Pill indicator position ────────────────────────────────── */
  const updatePill = useCallback(() => {
    if (!navContainerRef.current) return;
    const btn = navContainerRef.current.querySelector(
      `[data-section="${activeSection}"]`
    ) as HTMLElement | null;
    if (btn) {
      setPillStyle({ left: btn.offsetLeft, width: btn.offsetWidth });
    }
  }, [activeSection]);

  useEffect(updatePill, [updatePill]);

  useEffect(() => {
    window.addEventListener("resize", updatePill);
    return () => window.removeEventListener("resize", updatePill);
  }, [updatePill]);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-700",
        scrolled ? "py-1" : "py-4 md:py-6"
      )}
    >
      {/* Glassmorphic background — adapts to light / dark via CSS vars */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-500",
          scrolled
            ? "bg-background/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.25)] border-b border-border/40"
            : "bg-transparent"
        )}
      />

      {/* Accent line */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-8 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0"
        )}
      />

      <nav className="container relative mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-secondary grid place-items-center text-xl font-bold text-primary-foreground shadow-lg shadow-primary/10 group-hover:shadow-primary/30 transition-shadow display-font italic">
            雪
          </div>
          <div className="hidden md:block leading-tight">
            <div className="text-[1.1rem] font-extrabold tracking-tight">Yukihon</div>
            <div className="text-[0.65rem] text-muted-foreground">
              JLPT N5 → N1 • 15 min / day
            </div>
          </div>
        </Link>

        {/* ── Center pill nav (desktop) ── */}
        <div className="hidden md:flex flex-1 justify-center">
          <div
            ref={navContainerRef}
            className="relative flex items-center gap-0.5 rounded-full p-1 border border-border/40 bg-muted/50 backdrop-blur-sm"
          >
            {/* Animated indicator pill */}
            <div
              className="absolute top-1 h-[calc(100%-8px)] rounded-full bg-background shadow-sm border border-border/50 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{ left: `${pillStyle.left}px`, width: `${pillStyle.width}px` }}
            />
            {NAV_SECTIONS.map((s) => (
              <button
                key={s.id}
                data-section={s.id}
                onClick={() => scrollToSection(s.id)}
                className={cn(
                  "relative z-10 px-4 lg:px-5 py-1.5 rounded-full text-sm font-medium transition-colors duration-200",
                  activeSection === s.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground/80"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Right actions (desktop) ── */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <Link
            to="/courses"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Courses
          </Link>
          <Link to="/auth">
            <Button
              size="sm"
              className="rounded-full px-5 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:brightness-110 transition-all"
            >
              Start free trial
            </Button>
          </Link>
        </div>

        {/* ── Mobile compact actions ── */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Link to="/auth">
            <Button
              size="sm"
              className="rounded-full px-3 bg-primary text-primary-foreground font-semibold shadow-md"
            >
              Free trial
            </Button>
          </Link>
          <button
            className="p-2 rounded-full border border-border/50 text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* ── Mobile slide-down menu ── */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-500 ease-in-out",
          mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="border-t border-border/10 bg-background/95 backdrop-blur-3xl">
          <div className="container mx-auto px-4 sm:px-6 py-4 space-y-3">
            {/* Section pills */}
            <div className="flex gap-2 pb-3 border-b border-border/30 overflow-x-auto">
              {NAV_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    scrollToSection(s.id);
                    setMobileOpen(false);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap",
                    activeSection === s.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/40 text-muted-foreground bg-muted/30"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Route links */}
            {[
              { to: "/courses", label: "Courses" },
              { to: "/dictionary", label: "Dictionary" },
              { to: "/translation", label: "Translate" },
              { to: "/community", label: "Community" },
              { to: "/my-words", label: "My Words" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 space-y-2">
              <Link to="/auth" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full rounded-full border-border/50">
                  Log in
                </Button>
              </Link>
              <Link to="/auth" onClick={() => setMobileOpen(false)}>
                <Button className="w-full rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                  Start free trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
