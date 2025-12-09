import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import kaorukoWelcome from "@/assets/kaoruko-welcome.png";
import kaorukoHappy from "@/assets/kaoruko-happy.png";
import kaorukoGuide from "@/assets/kaoruko-guide.png";
import kaorukoExcited from "@/assets/kaoruko-excited.png";

export type KaorukoMood = 
  | "gentle" 
  | "bigSmile" 
  | "shy" 
  | "puffed" 
  | "calm" 
  | "phonePeek"
  | "welcome"
  | "happy"
  | "guide"
  | "excited";

interface KaorukoAvatarProps {
  mood?: KaorukoMood;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  animate?: boolean;
  glow?: boolean;
}

const moodImages: Record<KaorukoMood, string> = {
  gentle: kaorukoGuide,
  bigSmile: kaorukoHappy,
  shy: kaorukoWelcome,
  puffed: kaorukoExcited,
  calm: kaorukoGuide,
  phonePeek: kaorukoWelcome,
  welcome: kaorukoWelcome,
  happy: kaorukoHappy,
  guide: kaorukoGuide,
  excited: kaorukoExcited,
};

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-24 h-24",
  xl: "w-32 h-32",
  "2xl": "w-48 h-48",
};

const KaorukoAvatar = ({
  mood = "gentle",
  size = "md",
  className,
  animate = true,
  glow = false,
}: KaorukoAvatarProps) => {
  return (
    <motion.div
      className={cn("relative inline-block", className)}
      animate={animate ? {
        y: [0, -3, 0],
        scale: [1, 1.02, 1],
      } : undefined}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Background glow */}
      {glow && (
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-primary/30 via-primary/10 to-transparent blur-xl scale-150" />
      )}
      
      {/* Avatar container */}
      <div
        className={cn(
          "relative rounded-full overflow-hidden",
          "bg-gradient-to-br from-primary/20 via-transparent to-accent-warm/20",
          "border-2 border-white/30",
          sizeClasses[size],
          glow && "shadow-[0_0_30px_hsl(195_70%_78%/0.3)]"
        )}
      >
        <img
          src={moodImages[mood]}
          alt="Kaoruko"
          className="w-full h-full object-cover"
        />
      </div>
    </motion.div>
  );
};

export default KaorukoAvatar;
