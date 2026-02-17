// src/components/learning/LessonCard2.tsx

import { motion } from "framer-motion";
import { Lock, PlayCircle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/genshin/GlassCard";

interface LessonItem {
  id: number;
  title: string;
  description?: string;
  category?: string;
  jlptLevel?: string;
  imageUrl?: string;
}

interface LessonCard2Props {
  lesson: LessonItem;
  isCompleted?: boolean;
  onStart?: (id: number) => void;
  isLocked?: boolean;
  estimatedTime?: number;
}

const LessonCard2 = ({
  lesson,
  isCompleted = false,
  onStart,
  isLocked = false,
  estimatedTime = 15,
}: LessonCard2Props) => {
  return (
    <motion.div
      whileHover={!isLocked ? { scale: 1.05 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
    >
      <GlassCard className="h-full relative overflow-hidden group">
        <div className="relative z-10 p-6 h-full flex flex-col justify-between">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold">
                {lesson.jlptLevel || "N4"}
              </span>
              {isCompleted && (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
              {isLocked && <Lock className="w-5 h-5 text-gray-400" />}
            </div>

            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
              {lesson.title}
            </h3>

            {lesson.description && (
              <p className="text-sm text-gray-400 line-clamp-2">
                {lesson.description}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>{estimatedTime} min</span>
            </div>

            {!isLocked && onStart && (
              <Button
                size="sm"
                onClick={() => onStart(lesson.id)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                {isCompleted ? "Review" : "Start"}
              </Button>
            )}
          </div>
        </div>

        {/* Background image overlay */}
        {lesson.imageUrl && (
          <div
            className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
            style={{
              backgroundImage: `url(${lesson.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
      </GlassCard>
    </motion.div>
  );
};

export default LessonCard2;
