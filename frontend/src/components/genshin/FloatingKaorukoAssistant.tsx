import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import KaorukoAvatar from "./KaorukoAvatar";
import KaorukoBubble from "./KaorukoBubble";
import { cn } from "@/lib/utils";

interface FloatingKaorukoAssistantProps {
  className?: string;
}

const FloatingKaorukoAssistant = ({ className }: FloatingKaorukoAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const tips = [
    "You haven't practiced listening for 3 days. How about trying a listening module today?",
    "Great job on your streak! Keep up the momentum with some kanji practice.",
    "Ready for your daily review? I've prepared 25 flashcards for you!",
    "Tip: Spaced repetition is the key to long-term memory. Don't skip your reviews!",
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-20 right-0 w-[360px]"
          >
            <div className="glass-card p-6 relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
              
              <div className="mb-4">
                <p className="label-caps mb-1">Kaoruko's Tip</p>
                <h4 className="text-lg font-semibold">Need some guidance?</h4>
              </div>
              
              <KaorukoBubble
                mood="gentle"
                message={randomTip}
                size="sm"
              />
              
              <div className="mt-4 flex gap-2">
                <button className="gradient-btn text-sm py-2 px-4 flex-1">
                  Start Learning
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="gradient-btn-outline text-sm py-2 px-4"
                >
                  Later
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex items-center gap-3 p-2 pr-4 rounded-full",
          "bg-slate-900/80 backdrop-blur-xl border border-white/20",
          "hover:border-primary/50 transition-all duration-300",
          "shadow-lg hover:shadow-[0_0_30px_hsl(195_70%_78%/0.3)]"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <KaorukoAvatar mood={isOpen ? "bigSmile" : "gentle"} size="sm" animate={false} />
        <span className="text-sm font-medium text-foreground">Ask Kaoruko</span>
        
        {/* Notification dot */}
        <span className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full animate-pulse" />
      </motion.button>
    </div>
  );
};

export default FloatingKaorukoAssistant;
