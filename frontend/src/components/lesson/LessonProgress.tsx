import { Progress } from "@/components/ui/progress";

interface LessonProgressProps {
  current: number;
  total: number;
  completedItems: number;
}

const LessonProgress = ({ current, total, completedItems }: LessonProgressProps) => {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          Progress: {current} / {total}
        </span>
        <span className="text-muted-foreground">
          {completedItems} completed
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

export default LessonProgress;
