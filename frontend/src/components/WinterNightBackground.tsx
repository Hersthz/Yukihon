import { useEffect, useState, useMemo } from "react";
import { useTheme } from "@/hooks/use-theme";

interface Snowflake {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  sway: number;
  blur: number;
}

interface Sparkle {
  id: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
  size: number;
}

interface WinterNightBackgroundProps {
  snowCount?: number;
  sparkleCount?: number;
  showAurora?: boolean;
  intensity?: "light" | "normal" | "intense";
  className?: string;
}

const WinterNightBackground = ({
  snowCount = 35,
  sparkleCount = 15,
  showAurora = true,
  intensity = "normal",
  className = "",
}: WinterNightBackgroundProps) => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cap snowflake count for performance
  const snowflakes = useMemo<Snowflake[]>(() => {
    const multiplier = intensity === "light" ? 0.6 : intensity === "intense" ? 1.2 : 1;
    const count = Math.min(Math.floor(snowCount * multiplier), 50); // hard cap at 50
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 10 + Math.random() * 20,
      size: 2 + Math.random() * 6,
      opacity: 0.2 + Math.random() * 0.5,
      sway: 20 + Math.random() * 40,
      blur: Math.random() > 0.7 ? 1 : 0,
    }));
  }, [snowCount, intensity]);

  // Cap sparkle count
  const sparkles = useMemo<Sparkle[]>(() => {
    const multiplier = intensity === "light" ? 0.5 : intensity === "intense" ? 1.2 : 1;
    const count = Math.min(Math.floor(sparkleCount * multiplier), 20); // hard cap at 20
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: 5 + Math.random() * 90,
      top: 5 + Math.random() * 90,
      delay: Math.random() * 8,
      duration: 2 + Math.random() * 4,
      size: 2 + Math.random() * 4,
    }));
  }, [sparkleCount, intensity]);

  const prefersReducedMotion = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`} style={{ zIndex: 0 }}>
      {/* Background gradient */}
      <div className={`absolute inset-0 transition-colors duration-500 ${isLight
        ? "bg-gradient-to-b from-sky-50/80 via-slate-100/40 to-background"
        : "bg-gradient-to-b from-slate-950 via-slate-900 to-background"
        }`} />

      {/* Aurora — pure CSS animation, no framer-motion */}
      {showAurora && !prefersReducedMotion && (
        <div className={`absolute inset-0 transition-opacity duration-500 ${isLight ? "opacity-20" : "opacity-100"}`}>
          <div
            className="absolute inset-0 animate-aurora-1"
            style={{
              background: "radial-gradient(ellipse 150% 80% at 20% 10%, rgba(56, 189, 248, 0.15) 0%, transparent 50%)",
            }}
          />
          <div
            className="absolute inset-0 animate-aurora-2"
            style={{
              background: "radial-gradient(ellipse 120% 60% at 70% 5%, rgba(74, 222, 128, 0.1) 0%, transparent 45%)",
            }}
          />
        </div>
      )}

      {/* Sparkles — CSS animation */}
      {sparkles.map((sparkle) => (
        <div
          key={`sparkle-${sparkle.id}`}
          className="absolute rounded-full animate-sparkle-pulse"
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            width: sparkle.size,
            height: sparkle.size,
            opacity: isLight ? 0.15 : 1,
            background: isLight
              ? "radial-gradient(circle, rgba(100,160,220,0.7) 0%, rgba(100,160,220,0) 70%)"
              : "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)",
            boxShadow: isLight
              ? `0 0 ${sparkle.size * 2}px rgba(100,160,220,0.3)`
              : `0 0 ${sparkle.size * 2}px rgba(255,255,255,0.5)`,
            animationDuration: `${sparkle.duration}s`,
            animationDelay: `${sparkle.delay}s`,
            willChange: "opacity, transform",
          }}
        />
      ))}

      {/* Snowflakes — pure CSS animation (GPU-composited) */}
      {snowflakes.map((flake) => (
        <div
          key={`snow-${flake.id}`}
          className="absolute animate-snow-fall"
          style={{
            left: `${flake.left}%`,
            top: "-20px",
            width: flake.size,
            height: flake.size,
            filter: flake.blur > 0 ? `blur(${flake.blur}px)` : "none",
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            ['--snow-sway' as string]: `${flake.sway}px`,
            willChange: "transform",
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: isLight
                ? `radial-gradient(circle, rgba(120,170,220,${flake.opacity * 0.5}) 0%, rgba(120,170,220,${flake.opacity * 0.15}) 50%, transparent 70%)`
                : `radial-gradient(circle, rgba(255,255,255,${flake.opacity}) 0%, rgba(255,255,255,${flake.opacity * 0.3}) 50%, transparent 70%)`,
            }}
          />
        </div>
      ))}

      {/* Static stars — only in dark mode */}
      {!isLight && Array.from({ length: 30 }).map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-px h-px bg-white/40 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
          }}
        />
      ))}

      {/* Depth overlays — Simplified for Senior Seamlessness */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />

      {/* Vignette — Softened for a true Zen feel */}
      <div
        className="absolute inset-0"
        style={{
          background: isLight
            ? "radial-gradient(circle at 50% 50%, transparent 60%, rgba(200, 215, 235, 0.4) 100%)"
            : "radial-gradient(circle at 50% 50%, transparent 60%, rgba(2, 6, 23, 0.6) 100%)",
        }}
      />

      {/* CSS keyframes injected once */}
      <style>{`
        @keyframes snow-fall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); }
          25% { transform: translateY(27.5vh) translateX(var(--snow-sway, 30px)) rotate(90deg); }
          50% { transform: translateY(55vh) translateX(0) rotate(180deg); }
          75% { transform: translateY(82.5vh) translateX(calc(var(--snow-sway, 30px) * -0.5)) rotate(270deg); }
          100% { transform: translateY(110vh) translateX(0) rotate(360deg); }
        }
        .animate-snow-fall {
          animation: snow-fall linear infinite;
        }
        @keyframes sparkle-pulse {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          25% { opacity: 1; transform: scale(1.2); }
          50% { opacity: 0.3; transform: scale(0.8); }
          75% { opacity: 1; transform: scale(1.2); }
        }
        .animate-sparkle-pulse {
          animation: sparkle-pulse ease-in-out infinite;
        }
        @keyframes aurora-drift-1 {
          0%, 100% { transform: translateX(0); opacity: 0.8; }
          50% { transform: translateX(30%); opacity: 1; }
        }
        @keyframes aurora-drift-2 {
          0%, 100% { transform: translateX(0); opacity: 0.7; }
          50% { transform: translateX(-25%); opacity: 1; }
        }
        .animate-aurora-1 { animation: aurora-drift-1 20s ease-in-out infinite; }
        .animate-aurora-2 { animation: aurora-drift-2 25s ease-in-out infinite 5s; }
      `}</style>
    </div>
  );
};

export default WinterNightBackground;
