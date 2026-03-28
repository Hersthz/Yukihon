import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JLPT_LEVELS, WORD_TYPES } from "./constants";
import { VocabItem } from "./types";

interface VocabularyEditorFormProps {
  item: VocabItem;
  onChange: (item: VocabItem) => void;
}

const VocabularyEditorForm = ({ item, onChange }: VocabularyEditorFormProps) => (
  <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-3">
      <div>
        <Label>Kanji</Label>
        <Input value={item.kanji} onChange={(event) => onChange({ ...item, kanji: event.target.value })} className="bg-background/50 text-xl" />
      </div>
      <div>
        <Label>Hiragana</Label>
        <Input value={item.hiragana} onChange={(event) => onChange({ ...item, hiragana: event.target.value })} className="bg-background/50" />
      </div>
      <div>
        <Label>Romaji</Label>
        <Input value={item.romaji} onChange={(event) => onChange({ ...item, romaji: event.target.value })} className="bg-background/50" />
      </div>
    </div>

    <div>
      <Label>Meaning</Label>
      <Textarea value={item.meaning} onChange={(event) => onChange({ ...item, meaning: event.target.value })} className="bg-background/50" />
    </div>

    <div className="grid gap-4 md:grid-cols-2">
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
        <Label>Word Type</Label>
        <Select value={item.wordType} onValueChange={(value) => onChange({ ...item, wordType: value })}>
          <SelectTrigger className="bg-background/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WORD_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div>
      <Label>Example JP</Label>
      <Textarea value={item.exampleSentenceJP} onChange={(event) => onChange({ ...item, exampleSentenceJP: event.target.value })} className="bg-background/50" />
    </div>

    <div>
      <Label>Example EN</Label>
      <Textarea value={item.exampleSentenceEN} onChange={(event) => onChange({ ...item, exampleSentenceEN: event.target.value })} className="bg-background/50" />
    </div>

    <div>
      <Label>Notes</Label>
      <Textarea value={item.additionalNotes} onChange={(event) => onChange({ ...item, additionalNotes: event.target.value })} className="bg-background/50" />
    </div>
  </div>
);

export default VocabularyEditorForm;
