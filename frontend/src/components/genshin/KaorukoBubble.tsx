import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import KaorukoAvatar, { KaorukoMood } from "./KaorukoAvatar";

interface KaorukoBubbleProps {
  mood?: KaorukoMood;
  message: string;
  className?: string;
  avatarPosition?: "left" | "right";
  size?: "sm" | "md" | "lg";
}

const KaorukoBubble = ({
  mood = "gentle",
  message,
  className,
  avatarPosition = "left",
  size = "md",
}: KaorukoBubbleProps) => {
  const avatarSizes = {
    sm: "md" as const,
    md: "lg" as const,
    lg: "xl" as const,
  };

  return (
    <motion.div
      className={cn(
        "flex items-start gap-4",
        avatarPosition === "right" && "flex-row-reverse",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <KaorukoAvatar mood={mood} size={avatarSizes[size]} glow />
      
      <div
        className={cn(
          "glass-card px-5 py-4 max-w-md",
          "relative",
          avatarPosition === "left" ? "rounded-tl-sm" : "rounded-tr-sm"
        )}
      >
        <p className="text-foreground text-sm md:text-base leading-relaxed">
          {message}
        </p>
      </div>
    </motion.div>
  );
};

export default KaorukoBubble;
