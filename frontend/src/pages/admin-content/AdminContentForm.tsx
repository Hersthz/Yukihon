import { useMemo, useState } from "react";
import { History, Link2, UploadCloud, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JLPT_LEVELS, LESSON_STATUSES, QUIZ_DIFFICULTIES, QUIZ_TYPES, WORD_TYPES } from "./constants";
import { AdminTab, EditableItem, GrammarItem, Lesson, LessonVersion, MediaUploadResult, QuizItem, VocabItem } from "./types";

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
    lessons: Lesson[];
    vocabulary: VocabItem[];
    grammar: GrammarItem[];
    quizzes: QuizItem[];
  };
  uploadMedia: (file: File) => Promise<MediaUploadResult>;
  onRestoreLessonVersion: (version: LessonVersion) => void;
}

const normalizeSearch = (value: string) => value.trim().toLowerCase();

const getOptionLabel = (item: SelectableContent) => item.title || item.kanji || item.pattern || item.meaning || `#${item.id ?? "new"}`;

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
      .slice(0, 24);
  }, [options, query]);

  return (
    <div className="rounded-[22px] border border-border bg-background/40 p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="bg-background/60"
        placeholder={`Search ${label.toLowerCase()}...`}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {selectedIds.length === 0 ? <span className="text-xs text-muted-foreground">No linked items yet.</span> : null}
        {selectedIds.map((id) => {
          const item = options.find((option) => option.id === id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onToggle(id)}
              className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary transition hover:bg-primary/20"
            >
              {getOptionLabel(item ?? { id })} x
            </button>
          );
        })}
      </div>

      <div className="mt-3 max-h-44 overflow-y-auto rounded-[18px] border border-border bg-card/40 p-3">
        <div className="flex flex-wrap gap-2">
          {filtered.map((item) => {
            const id = item.id as number;
            const active = selectedIds.includes(id);

            return (
              <button
                key={id}
                type="button"
                onClick={() => onToggle(id)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {getOptionLabel(item)}
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
  previewType,
  onChange,
  onUpload,
}: {
  label: string;
  value: string;
  accept: string;
  uploading: boolean;
  previewType: "image" | "audio" | "video";
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
}) => (
  <div className="space-y-2 rounded-[22px] border border-border bg-background/40 p-4">
    <Label>{label}</Label>
    <Input value={value} onChange={(event) => onChange(event.target.value)} className="bg-background/60" placeholder="Paste URL or upload a file" />

    <div className="flex items-center gap-3">
      <Input
        type="file"
        accept={accept}
        className="bg-background/60"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void onUpload(file);
          }
          event.currentTarget.value = "";
        }}
      />
      <div className="inline-flex items-center rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground">
        <UploadCloud className="mr-2 h-4 w-4" />
        {uploading ? "Uploading..." : "Stored on local media server"}
      </div>
    </div>

    {value ? (
      <div className="rounded-[18px] border border-border bg-card/40 p-3">
        {previewType === "image" ? (
          <img src={value} alt={label} className="h-32 w-full rounded-xl object-cover" />
        ) : null}
        {previewType === "audio" ? <audio controls src={value} className="mb-3 w-full" /> : null}
        {previewType === "video" ? <video controls src={value} className="mb-3 h-32 w-full rounded-xl object-cover" /> : null}
        <a href={value} target="_blank" rel="noreferrer" className="text-xs text-primary underline underline-offset-4">
          Open uploaded asset
        </a>
      </div>
    ) : null}
  </div>
);

const statusCopy: Record<Lesson["status"], { label: string; description: string }> = {
  DRAFT: { label: "Draft", description: "Work in progress and not ready for review yet." },
  REVIEW: { label: "Review", description: "Ready for editorial or teaching review before publishing." },
  PUBLISHED: { label: "Published", description: "Visible to learners and eligible for learning path recommendations." },
  ARCHIVED: { label: "Archived", description: "Hidden from active learning flows but preserved for history." },
};

