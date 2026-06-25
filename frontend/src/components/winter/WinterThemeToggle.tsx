import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WinterThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
}

/** Sun/moon toggle for the winter (light/dark) public theme. */
const WinterThemeToggle = ({ isDark, onToggle, className = "" }: WinterThemeToggleProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${className}`}
      style={{
        color: "hsl(var(--w-ink))",
        background: "hsl(var(--w-card))",
        border: "1px solid hsl(var(--w-glass-border))",
        backdropFilter: "blur(12px)",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ rotate: -40, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 40, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25 }}
          >
            <Moon className="h-[18px] w-[18px]" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate: 40, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -40, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25 }}
          >
            <Sun className="h-[18px] w-[18px]" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

export default WinterThemeToggle;
