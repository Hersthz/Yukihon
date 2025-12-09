import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LessonNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  currentIndex: number;
  totalItems: number;
}

const LessonNavigation = ({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  currentIndex,
  totalItems,
}: LessonNavigationProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="gap-2 flex-1 sm:flex-initial"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      <div className="text-sm text-muted-foreground">
        <kbd className="px-2 py-1 text-xs rounded bg-muted">←</kbd>
        {" "}
        <kbd className="px-2 py-1 text-xs rounded bg-muted">→</kbd>
        {" "}
        to navigate
      </div>

      <Button
        variant="outline"
        onClick={onNext}
        disabled={!canGoNext}
        className="gap-2 flex-1 sm:flex-initial"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default LessonNavigation;