const AdminContentForm = ({
  activeTab,
  editItem,
  setEditItem,
  lessonVersions,
  contentOptions,
  uploadMedia,
  onRestoreLessonVersion,
}: AdminContentFormProps) => {
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  if (!editItem) {
    return null;
  }

  const uploadToField = async (field: string, file: File) => {
    try {
      setUploadingField(field);
      const response = await uploadMedia(file);
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
        <div className="space-y-5">
          <div className="rounded-[24px] border border-border bg-card/60 p-4">
            <div className="mb-4 flex items-center gap-2">
              <Workflow className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Publishing workflow</p>
                <p className="text-sm text-muted-foreground">Move the lesson through draft, review, publish, and archive without losing history.</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {LESSON_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setEditItem({ ...item, status })}
                  className={`rounded-[20px] border p-4 text-left transition ${
                    item.status === status ? "border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" : "border-border bg-background/40 hover:bg-background/60"
                  }`}
                >
                  <p className="text-sm font-semibold text-foreground">{statusCopy[status].label}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{statusCopy[status].description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Title</Label>
              <Input value={item.title} onChange={(event) => setEditItem({ ...item, title: event.target.value })} className="bg-background/50" />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={item.category} onChange={(event) => setEditItem({ ...item, category: event.target.value })} className="bg-background/50" />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={item.description} onChange={(event) => setEditItem({ ...item, description: event.target.value })} className="bg-background/50" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
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
            <div>
              <Label>Order</Label>
              <Input
                type="number"
                value={item.orderIndex}
                onChange={(event) => setEditItem({ ...item, orderIndex: Number.parseInt(event.target.value, 10) || 0 })}
                className="bg-background/50"
              />
            </div>
          </div>

          <div>
            <Label>Lesson Content</Label>
            <Textarea
              value={item.content}
              onChange={(event) => setEditItem({ ...item, content: event.target.value })}
              className="min-h-[220px] bg-background/50"
              placeholder="Add the lesson body, markdown, or structured notes here."
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <MediaField
              label="Audio URL"
              value={item.audioUrl}
              accept="audio/*"
              previewType="audio"
              uploading={uploadingField === "audioUrl"}
              onChange={(value) => setEditItem({ ...item, audioUrl: value })}
              onUpload={(file) => uploadToField("audioUrl", file)}
            />
            <MediaField
              label="Video URL"
              value={item.videoUrl}
              accept="video/*"
              previewType="video"
              uploading={uploadingField === "videoUrl"}
              onChange={(value) => setEditItem({ ...item, videoUrl: value })}
              onUpload={(file) => uploadToField("videoUrl", file)}
            />
            <MediaField
              label="Image URL"
              value={item.imageUrl}
              accept="image/*"
              previewType="image"
              uploading={uploadingField === "imageUrl"}
              onChange={(value) => setEditItem({ ...item, imageUrl: value })}
              onUpload={(file) => uploadToField("imageUrl", file)}
            />
          </div>

          <div className="rounded-[24px] border border-border bg-card/60 p-4">
            <div className="mb-4 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Related content builder</p>
                <p className="text-sm text-muted-foreground">Link vocabulary, grammar, and lesson-specific quizzes without typing raw IDs.</p>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs text-muted-foreground">
                {item.relatedVocabularyIds.length} vocab linked
              </span>
              <span className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs text-muted-foreground">
                {item.relatedGrammarIds.length} grammar linked
              </span>
              <span className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs text-muted-foreground">
                {item.relatedQuizIds.length} quizzes linked
              </span>
            </div>

            <div className="space-y-4">
              <OptionPicker
                label="Vocabulary"
                description="Pick the vocabulary set that should appear inside this lesson."
                options={contentOptions.vocabulary}
                selectedIds={item.relatedVocabularyIds}
                onToggle={(id) => toggleRelation("relatedVocabularyIds", id)}
              />
              <OptionPicker
                label="Grammar"
                description="Bundle the relevant grammar points into the lesson card."
                options={contentOptions.grammar}
                selectedIds={item.relatedGrammarIds}
                onToggle={(id) => toggleRelation("relatedGrammarIds", id)}
              />
              <OptionPicker
                label="Quizzes"
                description="Choose which checkpoints should be shown in the lesson flow."
                options={contentOptions.quizzes}
                selectedIds={item.relatedQuizIds}
                onToggle={(id) => toggleRelation("relatedQuizIds", id)}
              />
            </div>
          </div>

          {item.id ? (
            <div className="rounded-[24px] border border-border bg-card/60 p-4">
              <div className="mb-4 flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Lesson version history</p>
                  <p className="text-sm text-muted-foreground">Each save creates a snapshot. Load a snapshot into the editor to review or restore it before saving again.</p>
                </div>
              </div>

              {lessonVersions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No snapshots yet for this lesson.</p>
              ) : (
                <div className="space-y-3">
                  {lessonVersions.map((version) => (
                    <div key={version.id} className="rounded-[18px] border border-border bg-background/50 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            v{version.versionNumber} · {version.changeAction}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {version.title} · {version.status} · {new Date(version.createdAt).toLocaleString("vi-VN")}
                          </p>
                        </div>

                        <Button type="button" variant="outline" size="sm" onClick={() => onRestoreLessonVersion(version)}>
                          Load snapshot
                        </Button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full border border-border px-2 py-1">{version.relatedVocabularyIds.length} vocab</span>
                        <span className="rounded-full border border-border px-2 py-1">{version.relatedGrammarIds.length} grammar</span>
                        <span className="rounded-full border border-border px-2 py-1">{version.relatedQuizIds.length} quizzes</span>
                      </div>
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
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Kanji</Label>
              <Input value={item.kanji} onChange={(event) => setEditItem({ ...item, kanji: event.target.value })} className="bg-background/50 text-xl" />
            </div>
            <div>
              <Label>Hiragana</Label>
              <Input value={item.hiragana} onChange={(event) => setEditItem({ ...item, hiragana: event.target.value })} className="bg-background/50" />
            </div>
            <div>
              <Label>Romaji</Label>
              <Input value={item.romaji} onChange={(event) => setEditItem({ ...item, romaji: event.target.value })} className="bg-background/50" />
            </div>
          </div>

          <div>
            <Label>Meaning</Label>
            <Textarea value={item.meaning} onChange={(event) => setEditItem({ ...item, meaning: event.target.value })} className="bg-background/50" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
            <Textarea value={item.exampleSentenceJP} onChange={(event) => setEditItem({ ...item, exampleSentenceJP: event.target.value })} className="bg-background/50" />
          </div>

          <div>
            <Label>Example EN</Label>
            <Textarea value={item.exampleSentenceEN} onChange={(event) => setEditItem({ ...item, exampleSentenceEN: event.target.value })} className="bg-background/50" />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea value={item.additionalNotes} onChange={(event) => setEditItem({ ...item, additionalNotes: event.target.value })} className="bg-background/50" />
          </div>
        </div>
      );
    }

    case "grammar": {
      const item = editItem as GrammarItem;

      return (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Title</Label>
              <Input value={item.title} onChange={(event) => setEditItem({ ...item, title: event.target.value })} className="bg-background/50" />
            </div>
            <div>
              <Label>Pattern</Label>
              <Input value={item.pattern} onChange={(event) => setEditItem({ ...item, pattern: event.target.value })} className="bg-background/50 text-lg" />
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
            <Textarea value={item.explanation} onChange={(event) => setEditItem({ ...item, explanation: event.target.value })} className="min-h-[120px] bg-background/50" />
          </div>

          <div>
            <Label>Usage</Label>
            <Textarea value={item.usage} onChange={(event) => setEditItem({ ...item, usage: event.target.value })} className="bg-background/50" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Example JP</Label>
              <Textarea value={item.exampleJP} onChange={(event) => setEditItem({ ...item, exampleJP: event.target.value })} className="bg-background/50" />
            </div>
            <div>
              <Label>Example EN</Label>
              <Textarea value={item.exampleEN} onChange={(event) => setEditItem({ ...item, exampleEN: event.target.value })} className="bg-background/50" />
            </div>
          </div>

          <div>
            <Label>Related Patterns</Label>
            <Input value={item.relatedPatterns} onChange={(event) => setEditItem({ ...item, relatedPatterns: event.target.value })} className="bg-background/50" />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea value={item.notes} onChange={(event) => setEditItem({ ...item, notes: event.target.value })} className="bg-background/50" />
          </div>
        </div>
      );
    }

    case "quizzes": {
      const item = editItem as QuizItem;

      return (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Title</Label>
              <Input value={item.title} onChange={(event) => setEditItem({ ...item, title: event.target.value })} className="bg-background/50" />
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
            <Textarea value={item.description} onChange={(event) => setEditItem({ ...item, description: event.target.value })} className="bg-background/50" />
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
              onValueChange={(value) => setEditItem({ ...item, lessonId: value === "GENERAL" ? undefined : Number(value) })}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GENERAL">General quiz bank</SelectItem>
                {contentOptions.lessons
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
                ? `Currently linked to ${contentOptions.lessons.find((lesson) => lesson.id === item.lessonId)?.title ?? `lesson #${item.lessonId}`}.`
                : "This quiz stays available as a standalone assessment."}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
            <Textarea value={item.question} onChange={(event) => setEditItem({ ...item, question: event.target.value })} className="min-h-[100px] bg-background/50" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Option A</Label>
              <Input value={item.optionA} onChange={(event) => setEditItem({ ...item, optionA: event.target.value })} className="bg-background/50" />
            </div>
            <div>
              <Label>Option B</Label>
              <Input value={item.optionB} onChange={(event) => setEditItem({ ...item, optionB: event.target.value })} className="bg-background/50" />
            </div>
            <div>
              <Label>Option C</Label>
              <Input value={item.optionC} onChange={(event) => setEditItem({ ...item, optionC: event.target.value })} className="bg-background/50" />
            </div>
            <div>
              <Label>Option D</Label>
              <Input value={item.optionD} onChange={(event) => setEditItem({ ...item, optionD: event.target.value })} className="bg-background/50" />
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
            <Textarea value={item.explanation} onChange={(event) => setEditItem({ ...item, explanation: event.target.value })} className="bg-background/50" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <MediaField
              label="Audio URL"
              value={item.audioUrl}
              accept="audio/*"
              previewType="audio"
              uploading={uploadingField === "audioUrl"}
              onChange={(value) => setEditItem({ ...item, audioUrl: value })}
              onUpload={(file) => uploadToField("audioUrl", file)}
            />
            <MediaField
              label="Image URL"
              value={item.imageUrl}
              accept="image/*"
              previewType="image"
              uploading={uploadingField === "imageUrl"}
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
