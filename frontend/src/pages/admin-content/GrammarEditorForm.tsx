import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JLPT_LEVELS } from "./constants";
import { GrammarItem } from "./types";

interface GrammarEditorFormProps {
  item: GrammarItem;
  onChange: (item: GrammarItem) => void;
}

const GrammarEditorForm = ({ item, onChange }: GrammarEditorFormProps) => (
  <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Label>Title</Label>
        <Input value={item.title} onChange={(event) => onChange({ ...item, title: event.target.value })} className="bg-background/50" />
      </div>
      <div>
        <Label>Pattern</Label>
        <Input value={item.pattern} onChange={(event) => onChange({ ...item, pattern: event.target.value })} className="bg-background/50 text-lg" />
      </div>
    </div>

    <div>
      <Label>JLPT Level</Label>
      <Select value={item.jlptLevel} onValueChange={(value) => onChange({ ...item, jlptLevel: value })}>
        <SelectTrigger className="bg-background/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {JLPT_LEVELS.map((level) => (
            <SelectItem key={level} value={level}>
              {level}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div>
      <Label>Explanation</Label>
      <Textarea value={item.explanation} onChange={(event) => onChange({ ...item, explanation: event.target.value })} className="min-h-[120px] bg-background/50" />
    </div>

    <div>
      <Label>Usage</Label>
      <Textarea value={item.usage} onChange={(event) => onChange({ ...item, usage: event.target.value })} className="bg-background/50" />
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Label>Example JP</Label>
        <Textarea value={item.exampleJP} onChange={(event) => onChange({ ...item, exampleJP: event.target.value })} className="bg-background/50" />
      </div>
      <div>
        <Label>Example EN</Label>
        <Textarea value={item.exampleEN} onChange={(event) => onChange({ ...item, exampleEN: event.target.value })} className="bg-background/50" />
      </div>
    </div>

    <div>
      <Label>Related Patterns</Label>
      <Input value={item.relatedPatterns} onChange={(event) => onChange({ ...item, relatedPatterns: event.target.value })} className="bg-background/50" />
    </div>

    <div>
      <Label>Notes</Label>
      <Textarea value={item.notes} onChange={(event) => onChange({ ...item, notes: event.target.value })} className="bg-background/50" />
    </div>
  </div>
);

export default GrammarEditorForm;
