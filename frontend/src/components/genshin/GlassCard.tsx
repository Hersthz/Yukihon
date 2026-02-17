import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { useTheme } from "@/hooks/use-theme";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "light" | "solid";
  hover?: boolean;
  glow?: "primary" | "warm" | "none";
  children: React.ReactNode;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", hover = false, glow = "none", children, ...props }, ref) => {
    const { theme } = useTheme();

    const variants = {
      default: theme === "dark" 
        ? "bg-slate-900/75 backdrop-blur-xl border border-white/20" 
        : "bg-white/40 backdrop-blur-xl border border-black/10",
      light: theme === "dark"
        ? "bg-white/10 backdrop-blur-xl border border-white/20"
        : "bg-white/50 backdrop-blur-xl border border-black/10",
      solid: "bg-card border border-border",
    };

    const glowStyles = {
      primary: theme === "dark"
        ? "shadow-[0_0_40px_hsl(195_70%_78%/0.2)]"
        : "shadow-[0_0_40px_hsl(195_70%_45%/0.15)]",
      warm: theme === "dark"
        ? "shadow-[0_0_40px_hsl(25_60%_85%/0.2)]"
        : "shadow-[0_0_40px_hsl(25_60%_50%/0.15)]",
      none: theme === "dark"
        ? "shadow-[0_24px_80px_rgba(15,23,42,0.9)]"
        : "shadow-[0_24px_80px_rgba(220,220,220,0.3)]",
    };

    const hoverClass = hover 
      ? "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg active:scale-98 cursor-pointer"
      : "transition-all duration-300 ease-out";

    const borderHoverClass = hover
      ? theme === "dark"
        ? "hover:border-white/40"
        : "hover:border-black/20"
      : "";

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-3xl",
          variants[variant],
          glowStyles[glow],
          hoverClass,
          borderHoverClass,
          className
        )}
        whileHover={hover ? { scale: 1.02 } : {}}
        whileTap={hover ? { scale: 0.98 } : {}}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;
