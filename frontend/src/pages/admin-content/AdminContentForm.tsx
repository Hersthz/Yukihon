import { useMemo, useState } from "react";
import { History, Link2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JLPT_LEVELS, LESSON_STATUSES, QUIZ_DIFFICULTIES, QUIZ_TYPES, WORD_TYPES } from "./constants";
import { AdminTab, EditableItem, GrammarItem, Lesson, LessonVersion, QuizItem, VocabItem } from "./types";

interface SelectableContent {
  id?: number;
  title?: string;
  kanji?: string;
  meaning?: string;
  pattern?: string;
}

interface AdminContentFormProps {
  activeTab: AdminTab;
  editItem: EditableItem | null;
  setEditItem: (item: EditableItem) => void;
  lessonVersions: LessonVersion[];
  contentOptions: {
    vocabulary: VocabItem[];
    grammar: GrammarItem[];
    quizzes: QuizItem[];
  };
  uploadMedia: (file: File) => Promise<string>;
}

const normalizeSearch = (value: string) => value.trim().toLowerCase();

const OptionPicker = ({
  label,
  description,
  options,
  selectedIds,
  onToggle,
}: {
  label: string;
  description: string;
  options: SelectableContent[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = normalizeSearch(query);
    return options
      .filter((item) => item.id != null)
      .filter((item) => {
        if (!normalized) return true;
        return [item.title, item.kanji, item.meaning, item.pattern]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalized));
      })
      .slice(0, 16);
  }, [options, query]);

  return (
    <div className="rounded-[20px] border border-border bg-card/60 p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="bg-background/50"
        placeholder={`Tim ${label.toLowerCase()}...`}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {selectedIds.length === 0 ? <span className="text-xs text-muted-foreground">Chua chon noi dung nao.</span> : null}
        {selectedIds.map((id) => {
          const item = options.find((option) => option.id === id);
          const text = item?.title || item?.kanji || item?.pattern || item?.meaning || `#${id}`;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onToggle(id)}
              className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary transition hover:bg-primary/20"
            >
              {text} ×
            </button>
          );
        })}
      </div>

      <div className="mt-3 max-h-44 overflow-y-auto rounded-[18px] border border-border bg-background/40 p-3">
        <div className="flex flex-wrap gap-2">
          {filtered.map((item) => {
            const id = item.id as number;
            const active = selectedIds.includes(id);
            const text = item.title || item.kanji || item.pattern || item.meaning || `#${id}`;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onToggle(id)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const MediaField = ({
  label,
  value,
  accept,
  uploading,
  onChange,
  onUpload,
}: {
  label: string;
  value: string;
  accept: string;
  uploading: boolean;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input value={value} onChange={(event) => onChange(event.target.value)} className="bg-background/50" />
    <div className="flex items-center gap-3">
      <Input
        type="file"
        accept={accept}
        className="bg-background/50"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void onUpload(file);
          }
          event.currentTarget.value = "";
        }}
      />
      <Button disabled={uploading} size="sm" variant="outline" className="rounded-xl">
        <UploadCloud className="mr-2 h-4 w-4" />
        {uploading ? "Uploading..." : "Upload"}
      </Button>
    </div>
  </div>
);

const AdminContentForm = ({
  activeTab,
  editItem,
  setEditItem,
  lessonVersions,
  contentOptions,
  uploadMedia,
}: AdminContentFormProps) => {
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  if (!editItem) {
    return null;
  }

  const uploadToField = async (field: string, file: File) => {
    try {
      setUploadingField(field);
      const response = (await uploadMedia(file)) as { url: string };
      setEditItem({ ...(editItem as Record<string, unknown>), [field]: response.url } as EditableItem);
    } finally {
      setUploadingField(null);
    }
  };

  switch (activeTab) {
    case "lessons": {
      const item = editItem as Lesson;

      const toggleRelation = (field: "relatedVocabularyIds" | "relatedGrammarIds" | "relatedQuizIds", id: number) => {
        const current = item[field];
        const next = current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
        setEditItem({ ...item, [field]: next });
      };

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
              <Label>Workflow Stage</Label>
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

          <div className="flex flex-wrap gap-2 rounded-[20px] border border-border bg-card/60 p-3">
            {LESSON_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setEditItem({ ...item, status })}
                className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                  item.status === status ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {status}
              </button>
            ))}
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

          <div className="grid gap-4 md:grid-cols-3">
            <MediaField
              label="Audio URL"
              value={item.audioUrl}
              accept="audio/*"
              uploading={uploadingField === "audioUrl"}
              onChange={(value) => setEditItem({ ...item, audioUrl: value })}
              onUpload={(file) => uploadToField("audioUrl", file)}
            />
            <MediaField
              label="Video URL"
              value={item.videoUrl}
              accept="video/*"
              uploading={uploadingField === "videoUrl"}
              onChange={(value) => setEditItem({ ...item, videoUrl: value })}
              onUpload={(file) => uploadToField("videoUrl", file)}
            />
            <MediaField
              label="Image URL"
              value={item.imageUrl}
              accept="image/*"
              uploading={uploadingField === "imageUrl"}
              onChange={(value) => setEditItem({ ...item, imageUrl: value })}
              onUpload={(file) => uploadToField("imageUrl", file)}
            />
          </div>

          <div className="rounded-[22px] border border-border bg-card/60 p-4">
            <div className="mb-4 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Related content builder</p>
                <p className="text-sm text-muted-foreground">Lien ket lesson voi vocab, grammar va quiz bang picker thay vi nhap ID tay.</p>
              </div>
            </div>

            <div className="space-y-4">
              <OptionPicker
                label="Vocabulary"
                description="Chon tu vung nen hien trong lesson."
                options={contentOptions.vocabulary}
                selectedIds={item.relatedVocabularyIds}
                onToggle={(id) => toggleRelation("relatedVocabularyIds", id)}
              />
              <OptionPicker
                label="Grammar"
                description="Gom cac mau ngu phap lien quan vao mot lesson."
                options={contentOptions.grammar}
                selectedIds={item.relatedGrammarIds}
                onToggle={(id) => toggleRelation("relatedGrammarIds", id)}
              />
              <OptionPicker
                label="Quizzes"
                description="Chon cac checkpoint quiz can hien thi theo lesson."
                options={contentOptions.quizzes}
                selectedIds={item.relatedQuizIds}
                onToggle={(id) => toggleRelation("relatedQuizIds", id)}
              />
            </div>
          </div>

          {item.id ? (
            <div className="rounded-[22px] border border-border bg-card/60 p-4">
              <div className="mb-4 flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Lesson version history</p>
                  <p className="text-sm text-muted-foreground">Moi lan luu lesson se tao snapshot de de doi chieu thay doi.</p>
                </div>
              </div>

              {lessonVersions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chua co version history.</p>
              ) : (
                <div className="space-y-2">
                  {lessonVersions.map((version) => (
                    <div key={version.id} className="rounded-[18px] border border-border bg-background/50 p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-foreground">
                          v{version.versionNumber} • {version.changeAction}
                        </p>
                        <span className="text-xs text-muted-foreground">{new Date(version.createdAt).toLocaleString("vi-VN")}</span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{version.title} • {version.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
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
          <div>
            <Label>Linked Lesson ID</Label>
            <Input
              type="number"
              value={item.lessonId ?? ""}
              onChange={(e) => setEditItem({ ...item, lessonId: e.target.value ? Number.parseInt(e.target.value, 10) : undefined })}
              className="bg-background/50"
              placeholder="De trong neu khong gan vao lesson cu the"
            />
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
          <div className="grid gap-4 md:grid-cols-2">
            <MediaField
              label="Audio URL"
              value={item.audioUrl}
              accept="audio/*"
              uploading={uploadingField === "quiz-audioUrl"}
              onChange={(value) => setEditItem({ ...item, audioUrl: value })}
              onUpload={(file) => uploadToField("audioUrl", file)}
            />
            <MediaField
              label="Image URL"
              value={item.imageUrl}
              accept="image/*"
              uploading={uploadingField === "quiz-imageUrl"}
              onChange={(value) => setEditItem({ ...item, imageUrl: value })}
              onUpload={(file) => uploadToField("imageUrl", file)}
            />
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};

export default AdminContentForm;
