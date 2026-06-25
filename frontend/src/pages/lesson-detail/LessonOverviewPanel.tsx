import { Link } from "react-router-dom";
import { PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface LessonOverviewPanelProps {
  lesson: {
    id: number;
    title: string;
    description?: string;
    jlptLevel?: string;
    category?: string;
    status?: string;
    audioUrl?: string;
    videoUrl?: string;
    imageUrl?: string;
  };
  lessonProgress: { id?: number; notes?: string } | null;
  noteText: string;
  upcomingLesson?: { id: number; title: string } | null;
  onNoteChange: (value: string) => void;
  onSaveNote: () => void;
}

const LessonOverviewPanel = ({
  lesson,
  lessonProgress,
  noteText,
  upcomingLesson,
  onNoteChange,
  onSaveNote,
}: LessonOverviewPanelProps) => (
  <PageSection
    title="Tổng quan bài học"
    description="Đây là nơi bạn có thể bắt đầu, tiếp tục và đánh dấu hoàn thành bài học."
  >
    <div className="space-y-4">
      <div className="rounded-[20px] border border-border bg-card p-4">
        <div className="flex flex-wrap gap-2">
          <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">
            {lesson.jlptLevel || "N5"}
          </Badge>
          {lesson.category ? (
            <Badge className="rounded-full border border-border bg-muted text-muted-foreground">
              {lesson.category}
            </Badge>
          ) : null}
          {lesson.status ? (
            <Badge className="rounded-full border border-border bg-white text-foreground/70">
              {lesson.status}
            </Badge>
          ) : null}
        </div>
        <p className="mt-4 text-sm leading-6 text-foreground/80">
          {lesson.description ||
            "Bài học này chưa có mô tả ngắn. Bạn có thể vào thẳng nội dung bên phải để học ngay."}
        </p>
      </div>

      <div className="rounded-[20px] border border-emerald-200 bg-emerald-50/70 p-4">
        <p className="text-sm font-semibold text-emerald-800">Nhịp học gợi ý</p>
        <p className="mt-1 text-sm text-foreground/80">
          Bắt đầu bài học để đưa nó vào luồng cá nhân hóa, và đánh dấu hoàn thành khi học xong để
          dashboard cập nhật bài tiếp theo.
        </p>
      </div>

      {lesson.audioUrl || lesson.videoUrl || lesson.imageUrl ? (
        <div className="rounded-[20px] border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground">Tài nguyên đi kèm</p>
          <div className="mt-3 space-y-3">
            {lesson.imageUrl ? (
              <img
                alt={lesson.title}
                className="w-full rounded-2xl border border-border object-cover"
                src={lesson.imageUrl}
              />
            ) : null}
            {lesson.audioUrl ? <audio className="w-full" controls src={lesson.audioUrl} /> : null}
            {lesson.videoUrl ? (
              <video
                className="w-full rounded-2xl border border-border"
                controls
                src={lesson.videoUrl}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="rounded-[20px] border border-border bg-card p-4">
        <p className="text-sm font-semibold text-foreground">Ghi chú cá nhân</p>
        <Textarea
          className="mt-3 min-h-[120px] rounded-[18px] border-border bg-background/60"
          disabled={!lessonProgress}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder={
            lessonProgress
              ? "Tóm tắt điểm cần nhớ, từ mới, hoặc câu cần ôn lại."
              : "Bắt đầu bài học trước để lưu ghi chú học bài."
          }
          value={noteText}
        />
        <Button className="mt-3 rounded-2xl" disabled={!lessonProgress} onClick={onSaveNote}>
          Lưu ghi chú
        </Button>
      </div>

      <Link
        to="/my-words"
        className="block rounded-[20px] border border-amber-200 bg-amber-50/70 p-4 text-sm text-foreground/80"
      >
        Sau khi học xong, bạn có thể quay sang sổ từ vựng để ôn tập bằng lặp lại ngắt quãng.
      </Link>

      {upcomingLesson ? (
        <Link
          to={`/lessons/${upcomingLesson.id}`}
          className="block rounded-[20px] border border-sky-200 bg-sky-50/70 p-4 text-sm text-foreground/80"
        >
          Bài tiếp theo gợi ý:{" "}
          <span className="font-semibold text-sky-700">{upcomingLesson.title}</span>
        </Link>
      ) : null}
    </div>
  </PageSection>
);

export default LessonOverviewPanel;
