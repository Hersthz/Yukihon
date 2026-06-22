import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Star } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VocabularyItem {
  id: number;
  kanji: string;
  meaning: string;
}

interface LessonSidebarProps {
  items: VocabularyItem[];
  currentIndex: number;
  completedItems: Set<number>;
  markedDifficult: Set<number>;
  onJumpToItem: (index: number) => void;
}

const LessonSidebar = ({
  items,
  currentIndex,
  completedItems,
  markedDifficult,
  onJumpToItem,
}: LessonSidebarProps) => {
  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Lesson Content</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="space-y-1 p-4 pt-0">
            {items.map((item, index) => {
              const isCompleted = completedItems.has(item.id);
              const isDifficult = markedDifficult.has(item.id);
              const isCurrent = index === currentIndex;

              return (
                <Button
                  key={item.id}
                  variant={isCurrent ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => onJumpToItem(index)}
                >
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium truncate">{item.kanji}</div>
                    <div className="text-xs text-muted-foreground truncate">{item.meaning}</div>
                  </div>
                  {isDifficult && (
                    <Star className="h-3 w-3 fill-current text-primary flex-shrink-0" />
                  )}
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LessonSidebar;
