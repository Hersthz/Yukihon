import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CREATOR_BLOCK_LABELS, type CreatorBlock } from "@/features/creator-mode/types";

interface CreatorBlockEditorProps {
  block: CreatorBlock | null;
  onUpdate: (blockId: string, updates: Partial<CreatorBlock>) => void;
}

const CreatorBlockEditor = ({ block, onUpdate }: CreatorBlockEditorProps) => {
  if (!block) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background/40 p-4 text-sm text-muted-foreground">
        Chon mot block trong canvas de chinh noi dung.
      </div>
    );
  }

  const hasOptions = block.type === "QUIZ_CHECKPOINT" || block.type === "BRANCH";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{CREATOR_BLOCK_LABELS[block.type]}</p>
        <p className="text-xs text-muted-foreground">Tu block nay, ban co the tao nhanh mini-lesson, quiz checkpoint hoac story branch.</p>
      </div>

      <div>
        <Label>Heading</Label>
        <Input
          value={block.heading}
          onChange={(event) => onUpdate(block.id, { heading: event.target.value })}
          className="bg-background/50"
          placeholder="Dat tieu de ngan cho block"
        />
      </div>

      <div>
        <Label>Body</Label>
        <Textarea
          value={block.body}
          onChange={(event) => onUpdate(block.id, { body: event.target.value })}
          className="min-h-[140px] bg-background/50"
          placeholder="Noi dung giang day, mau hoi thoai, goi y, hoac logic branch"
        />
      </div>

      {hasOptions && (
        <div className="space-y-2">
          <Label>Options</Label>
          {block.options.map((option, index) => (
            <Input
              key={`${block.id}-option-${index}`}
              value={option}
              onChange={(event) => {
                const nextOptions = [...block.options];
                nextOptions[index] = event.target.value;
                onUpdate(block.id, { options: nextOptions });
              }}
              className="bg-background/50"
              placeholder={`Lua chon ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatorBlockEditor;
