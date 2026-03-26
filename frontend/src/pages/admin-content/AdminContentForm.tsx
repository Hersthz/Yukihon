import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JLPT_LEVELS, LESSON_STATUSES, QUIZ_DIFFICULTIES, QUIZ_TYPES, WORD_TYPES } from "./constants";
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
    case "lessons": {
      const item = editItem as Lesson;

      return (
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={item.title} onChange={(e) => setEditItem({ ...item, title: e.target.value })} className="bg-background/50" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={item.description} onChange={(e) => setEditItem({ ...item, description: e.target.value })} className="bg-background/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>JLPT Level</Label>
              <Select value={item.jlptLevel} onValueChange={(value) => setEditItem({ ...item, jlptLevel: value })}>
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
              <Label>Status</Label>
              <Select value={item.status} onValueChange={(value) => setEditItem({ ...item, status: value as Lesson["status"] })}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LESSON_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Input value={item.category} onChange={(e) => setEditItem({ ...item, category: e.target.value })} className="bg-background/50" />
            </div>
            <div>
              <Label>Order</Label>
              <Input
                type="number"
                value={item.orderIndex}
                onChange={(e) => setEditItem({ ...item, orderIndex: Number.parseInt(e.target.value, 10) || 0 })}
                className="bg-background/50"
              />
            </div>
          </div>
          <div>
            <Label>Content</Label>
            <Textarea value={item.content} onChange={(e) => setEditItem({ ...item, content: e.target.value })} className="bg-background/50 min-h-[180px]" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label>Audio URL</Label>
              <Input value={item.audioUrl} onChange={(e) => setEditItem({ ...item, audioUrl: e.target.value })} className="bg-background/50" />
            </div>
            <div>
              <Label>Video URL</Label>
              <Input value={item.videoUrl} onChange={(e) => setEditItem({ ...item, videoUrl: e.target.value })} className="bg-background/50" />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={item.imageUrl} onChange={(e) => setEditItem({ ...item, imageUrl: e.target.value })} className="bg-background/50" />
            </div>
          </div>
        </div>
      );
    }

    case "vocabulary": {
      const item = editItem as VocabItem;

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label>Kanji</Label>
              <Input value={item.kanji} onChange={(e) => setEditItem({ ...item, kanji: e.target.value })} className="bg-background/50 text-xl" />
            </div>
            <div>
              <Label>Hiragana</Label>
              <Input value={item.hiragana} onChange={(e) => setEditItem({ ...item, hiragana: e.target.value })} className="bg-background/50" />
            </div>
            <div>
              <Label>Romaji</Label>
              <Input value={item.romaji} onChange={(e) => setEditItem({ ...item, romaji: e.target.value })} className="bg-background/50" />
            </div>
          </div>
          <div>
            <Label>Meaning</Label>
            <Textarea value={item.meaning} onChange={(e) => setEditItem({ ...item, meaning: e.target.value })} className="bg-background/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>JLPT Level</Label>
              <Select value={item.jlptLevel} onValueChange={(value) => setEditItem({ ...item, jlptLevel: value })}>
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
              <Select value={item.wordType} onValueChange={(value) => setEditItem({ ...item, wordType: value })}>
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
            <Textarea value={item.exampleSentenceJP} onChange={(e) => setEditItem({ ...item, exampleSentenceJP: e.target.value })} className="bg-background/50" />
          </div>
          <div>
            <Label>Example EN</Label>
            <Textarea value={item.exampleSentenceEN} onChange={(e) => setEditItem({ ...item, exampleSentenceEN: e.target.value })} className="bg-background/50" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={item.additionalNotes} onChange={(e) => setEditItem({ ...item, additionalNotes: e.target.value })} className="bg-background/50" />
          </div>
        </div>
      );
    }

    case "grammar": {
      const item = editItem as GrammarItem;

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Title</Label>
              <Input value={item.title} onChange={(e) => setEditItem({ ...item, title: e.target.value })} className="bg-background/50" />
            </div>
            <div>
              <Label>Pattern</Label>
              <Input value={item.pattern} onChange={(e) => setEditItem({ ...item, pattern: e.target.value })} className="bg-background/50 text-lg" />
            </div>
          </div>
          <div>
            <Label>JLPT Level</Label>
            <Select value={item.jlptLevel} onValueChange={(value) => setEditItem({ ...item, jlptLevel: value })}>
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
            <Textarea value={item.explanation} onChange={(e) => setEditItem({ ...item, explanation: e.target.value })} className="bg-background/50 min-h-[120px]" />
          </div>
          <div>
            <Label>Usage</Label>
            <Textarea value={item.usage} onChange={(e) => setEditItem({ ...item, usage: e.target.value })} className="bg-background/50" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Example JP</Label>
              <Textarea value={item.exampleJP} onChange={(e) => setEditItem({ ...item, exampleJP: e.target.value })} className="bg-background/50" />
            </div>
            <div>
              <Label>Example EN</Label>
              <Textarea value={item.exampleEN} onChange={(e) => setEditItem({ ...item, exampleEN: e.target.value })} className="bg-background/50" />
            </div>
          </div>
          <div>
            <Label>Related Patterns</Label>
            <Input value={item.relatedPatterns} onChange={(e) => setEditItem({ ...item, relatedPatterns: e.target.value })} className="bg-background/50" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={item.notes} onChange={(e) => setEditItem({ ...item, notes: e.target.value })} className="bg-background/50" />
          </div>
        </div>
      );
    }

    case "quizzes": {
      const item = editItem as QuizItem;

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Title</Label>
              <Input value={item.title} onChange={(e) => setEditItem({ ...item, title: e.target.value })} className="bg-background/50" />
            </div>
            <div>
              <Label>JLPT Level</Label>
              <Select value={item.jlptLevel} onValueChange={(value) => setEditItem({ ...item, jlptLevel: value })}>
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
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={item.description} onChange={(e) => setEditItem({ ...item, description: e.target.value })} className="bg-background/50" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Quiz Type</Label>
              <Select value={item.quizType} onValueChange={(value) => setEditItem({ ...item, quizType: value })}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUIZ_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={item.difficultyLevel} onValueChange={(value) => setEditItem({ ...item, difficultyLevel: value })}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUIZ_DIFFICULTIES.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Question</Label>
            <Textarea value={item.question} onChange={(e) => setEditItem({ ...item, question: e.target.value })} className="bg-background/50 min-h-[100px]" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Option A</Label>
              <Input value={item.optionA} onChange={(e) => setEditItem({ ...item, optionA: e.target.value })} className="bg-background/50" />
            </div>
            <div>
              <Label>Option B</Label>
              <Input value={item.optionB} onChange={(e) => setEditItem({ ...item, optionB: e.target.value })} className="bg-background/50" />
            </div>
            <div>
              <Label>Option C</Label>
              <Input value={item.optionC} onChange={(e) => setEditItem({ ...item, optionC: e.target.value })} className="bg-background/50" />
            </div>
            <div>
              <Label>Option D</Label>
              <Input value={item.optionD} onChange={(e) => setEditItem({ ...item, optionD: e.target.value })} className="bg-background/50" />
            </div>
          </div>
          <div>
            <Label>Correct Answer</Label>
            <Select value={item.correctAnswer} onValueChange={(value) => setEditItem({ ...item, correctAnswer: value as QuizItem["correctAnswer"] })}>
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["A", "B", "C", "D"] as const).map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Explanation</Label>
            <Textarea value={item.explanation} onChange={(e) => setEditItem({ ...item, explanation: e.target.value })} className="bg-background/50" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label>Audio URL</Label>
              <Input value={item.audioUrl} onChange={(e) => setEditItem({ ...item, audioUrl: e.target.value })} className="bg-background/50" />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={item.imageUrl} onChange={(e) => setEditItem({ ...item, imageUrl: e.target.value })} className="bg-background/50" />
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};

export default AdminContentForm;
