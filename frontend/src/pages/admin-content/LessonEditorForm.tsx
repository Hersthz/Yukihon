import { History, Link2, Workflow } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JLPT_LEVELS, LESSON_STATUSES } from "./constants";
import { OptionPicker, MediaField } from "./form-shared";
import { GrammarItem, Lesson, LessonVersion, QuizItem, VocabItem } from "./types";

interface LessonEditorFormProps {
  item: Lesson;
  lessonVersions: LessonVersion[];
  contentOptions: {
    vocabulary: VocabItem[];
    grammar: GrammarItem[];
    quizzes: QuizItem[];
  };
  uploadingField: string | null;
  onChange: (item: Lesson) => void;
  onUploadMedia: (field: string, file: File) => Promise<void>;
  onRestoreLessonVersion: (version: LessonVersion) => void;
}

const statusCopy: Record<Lesson["status"], { label: string; description: string }> = {
  DRAFT: { label: "Draft", description: "Work in progress and not ready for review yet." },
  REVIEW: {
    label: "Review",
    description: "Ready for editorial or teaching review before publishing.",
  },
  PUBLISHED: {
    label: "Published",
    description: "Visible to learners and eligible for learning path recommendations.",
  },
  ARCHIVED: {
    label: "Archived",
    description: "Hidden from active learning flows but preserved for history.",
  },
};

const LessonEditorForm = ({
  item,
  lessonVersions,
  contentOptions,
  uploadingField,
  onChange,
  onUploadMedia,
  onRestoreLessonVersion,
}: LessonEditorFormProps) => {
  const toggleRelation = (
    field: "relatedVocabularyIds" | "relatedGrammarIds" | "relatedQuizIds",
    id: number
  ) => {
    const current = item[field];
    const next = current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
    onChange({ ...item, [field]: next });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[24px] border border-border bg-card/60 p-4">
        <div className="mb-4 flex items-center gap-2">
          <Workflow className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Publishing workflow</p>
            <p className="text-sm text-muted-foreground">
              Move the lesson through draft, review, publish, and archive without losing history.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {LESSON_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onChange({ ...item, status })}
              className={`rounded-[20px] border p-4 text-left transition ${
                item.status === status
                  ? "border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                  : "border-border bg-background/40 hover:bg-background/60"
              }`}
            >
              <p className="text-sm font-semibold text-foreground">{statusCopy[status].label}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {statusCopy[status].description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Title</Label>
          <Input
            value={item.title}
            onChange={(event) => onChange({ ...item, title: event.target.value })}
            className="bg-background/50"
          />
        </div>
        <div>
          <Label>Category</Label>
          <Input
            value={item.category}
            onChange={(event) => onChange({ ...item, category: event.target.value })}
            className="bg-background/50"
          />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={item.description}
          onChange={(event) => onChange({ ...item, description: event.target.value })}
          className="bg-background/50"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>JLPT Level</Label>
          <Select
            value={item.jlptLevel}
            onValueChange={(value) => onChange({ ...item, jlptLevel: value })}
          >
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
          <Select
            value={item.status}
            onValueChange={(value) => onChange({ ...item, status: value as Lesson["status"] })}
          >
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
            onChange={(event) =>
              onChange({ ...item, orderIndex: Number.parseInt(event.target.value, 10) || 0 })
            }
            className="bg-background/50"
          />
        </div>
      </div>

      <div>
        <Label>Lesson Content</Label>
        <Textarea
          value={item.content}
          onChange={(event) => onChange({ ...item, content: event.target.value })}
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
          onChange={(value) => onChange({ ...item, audioUrl: value })}
          onUpload={(file) => onUploadMedia("audioUrl", file)}
        />
        <MediaField
          label="Video URL"
          value={item.videoUrl}
          accept="video/*"
          previewType="video"
          uploading={uploadingField === "videoUrl"}
          onChange={(value) => onChange({ ...item, videoUrl: value })}
          onUpload={(file) => onUploadMedia("videoUrl", file)}
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

      <div className="rounded-[24px] border border-border bg-card/60 p-4">
        <div className="mb-4 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Related content builder</p>
            <p className="text-sm text-muted-foreground">
              Link vocabulary, grammar, and lesson-specific quizzes without typing raw IDs.
            </p>
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
              <p className="text-sm text-muted-foreground">
                Each save creates a snapshot. Load a snapshot into the editor to review or restore
                it before saving again.
              </p>
            </div>
          </div>

          {lessonVersions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No snapshots yet for this lesson.</p>
          ) : (
            <div className="space-y-3">
              {lessonVersions.map((version) => (
                <div
                  key={version.id}
                  className="rounded-[18px] border border-border bg-background/50 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        v{version.versionNumber} · {version.changeAction}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {version.title} · {version.status} ·{" "}
                        {new Date(version.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRestoreLessonVersion(version)}
                      className="rounded-xl border border-border px-3 py-2 text-sm transition hover:bg-background/60"
                    >
                      Load snapshot
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border px-2 py-1">
                      {version.relatedVocabularyIds.length} vocab
                    </span>
                    <span className="rounded-full border border-border px-2 py-1">
                      {version.relatedGrammarIds.length} grammar
                    </span>
                    <span className="rounded-full border border-border px-2 py-1">
                      {version.relatedQuizIds.length} quizzes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default LessonEditorForm;
