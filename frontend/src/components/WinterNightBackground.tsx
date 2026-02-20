import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
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
  snowCount = 60,
  sparkleCount = 25,
  showAurora = true,
  intensity = "normal",
  className = "",
}: WinterNightBackgroundProps) => {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === "light";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate snowflakes with varied properties
  const snowflakes = useMemo<Snowflake[]>(() => {
    const count = intensity === "light" ? snowCount * 0.6 : intensity === "intense" ? snowCount * 1.5 : snowCount;
    return Array.from({ length: Math.floor(count) }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 10 + Math.random() * 20, // 10-30s for varied speeds
      size: 2 + Math.random() * 8, // 2-10px for varied sizes
      opacity: 0.2 + Math.random() * 0.6,
      sway: 20 + Math.random() * 60, // horizontal movement range
      blur: Math.random() > 0.7 ? 1 : 0, // some blurred for depth
    }));
  }, [snowCount, intensity]);

  // Generate sparkles
  const sparkles = useMemo<Sparkle[]>(() => {
    const count = intensity === "light" ? sparkleCount * 0.5 : intensity === "intense" ? sparkleCount * 1.5 : sparkleCount;
    return Array.from({ length: Math.floor(count) }, (_, i) => ({
      id: i,
      left: 5 + Math.random() * 90,
      top: 5 + Math.random() * 90,
      delay: Math.random() * 8,
      duration: 2 + Math.random() * 4,
      size: 2 + Math.random() * 4,
    }));
  }, [sparkleCount, intensity]);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== "undefined" 
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches 
    : false;

  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`} style={{ zIndex: 0 }}>
      {/* Background gradient — adapts to theme */}
      <div className={`absolute inset-0 transition-colors duration-500 ${
        isLight
          ? "bg-gradient-to-b from-sky-50/80 via-slate-100/40 to-background"
          : "bg-gradient-to-b from-slate-950 via-slate-900 to-background"
      }`} />

      {/* Aurora Borealis Effect */}
      {showAurora && !prefersReducedMotion && (
        <div className={`absolute inset-0 transition-opacity duration-500 ${isLight ? "opacity-20" : "opacity-100"}`}>
          {/* Primary aurora wave */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(ellipse 150% 80% at 20% 10%, rgba(56, 189, 248, 0.15) 0%, transparent 50%)",
                "radial-gradient(ellipse 180% 90% at 60% 5%, rgba(34, 211, 238, 0.12) 0%, transparent 55%)",
                "radial-gradient(ellipse 150% 80% at 80% 15%, rgba(56, 189, 248, 0.15) 0%, transparent 50%)",
                "radial-gradient(ellipse 160% 85% at 40% 8%, rgba(34, 211, 238, 0.13) 0%, transparent 52%)",
                "radial-gradient(ellipse 150% 80% at 20% 10%, rgba(56, 189, 248, 0.15) 0%, transparent 50%)",
              ],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Secondary aurora wave - green tint */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(ellipse 120% 60% at 70% 5%, rgba(74, 222, 128, 0.1) 0%, transparent 45%)",
                "radial-gradient(ellipse 140% 70% at 30% 10%, rgba(52, 211, 153, 0.08) 0%, transparent 50%)",
                "radial-gradient(ellipse 120% 60% at 50% 8%, rgba(74, 222, 128, 0.1) 0%, transparent 45%)",
                "radial-gradient(ellipse 130% 65% at 80% 5%, rgba(52, 211, 153, 0.09) 0%, transparent 48%)",
                "radial-gradient(ellipse 120% 60% at 70% 5%, rgba(74, 222, 128, 0.1) 0%, transparent 45%)",
              ],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5,
            }}
          />

          {/* Tertiary aurora wave - pink/purple hint */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(ellipse 100% 50% at 50% 0%, rgba(192, 132, 252, 0.08) 0%, transparent 40%)",
                "radial-gradient(ellipse 130% 60% at 25% 5%, rgba(168, 85, 247, 0.06) 0%, transparent 45%)",
                "radial-gradient(ellipse 110% 55% at 75% 3%, rgba(192, 132, 252, 0.07) 0%, transparent 42%)",
                "radial-gradient(ellipse 120% 58% at 40% 8%, rgba(168, 85, 247, 0.07) 0%, transparent 43%)",
                "radial-gradient(ellipse 100% 50% at 50% 0%, rgba(192, 132, 252, 0.08) 0%, transparent 40%)",
              ],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 10,
            }}
          />

          {/* Aurora shimmer overlay */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/3"
            style={{
              background: "linear-gradient(180deg, rgba(56, 189, 248, 0.03) 0%, transparent 100%)",
            }}
            animate={{
              opacity: [0.5, 1, 0.7, 1, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      )}

      {/* Sparkle / Star field */}
      {sparkles.map((sparkle) => (
        /* Sparkle opacity reduced in light mode */
        <motion.div
          key={`sparkle-${sparkle.id}`}
          className="absolute rounded-full"
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
              : `0 0 ${sparkle.size * 2}px rgba(255,255,255,0.5), 0 0 ${sparkle.size * 4}px rgba(186, 230, 253, 0.3)`,
          }}
          animate={
            prefersReducedMotion
              ? {}
              : {
                  opacity: [0, 1, 0.3, 1, 0],
                  scale: [0.5, 1.2, 0.8, 1.2, 0.5],
                }
          }
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Enhanced snowflakes */}
      {snowflakes.map((flake) => (
        <motion.div
          key={`snow-${flake.id}`}
          className="absolute"
          style={{
            left: `${flake.left}%`,
            top: "-20px",
            width: flake.size,
            height: flake.size,
            filter: flake.blur > 0 ? `blur(${flake.blur}px)` : "none",
          }}
          animate={
            prefersReducedMotion
              ? { y: "110vh" }
              : {
                  y: ["0vh", "110vh"],
                  x: [0, flake.sway * (Math.random() > 0.5 ? 1 : -1), 0, flake.sway * 0.5 * (Math.random() > 0.5 ? 1 : -1), 0],
                  rotate: [0, 360],
                }
          }
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Infinity,
            ease: "linear",
            times: prefersReducedMotion ? undefined : [0, 0.25, 0.5, 0.75, 1],
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: isLight
                ? `radial-gradient(circle, rgba(120,170,220,${flake.opacity * 0.5}) 0%, rgba(120,170,220,${flake.opacity * 0.15}) 50%, transparent 70%)`
                : `radial-gradient(circle, rgba(255,255,255,${flake.opacity}) 0%, rgba(255,255,255,${flake.opacity * 0.3}) 50%, transparent 70%)`,
              boxShadow: isLight
                ? `0 0 ${flake.size}px rgba(120,170,220,${flake.opacity * 0.25})`
                : `0 0 ${flake.size}px rgba(255,255,255,${flake.opacity * 0.5})`,
            }}
          />
        </motion.div>
      ))}

      {/* Distant stars (static, small) — hidden in light mode */}
      {!isLight && Array.from({ length: 50 }).map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-px h-px bg-white/40 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
          }}
        />
      ))}

      {/* Subtle gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />

      {/* Vignette effect — adapts to theme */}
      <div 
        className="absolute inset-0"
        style={{
          background: isLight
            ? "radial-gradient(ellipse at center, transparent 50%, rgba(200, 210, 230, 0.25) 100%)"
            : "radial-gradient(ellipse at center, transparent 40%, rgba(2, 6, 23, 0.4) 100%)",
        }}
      />
    </div>
  );
};

export default WinterNightBackground;
