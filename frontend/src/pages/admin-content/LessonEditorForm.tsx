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
  DRAFT: { label: "Bản nháp", description: "Đang soạn và chưa sẵn sàng để duyệt." },
  REVIEW: {
    label: "Chờ duyệt",
    description: "Sẵn sàng để biên tập hoặc giảng viên duyệt trước khi xuất bản.",
  },
  PUBLISHED: {
    label: "Đã xuất bản",
    description: "Hiển thị cho học viên và đủ điều kiện gợi ý trong lộ trình học.",
  },
  ARCHIVED: {
    label: "Đã lưu trữ",
    description: "Ẩn khỏi luồng học đang hoạt động nhưng vẫn được giữ lại để lưu lịch sử.",
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
            <p className="text-sm font-semibold text-foreground">Quy trình xuất bản</p>
            <p className="text-sm text-muted-foreground">
              Đưa bài học qua các bước nháp, duyệt, xuất bản và lưu trữ mà không mất lịch sử.
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
          <Label>Tiêu đề</Label>
          <Input
            value={item.title}
            onChange={(event) => onChange({ ...item, title: event.target.value })}
            className="bg-background/50"
          />
        </div>
        <div>
          <Label>Danh mục</Label>
          <Input
            value={item.category}
            onChange={(event) => onChange({ ...item, category: event.target.value })}
            className="bg-background/50"
          />
        </div>
      </div>

      <div>
        <Label>Mô tả</Label>
        <Textarea
          value={item.description}
          onChange={(event) => onChange({ ...item, description: event.target.value })}
          className="bg-background/50"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label>Cấp độ JLPT</Label>
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
          <Label>Giai đoạn quy trình</Label>
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
          <Label>Thứ tự</Label>
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
        <Label>Nội dung bài học</Label>
        <Textarea
          value={item.content}
          onChange={(event) => onChange({ ...item, content: event.target.value })}
          className="min-h-[220px] bg-background/50"
          placeholder="Thêm nội dung bài học, markdown hoặc ghi chú có cấu trúc tại đây."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <MediaField
          label="URL âm thanh"
          value={item.audioUrl}
          accept="audio/*"
          previewType="audio"
          uploading={uploadingField === "audioUrl"}
          onChange={(value) => onChange({ ...item, audioUrl: value })}
          onUpload={(file) => onUploadMedia("audioUrl", file)}
        />
        <MediaField
          label="URL video"
          value={item.videoUrl}
          accept="video/*"
          previewType="video"
          uploading={uploadingField === "videoUrl"}
          onChange={(value) => onChange({ ...item, videoUrl: value })}
          onUpload={(file) => onUploadMedia("videoUrl", file)}
        />
        <MediaField
          label="URL hình ảnh"
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
            <p className="text-sm font-semibold text-foreground">Trình liên kết nội dung</p>
            <p className="text-sm text-muted-foreground">
              Liên kết từ vựng, ngữ pháp và bài kiểm tra riêng của bài học mà không cần nhập ID thủ
              công.
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs text-muted-foreground">
            {item.relatedVocabularyIds.length} từ vựng đã liên kết
          </span>
          <span className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs text-muted-foreground">
            {item.relatedGrammarIds.length} ngữ pháp đã liên kết
          </span>
          <span className="rounded-full border border-border bg-background/40 px-3 py-1 text-xs text-muted-foreground">
            {item.relatedQuizIds.length} bài kiểm tra đã liên kết
          </span>
        </div>

        <div className="space-y-4">
          <OptionPicker
            label="Từ vựng"
            description="Chọn bộ từ vựng sẽ xuất hiện trong bài học này."
            options={contentOptions.vocabulary}
            selectedIds={item.relatedVocabularyIds}
            onToggle={(id) => toggleRelation("relatedVocabularyIds", id)}
          />
          <OptionPicker
            label="Ngữ pháp"
            description="Gói các điểm ngữ pháp liên quan vào thẻ bài học."
            options={contentOptions.grammar}
            selectedIds={item.relatedGrammarIds}
            onToggle={(id) => toggleRelation("relatedGrammarIds", id)}
          />
          <OptionPicker
            label="Bài kiểm tra"
            description="Chọn các checkpoint sẽ hiển thị trong luồng bài học."
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
              <p className="text-sm font-semibold text-foreground">Lịch sử phiên bản bài học</p>
              <p className="text-sm text-muted-foreground">
                Mỗi lần lưu sẽ tạo một bản lưu. Tải một bản lưu vào trình chỉnh sửa để xem lại hoặc
                khôi phục trước khi lưu lại.
              </p>
            </div>
          </div>

          {lessonVersions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có bản lưu nào cho bài học này.</p>
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
                      Tải bản lưu
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border px-2 py-1">
                      {version.relatedVocabularyIds.length} từ vựng
                    </span>
                    <span className="rounded-full border border-border px-2 py-1">
                      {version.relatedGrammarIds.length} ngữ pháp
                    </span>
                    <span className="rounded-full border border-border px-2 py-1">
                      {version.relatedQuizIds.length} bài kiểm tra
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
