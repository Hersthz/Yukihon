import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import FloatingKaorukoAssistant from "./FloatingKaorukoAssistant";

interface AppShellProps {
  children: React.ReactNode;
  showNav?: boolean;
  showFloatingAssistant?: boolean;
  className?: string;
  backgroundImage?: string;
  overlayGradient?: string;
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "JLPT Roadmap" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/kanji-library", label: "Library" },
];

const AppShell = ({
  children,
  showNav = true,
  showFloatingAssistant = true,
  className,
  backgroundImage,
  overlayGradient = "from-background via-background/95 to-background",
}: AppShellProps) => {
  const location = useLocation();

  return (
    <div className={cn("min-h-screen bg-background bg-noise relative", className)}>
      {/* Background image with overlay */}
      {backgroundImage && (
        <>
          <div 
            className="fixed inset-0 bg-cover bg-center bg-no-repeat animate-zoom-subtle"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className={cn("fixed inset-0 bg-gradient-to-br", overlayGradient)} />
        </>
      )}

      {/* Navigation */}
      {showNav && (
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-background font-bold text-lg">
                日
              </div>
              <span className="font-semibold text-foreground hidden sm:block">Kaoruko Lab</span>
            </Link>

            {/* Center links */}
            <div className="hidden md:flex items-center gap-1 glass-card px-2 py-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    location.pathname === link.href
                      ? "bg-white/15 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <Link to="/login">
                <button className="gradient-btn-outline text-sm">
                  Sign in
                </button>
              </Link>
              <Link to="/signup">
                <button className="gradient-btn text-sm py-2">
                  Get started
                </button>
              </Link>
            </div>
          </div>
        </motion.nav>
      )}

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Floating assistant */}
      {showFloatingAssistant && <FloatingKaorukoAssistant />}

      {/* Footer */}
      <footer className="relative z-10 py-12 mt-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-background font-bold text-sm">
                日
              </div>
              <span className="font-medium text-foreground">Kaoruko Japanese Lab</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2024 Kaoruko Japanese Lab
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
