import { Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JLPT_LEVELS, QUIZ_DIFFICULTIES, QUIZ_TYPES } from "./constants";
import { MediaField } from "./form-shared";
import { Lesson, QuizItem } from "./types";

interface QuizEditorFormProps {
  item: QuizItem;
  lessons: Lesson[];
  uploadingField: string | null;
  onChange: (item: QuizItem) => void;
  onUploadMedia: (field: string, file: File) => Promise<void>;
}

const QuizEditorForm = ({ item, lessons, uploadingField, onChange, onUploadMedia }: QuizEditorFormProps) => (
  <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Label>Title</Label>
        <Input value={item.title} onChange={(event) => onChange({ ...item, title: event.target.value })} className="bg-background/50" />
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
    </div>

    <div>
      <Label>Description</Label>
      <Textarea value={item.description} onChange={(event) => onChange({ ...item, description: event.target.value })} className="bg-background/50" />
    </div>

    <div className="rounded-[22px] border border-border bg-card/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Link2 className="h-4 w-4 text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground">Linked lesson</p>
          <p className="text-sm text-muted-foreground">Attach the quiz to a lesson checkpoint or leave it as a general quiz bank item.</p>
        </div>
      </div>

      <Select
        value={item.lessonId != null ? String(item.lessonId) : "GENERAL"}
        onValueChange={(value) => onChange({ ...item, lessonId: value === "GENERAL" ? undefined : Number(value) })}
      >
        <SelectTrigger className="bg-background/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="GENERAL">General quiz bank</SelectItem>
          {lessons
            .filter((lesson) => lesson.id != null)
            .map((lesson) => (
              <SelectItem key={lesson.id} value={String(lesson.id)}>
                {lesson.title} · {lesson.jlptLevel}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <p className="mt-3 text-xs text-muted-foreground">
        {item.lessonId != null
          ? `Currently linked to ${lessons.find((lesson) => lesson.id === item.lessonId)?.title ?? `lesson #${item.lessonId}`}.`
          : "This quiz stays available as a standalone assessment."}
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Label>Quiz Type</Label>
        <Select value={item.quizType} onValueChange={(value) => onChange({ ...item, quizType: value })}>
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
        <Select value={item.difficultyLevel} onValueChange={(value) => onChange({ ...item, difficultyLevel: value })}>
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
      <Textarea value={item.question} onChange={(event) => onChange({ ...item, question: event.target.value })} className="min-h-[100px] bg-background/50" />
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Label>Option A</Label>
        <Input value={item.optionA} onChange={(event) => onChange({ ...item, optionA: event.target.value })} className="bg-background/50" />
      </div>
      <div>
        <Label>Option B</Label>
        <Input value={item.optionB} onChange={(event) => onChange({ ...item, optionB: event.target.value })} className="bg-background/50" />
      </div>
      <div>
        <Label>Option C</Label>
        <Input value={item.optionC} onChange={(event) => onChange({ ...item, optionC: event.target.value })} className="bg-background/50" />
      </div>
      <div>
        <Label>Option D</Label>
        <Input value={item.optionD} onChange={(event) => onChange({ ...item, optionD: event.target.value })} className="bg-background/50" />
      </div>
    </div>

    <div>
      <Label>Correct Answer</Label>
      <Select value={item.correctAnswer} onValueChange={(value) => onChange({ ...item, correctAnswer: value as QuizItem["correctAnswer"] })}>
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
      <Textarea value={item.explanation} onChange={(event) => onChange({ ...item, explanation: event.target.value })} className="bg-background/50" />
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <MediaField
        label="Audio URL"
        value={item.audioUrl}
        accept="audio/*"
        previewType="audio"
        uploading={uploadingField === "audioUrl"}
        onChange={(value) => onChange({ ...item, audioUrl: value })}
        onUpload={(file) => onUploadMedia("audioUrl", file)}
      />
      <MediaField
        label="Image URL"
        value={item.imageUrl}
        accept="image/*"
        previewType="image"
        uploading={uploadingField === "imageUrl"}
        onChange={(value) => onChange({ ...item, imageUrl: value })}
        onUpload={(file) => onUploadMedia("imageUrl", file)}
      />
    </div>
  </div>
);

export default QuizEditorForm;
