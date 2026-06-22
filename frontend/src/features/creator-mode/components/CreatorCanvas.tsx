import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CREATOR_BLOCK_LABELS,
  CREATOR_BLOCK_TYPES,
  type CreatorBlock,
  type CreatorBlockType,
} from "@/features/creator-mode/types";

interface CreatorCanvasProps {
  blocks: CreatorBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
  onAddBlock: (type: CreatorBlockType) => void;
  onMoveBlock: (fromIndex: number, toIndex: number) => void;
  onDeleteBlock: (blockId: string) => void;
}

const CreatorCanvas = ({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onAddBlock,
  onMoveBlock,
  onDeleteBlock,
}: CreatorCanvasProps) => {
  const handleDrop = (event: React.DragEvent<HTMLButtonElement>, dropIndex: number) => {
    event.preventDefault();
    const fromIndexRaw = event.dataTransfer.getData("text/plain");
    const fromIndex = Number.parseInt(fromIndexRaw, 10);
    if (!Number.isNaN(fromIndex)) {
      onMoveBlock(fromIndex, dropIndex);
    }
  };

  return (
    <Card className="border-border/70 bg-card/70">
      <CardHeader className="space-y-3">
        <CardTitle className="text-base">Builder Canvas</CardTitle>
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-5">
          {CREATOR_BLOCK_TYPES.map((type) => (
            <Button
              key={type}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAddBlock(type)}
              className="justify-start"
            >
              <Plus className="mr-2 h-3.5 w-3.5" />
              {CREATOR_BLOCK_LABELS[type]}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {blocks.map((block, index) => (
          <button
            key={block.id}
            type="button"
            draggable
            onDragStart={(event) => event.dataTransfer.setData("text/plain", String(index))}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, index)}
            onClick={() => onSelectBlock(block.id)}
            className={`flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition ${
              selectedBlockId === block.id
                ? "border-primary bg-primary/10"
                : "border-border bg-background/50 hover:bg-background/70"
            }`}
          >
            <GripVertical className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {block.heading || CREATOR_BLOCK_LABELS[block.type]}
              </p>
              <p className="text-xs text-muted-foreground">
                {CREATOR_BLOCK_LABELS[block.type]} • Block #{index + 1}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={(event) => {
                event.stopPropagation();
                onDeleteBlock(block.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </button>
        ))}
      </CardContent>
    </Card>
  );
};

export default CreatorCanvas;
