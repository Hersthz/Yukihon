import { cn } from "@/lib/utils";
import kaorukoWelcome from "@/assets/kaoruko-welcome.png";
import kaorukoHappy from "@/assets/kaoruko-happy.png";
import kaorukoGuide from "@/assets/kaoruko-guide.png";
import kaorukoExcited from "@/assets/kaoruko-excited.png";

export type KaorukoMood = "welcome" | "happy" | "guide" | "excited" | "correct" | "incorrect" | "thinking";

interface KaorukoMascotProps {
  mood?: KaorukoMood;
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showBubble?: boolean;
  className?: string;
  bubblePosition?: "top" | "bottom" | "left" | "right";
}

const moodImages: Record<KaorukoMood, string> = {
  welcome: kaorukoWelcome,
  happy: kaorukoHappy,
  guide: kaorukoGuide,
  excited: kaorukoExcited,
  correct: kaorukoHappy,
  incorrect: kaorukoGuide,
  thinking: kaorukoWelcome,
};

const moodMessages: Record<KaorukoMood, string> = {
  welcome: "Chào bạn! Cùng học tiếng Nhật nào! 👋",
  happy: "Tuyệt vời! Bạn làm tốt lắm! 🎉",
  guide: "Mình sẽ hướng dẫn bạn nhé! 📚",
  excited: "Wow! Thật tuyệt vời! ✨",
  correct: "Chính xác! すごい！ 🌟",
  incorrect: "Cố gắng lên! 頑張って！💪",
  thinking: "Hmm... hãy suy nghĩ kỹ nhé! 🤔",
};

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
};

const bubblePositionClasses = {
  top: "-top-2 left-1/2 -translate-x-1/2 -translate-y-full",
  bottom: "-bottom-2 left-1/2 -translate-x-1/2 translate-y-full",
  left: "top-1/2 -left-2 -translate-x-full -translate-y-1/2",
  right: "top-1/2 -right-2 translate-x-full -translate-y-1/2",
};

const KaorukoMascot = ({
  mood = "guide",
  message,
  size = "md",
  showBubble = false,
  className,
  bubblePosition = "top",
}: KaorukoMascotProps) => {
  const displayMessage = message || moodMessages[mood];

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Speech Bubble */}
      {showBubble && (
        <div
          className={cn(
            "absolute z-10 bg-card/95 backdrop-blur-sm border border-border rounded-2xl px-4 py-2 shadow-lg animate-fade-in whitespace-nowrap",
            bubblePositionClasses[bubblePosition],
            bubblePosition === "top" && "rounded-bl-sm",
            bubblePosition === "bottom" && "rounded-tl-sm",
            bubblePosition === "left" && "rounded-br-sm",
            bubblePosition === "right" && "rounded-bl-sm"
          )}
        >
          <p className="text-sm font-medium">{displayMessage}</p>
        </div>
      )}

      {/* Kaoruko Image */}
      <div
        className={cn(
          "rounded-full overflow-hidden border-2 border-primary/20 shadow-lg",
          sizeClasses[size],
          mood === "correct" && "border-green-500/50 animate-pulse",
          mood === "incorrect" && "border-orange-500/50",
          mood === "excited" && "animate-bounce-slow"
        )}
      >
        <img
          src={moodImages[mood]}
          alt="Kaoruko"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Status indicator */}
      {mood === "correct" && (
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-background">
          ✓
        </div>
      )}
      {mood === "incorrect" && (
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-background">
          !
        </div>
      )}
    </div>
  );
};

export default KaorukoMascot;
