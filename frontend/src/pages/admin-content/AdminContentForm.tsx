import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JLPT_LEVELS } from "./constants";
import { AdminTab, EditableItem, GrammarItem, Lesson, QuizItem, VocabItem } from "./types";

interface AdminContentFormProps {
  activeTab: AdminTab;
  editItem: EditableItem | null;
  setEditItem: (item: EditableItem) => void;
}

const AdminContentForm = ({ activeTab, editItem, setEditItem }: AdminContentFormProps) => {
  if (!editItem) {
    return null;
  }

  switch (activeTab) {
    case "lessons":
      {
      const item = editItem as Lesson;
      return (
        <>
          <div>
            <Label>Tieu de</Label>
            <Input
              value={item.title}
              onChange={(e) => setEditItem({ ...item, title: e.target.value })}
              className="bg-background/50"
            />
          </div>
          <div>
            <Label>Mo ta</Label>
            <Textarea
              value={item.description}
              onChange={(e) => setEditItem({ ...item, description: e.target.value })}
              className="bg-background/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>JLPT Level</Label>
              <Select value={item.jlptLevel} onValueChange={(v) => setEditItem({ ...item, jlptLevel: v })}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JLPT_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Danh muc</Label>
              <Input
                value={item.category}
                onChange={(e) => setEditItem({ ...item, category: e.target.value })}
                className="bg-background/50"
              />
            </div>
          </div>
          <div>
            <Label>Noi dung</Label>
            <Textarea
              value={item.content}
              onChange={(e) => setEditItem({ ...item, content: e.target.value })}
              className="bg-background/50 min-h-[150px]"
            />
          </div>
          <div>
            <Label>Order Index</Label>
            <Input
              type="number"
              value={item.orderIndex}
              onChange={(e) => setEditItem({ ...item, orderIndex: Number.parseInt(e.target.value, 10) || 0 })}
              className="bg-background/50 w-24"
            />
          </div>
        </>
      );
      }

    case "vocabulary":
      {
      const item = editItem as VocabItem;
      return (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Kanji</Label>
              <Input
                value={item.kanji}
                onChange={(e) => setEditItem({ ...item, kanji: e.target.value })}
                className="bg-background/50 text-xl"
              />
            </div>
            <div>
              <Label>Hiragana</Label>
              <Input
                value={item.hiragana}
                onChange={(e) => setEditItem({ ...item, hiragana: e.target.value })}
                className="bg-background/50"
              />
            </div>
            <div>
              <Label>Romaji</Label>
              <Input
                value={item.romaji}
                onChange={(e) => setEditItem({ ...item, romaji: e.target.value })}
                className="bg-background/50"
              />
            </div>
          </div>
          <div>
            <Label>Nghia</Label>
            <Input
              value={item.meaning}
              onChange={(e) => setEditItem({ ...item, meaning: e.target.value })}
              className="bg-background/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>JLPT Level</Label>
              <Select value={item.jlptLevel} onValueChange={(v) => setEditItem({ ...item, jlptLevel: v })}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JLPT_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Danh muc</Label>
              <Input
                value={item.category}
                onChange={(e) => setEditItem({ ...item, category: e.target.value })}
                className="bg-background/50"
              />
            </div>
          </div>
          <div>
            <Label>Vi du (JP)</Label>
            <Input
              value={item.exampleSentence}
              onChange={(e) => setEditItem({ ...item, exampleSentence: e.target.value })}
              className="bg-background/50"
            />
          </div>
          <div>
            <Label>Vi du (VN)</Label>
            <Input
              value={item.exampleMeaning}
              onChange={(e) => setEditItem({ ...item, exampleMeaning: e.target.value })}
              className="bg-background/50"
            />
          </div>
        </>
      );
      }

    case "grammar":
      {
      const item = editItem as GrammarItem;
      return (
        <>
          <div>
            <Label>Mau cau</Label>
            <Input
              value={item.pattern}
              onChange={(e) => setEditItem({ ...item, pattern: e.target.value })}
              className="bg-background/50 text-lg"
            />
          </div>
          <div>
            <Label>Nghia</Label>
            <Input
              value={item.meaning}
              onChange={(e) => setEditItem({ ...item, meaning: e.target.value })}
              className="bg-background/50"
            />
          </div>
          <div>
            <Label>JLPT Level</Label>
            <Select value={item.jlptLevel} onValueChange={(v) => setEditItem({ ...item, jlptLevel: v })}>
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JLPT_LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Giai thich chi tiet</Label>
            <Textarea
              value={item.explanation}
              onChange={(e) => setEditItem({ ...item, explanation: e.target.value })}
              className="bg-background/50 min-h-[100px]"
            />
          </div>
          <div>
            <Label>Vi du (JP)</Label>
            <Input
              value={item.exampleSentence}
              onChange={(e) => setEditItem({ ...item, exampleSentence: e.target.value })}
              className="bg-background/50"
            />
          </div>
          <div>
            <Label>Vi du (VN)</Label>
            <Input
              value={item.exampleMeaning}
              onChange={(e) => setEditItem({ ...item, exampleMeaning: e.target.value })}
              className="bg-background/50"
            />
          </div>
        </>
      );
      }

    case "quizzes":
      {
      const item = editItem as QuizItem;
      return (
        <>
          <div>
            <Label>Cau hoi</Label>
            <Textarea
              value={item.question}
              onChange={(e) => setEditItem({ ...item, question: e.target.value })}
              className="bg-background/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Option A</Label>
              <Input
                value={item.optionA}
                onChange={(e) => setEditItem({ ...item, optionA: e.target.value })}
                className="bg-background/50"
              />
            </div>
            <div>
              <Label>Option B</Label>
              <Input
                value={item.optionB}
                onChange={(e) => setEditItem({ ...item, optionB: e.target.value })}
                className="bg-background/50"
              />
            </div>
            <div>
              <Label>Option C</Label>
              <Input
                value={item.optionC}
                onChange={(e) => setEditItem({ ...item, optionC: e.target.value })}
                className="bg-background/50"
              />
            </div>
            <div>
              <Label>Option D</Label>
              <Input
                value={item.optionD}
                onChange={(e) => setEditItem({ ...item, optionD: e.target.value })}
                className="bg-background/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Dap an dung</Label>
              <Select value={item.correctAnswer} onValueChange={(v) => setEditItem({ ...item, correctAnswer: v })}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["A", "B", "C", "D"].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>JLPT Level</Label>
              <Select value={item.jlptLevel} onValueChange={(v) => setEditItem({ ...item, jlptLevel: v })}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JLPT_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Danh muc</Label>
              <Input
                value={item.category}
                onChange={(e) => setEditItem({ ...item, category: e.target.value })}
                className="bg-background/50"
              />
            </div>
          </div>
          <div>
            <Label>Giai thich</Label>
            <Textarea
              value={item.explanation}
              onChange={(e) => setEditItem({ ...item, explanation: e.target.value })}
              className="bg-background/50"
            />
          </div>
        </>
      );
      }

    default:
      return null;
  }
};

export default AdminContentForm;
