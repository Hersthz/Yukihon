// src/components/Navigation.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";
import { DynamicNavigation } from "../components/DynamicNavigation";
import ThemeToggle from "@/components/ThemeToggle";

type SectionId = "hero" | "how-it-works" | "jlpt" | "features" | "testimonials";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";

  const sectionLinks = useMemo(
    () =>
      [
        { id: "hero", label: "Home", href: "#hero" },
        { id: "how-it-works", label: "How", href: "#how-it-works" },
        { id: "jlpt", label: "JLPT", href: "#jlpt" },
        { id: "features", label: "Features", href: "#features" },
        { id: "testimonials", label: "Stories", href: "#testimonials" },
      ] as { id: SectionId; label: string; href: string }[],
    []
  );

  // Scroll to section on current page (if home). If not on home, navigate first then scroll.
  const scrollToSection = (id: SectionId) => {
    const doScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    if (!isHome) {
      navigate("/", { replace: false });
      // dùng setTimeout nhỏ để đợi DOM home render xong
      setTimeout(doScroll, 50);
    } else {
      doScroll();
    }
  };

  // IntersectionObserver để highlight mục khi cuộn trên trang home
  useEffect(() => {
    if (!isHome) return;

    const ids: SectionId[] = ["hero", "how-it-works", "jlpt", "features", "testimonials"];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));

        if (visible[0]) {
          const id = visible[0].target.id as SectionId;
          setActiveSection(id);
        }
      },
      {
        rootMargin: "-40% 0px -50% 0px",
        threshold: 0.15,
      }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isHome]);

  return (
    <header
      className="
        fixed top-0 inset-x-0 z-50
        border-b border-white/10
        bg-[radial-gradient(1200px_220px_at_30%_-80px,rgba(56,189,248,.25),rgba(37,99,235,.18)_35%,transparent_70%)]
        bg-slate-950/70
        backdrop-blur-2xl
        supports-[backdrop-filter]:bg-slate-950/60
        shadow-[0_16px_60px_rgba(0,0,0,0.6)]
      "
    >
      <div className="pointer-events-none absolute inset-x-6 -bottom-px h-px bg-gradient-to-r from-cyan-300/70 via-white/80 to-emerald-300/70 blur-[1px]" />

      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 grid place-items-center text-2xl font-bold text-white shadow-[0_10px_30px_rgba(56,189,248,0.7)] ring-1 ring-white/60">
              日
            </div>
            <Sparkles className="absolute -bottom-1 -right-1 h-3.5 w-3.5 text-emerald-300 opacity-95" />
          </div>
          <div className="hidden md:block leading-tight">
            <div className="text-[1.2rem] font-extrabold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,.7)]">
              Yukihon
            </div>
            <div className="text-[0.7rem] text-sky-100/80">
              JLPT N5 → N1 • 15 min / day
            </div>
          </div>
        </Link>

        {/* Center segmented nav (desktop) */}
        <div className="hidden md:flex flex-1 justify-center">
          <div
            className="
              relative rounded-full p-[2px]
              bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,.75),rgba(96,165,250,.9),rgba(52,211,153,.95),rgba(255,255,255,.75))]
              shadow-[0_12px_35px_rgba(56,189,248,.45)]
            "
          >
            <div className="absolute inset-0 -z-10 rounded-full blur-md bg-cyan-300/35" />
            <span className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
              <span className="absolute -left-1/3 top-0 h-full w-1/3 rotate-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent)] animate-navShine" />
            </span>

            <DynamicNavigation
              links={sectionLinks}
              activeLink={activeSection}
              backgroundColor="rgba(15,23,42,0.85)"
              textColor="#e5f0ff"
              highlightColor="rgba(15,23,42,1)"
              glowIntensity={10}
              showLabelsOnMobile={true}
              className="!border-white/15 !shadow-[inset_0_1px_0_rgba(255,255,255,.45),0_18px_40px_rgba(15,23,42,.9)] !px-2"
              onLinkClick={(id) => scrollToSection(id as SectionId)}
            />
          </div>
        </div>

        {/* Right actions (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/courses"
            className="text-xs lg:text-sm font-medium text-sky-100/80 hover:text-white transition-colors"
          >
            Courses
          </Link>
          <Link to="/auth">
            <Button
              size="sm"
              className="
                rounded-full px-4
                bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400
                text-slate-950 font-semibold
                shadow-[0_10px_30px_rgba(56,189,248,.7)]
                hover:brightness-110
              "
            >
              Start free trial
            </Button>
          </Link>
        </div>

        {/* Mobile: compact actions + menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Link to="/auth">
            <Button
              size="sm"
              className="rounded-full px-3 bg-sky-400/90 text-slate-950 font-semibold shadow-md"
            >
              Free trial
            </Button>
          </Link>
          <button
            className="p-2 rounded-full border border-white/30 text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile slide-down nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
            {/* On-page sections (home) */}
            <div className="flex gap-2 pb-3 border-b border-white/10 overflow-x-auto">
              {sectionLinks.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    scrollToSection(l.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium
                    border transition-colors
                    ${
                      activeSection === l.id
                        ? "bg-sky-500 text-slate-950 border-sky-300"
                        : "border-white/25 text-sky-100/85 bg-slate-900/60"
                    }
                  `}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Route links */}
            <Link
              to="/courses"
              className="block py-2 text-sm font-medium text-sky-100/90 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Courses
            </Link>
            <Link
              to="/dictionary"
              className="block py-2 text-sm font-medium text-sky-100/90 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tra cứu
            </Link>
            <Link
              to="/translation"
              className="block py-2 text-sm font-medium text-sky-100/90 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dịch
            </Link>
            <Link
              to="/community"
              className="block py-2 text-sm font-medium text-sky-100/90 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cộng đồng
            </Link>
            <Link
              to="/my-words"
              className="block py-2 text-sm font-medium text-sky-100/90 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Words
            </Link>

            <div className="pt-4 space-y-2">
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-white/40 text-sky-50 hover:bg-white/10"
                >
                  Log in
                </Button>
              </Link>
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 text-slate-950">
                  Start free trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes navShine {
          0% { transform: translateX(-120%) rotate(12deg); opacity: 0; }
          30% { opacity: .55; }
          70% { opacity: .55; }
          100% { transform: translateX(260%) rotate(12deg); opacity: 0; }
        }
        .animate-navShine {
          animation: navShine 3.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-navShine { animation: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navigation;
