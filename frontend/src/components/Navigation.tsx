import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

type SectionId = "hero" | "how-it-works" | "jlpt" | "features" | "testimonials";

const NAV_SECTIONS: { id: SectionId; label: string }[] = [
  { id: "hero", label: "Home" },
  { id: "how-it-works", label: "Method" },
  { id: "jlpt", label: "JLPT" },
  { id: "features", label: "Features" },
  { id: "testimonials", label: "Stories" },
];

const Navigation = () => {
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
        scrolled ? "pt-4" : "pt-6"
      )}
    >
      <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-6">
        <div className="surface-panel flex w-full items-center justify-between gap-4 bg-white/92 px-5 py-4 backdrop-blur-xl sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-[#ffcfc6]">
              <span className="display-font text-2xl font-bold text-foreground">Y</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-2xl font-black tracking-tight text-foreground">Yukihon</p>
              <p className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:block">
                Learn light, stay consistent
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 rounded-full bg-[#fbf7f2] p-1 lg:flex">
            {NAV_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-all",
                  activeSection === section.id
                    ? "bg-white text-foreground shadow-[0_10px_20px_-18px_rgba(32,48,74,0.5)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
                type="button"
              >
                {section.label}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to={isAuthenticated ? "/dashboard" : "/auth"}
              className="px-2 text-sm font-semibold text-foreground/72 transition-colors hover:text-foreground"
            >
              {isAuthenticated ? "Dashboard" : "Log in"}
            </Link>
            <Link to={primaryCta}>
              <Button className="min-w-[160px]">
                {isAuthenticated ? "Open Dashboard" : "Start Free"}
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Link to={primaryCta}>
              <Button size="sm">{isAuthenticated ? "Dashboard" : "Start"}</Button>
            </Link>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setMobileOpen((previous) => !previous)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </nav>

      <div
        className={cn(
          "mx-auto mt-3 max-w-[1440px] overflow-hidden px-4 transition-all duration-300 sm:px-6 lg:hidden",
          mobileOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="rounded-[1.8rem] border-2 border-border/80 bg-white/96 p-4 shadow-[0_26px_60px_-36px_rgba(32,48,74,0.32)] backdrop-blur-xl">
          <div className="space-y-2">
            {NAV_SECTIONS.map((section) => (
              <button
                key={section.id}
                className={cn(
                  "flex w-full items-center justify-between rounded-[1rem] px-4 py-3 text-left text-sm font-semibold transition-all",
                  activeSection === section.id
                    ? "bg-[#f0faf0] text-foreground"
                    : "bg-[#faf7f3] text-foreground/75"
                )}
                onClick={() => {
                  scrollToSection(section.id);
                  setMobileOpen(false);
                }}
                type="button"
              >
                <span>{section.label}</span>
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Go
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link to="/courses" onClick={() => setMobileOpen(false)}>
              <Button className="w-full" variant="outline">
                Browse Courses
              </Button>
            </Link>
            <Link to={primaryCta} onClick={() => setMobileOpen(false)}>
              <Button className="w-full">
                {isAuthenticated ? "Open Dashboard" : "Start Free"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
