import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "light" | "solid";
  hover?: boolean;
  glow?: "primary" | "warm" | "none";
  children: React.ReactNode;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", hover = false, glow = "none", children, ...props }, ref) => {
    const variants = {
      default: "bg-slate-900/75 backdrop-blur-xl border border-white/20",
      light: "bg-white/10 backdrop-blur-xl border border-white/20",
      solid: "bg-card border border-border",
    };

    const glowStyles = {
      primary: "shadow-[0_0_40px_hsl(195_70%_78%/0.2)]",
      warm: "shadow-[0_0_40px_hsl(25_60%_85%/0.2)]",
      none: "shadow-[0_24px_80px_rgba(15,23,42,0.9)]",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-3xl",
          variants[variant],
          glowStyles[glow],
          hover && "transition-all duration-300 hover:-translate-y-1 hover:border-white/40 hover:shadow-lg",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;
