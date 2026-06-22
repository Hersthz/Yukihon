import { motion } from "framer-motion";
import { CheckCircle, Clock, Lock, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <motion.div whileHover={!isLocked ? { y: -4 } : {}} whileTap={!isLocked ? { scale: 0.99 } : {}}>
      <div className="relative h-full overflow-hidden rounded-[22px] border border-white/70 bg-white/[0.84] shadow-[0_12px_30px_rgba(148,163,184,0.12)] backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#7dd3fc,#c4b5fd,#86efac)] opacity-75" />
        <div className="relative flex h-full flex-col justify-between p-5">
          <div>
            <div className="mb-3 flex items-start justify-between">
              <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                {lesson.jlptLevel || "N4"}
              </span>
              {isCompleted && <CheckCircle className="h-5 w-5 text-emerald-500" />}
              {isLocked && <Lock className="h-5 w-5 text-slate-400" />}
            </div>

            <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-slate-900">
              {lesson.title}
            </h3>

            {lesson.description && (
              <p className="line-clamp-2 text-sm text-slate-600">{lesson.description}</p>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-200/80 pt-4">
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Clock className="h-4 w-4" />
              <span>{estimatedTime} min</span>
            </div>

            {!isLocked && onStart && (
              <Button
                size="sm"
                onClick={() => onStart(lesson.id)}
                className={cn(
                  "rounded-xl text-white shadow-[0_10px_20px_rgba(14,165,233,0.20)]",
                  isCompleted
                    ? "bg-emerald-500 hover:bg-emerald-400"
                    : "bg-sky-500 hover:bg-sky-400"
                )}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                {isCompleted ? "Review" : "Start"}
              </Button>
            )}
          </div>
        </div>

        {lesson.imageUrl && (
          <div
            className="absolute inset-0 opacity-10 transition-opacity hover:opacity-20"
            style={{
              backgroundImage: `url(${lesson.imageUrl})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          />
        )}
      </div>
    </motion.div>
  );
};

export default LessonCard2;
