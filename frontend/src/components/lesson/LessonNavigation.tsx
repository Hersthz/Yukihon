import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}: LessonNavigationProps) => (
  <div className="flex items-center justify-between gap-4">
    <Button
      variant="outline"
      onClick={onPrevious}
      disabled={!canGoPrevious}
      className="flex-1 gap-2 sm:flex-initial"
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="hidden sm:inline">Previous</span>
    </Button>

    <div className="text-sm text-muted-foreground">
      <span className="mr-3">
        {currentIndex + 1} / {totalItems}
      </span>
      <kbd className="rounded bg-muted px-2 py-1 text-xs">Left</kbd>{" "}
      <kbd className="rounded bg-muted px-2 py-1 text-xs">Right</kbd> to navigate
    </div>

    <Button
      variant="outline"
      onClick={onNext}
      disabled={!canGoNext}
      className="flex-1 gap-2 sm:flex-initial"
    >
      <span className="hidden sm:inline">Next</span>
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
);

export default LessonNavigation;
