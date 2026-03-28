import { Brain, KanbanSquare } from "lucide-react";
import { EmptyState, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReviewMode, ReviewRating, SavedWord } from "./types";
import { formatRelativeReview, ratingButtonClass } from "./utils";

interface ReviewQueueSectionProps {
  reviewMode: ReviewMode;
  reviewLoading: boolean;
  reviewQueue: SavedWord[];
  reviewingId: number | null;
  onReviewModeChange: (value: ReviewMode) => void;
  onReview: (wordId: number, rating: ReviewRating) => void;
}

const ReviewQueueSection = ({
  reviewMode,
  reviewLoading,
  reviewQueue,
  reviewingId,
  onReviewModeChange,
  onReview,
}: ReviewQueueSectionProps) => (
  <PageSection className="mb-4" title="Review queue" description="Hang doi uu tien nhung muc den han truoc. Chon muc do de he thong tinh lai lich on.">
    <div className="mb-4 grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
      <Select value={reviewMode} onValueChange={(value) => onReviewModeChange(value as ReviewMode)}>
        <SelectTrigger className="h-11 rounded-2xl border-border bg-card text-foreground/80">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tat ca</SelectItem>
          <SelectItem value="KANJI">Kanji focus</SelectItem>
          <SelectItem value="VOCABULARY">Vocabulary focus</SelectItem>
        </SelectContent>
      </Select>

      <div className="rounded-[20px] border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        {reviewMode === "KANJI"
          ? "Hang doi nay uu tien cac muc co kanji de ban luyen nhan dien mat chu."
          : reviewMode === "VOCABULARY"
            ? "Hang doi nay uu tien cac muc vocabulary khong nghieng ve kanji."
            : "Tat ca muc den han se xuat hien o day."}
      </div>
    </div>

    {reviewLoading ? (
      <div className="flex items-center justify-center py-16">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500" />
      </div>
    ) : reviewQueue.length === 0 ? (
      <EmptyState
        description="Khong co muc nao den han trong bo loc hien tai. Ban co the doi che do review hoac quay lai sau."
        icon={<Brain className="h-6 w-6" />}
        title="Review queue dang trong"
      />
    ) : (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {reviewQueue.map((word) => (
          <div key={word.id} className="rounded-[22px] border border-white bg-card p-4 shadow-[0_10px_24px_rgba(148,163,184,0.10)]">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[1.5rem] font-semibold text-foreground">{word.kanji || word.hiragana}</p>
                <p className="text-sm text-sky-700">{word.hiragana}</p>
                <p className="text-xs text-muted-foreground">{word.romaji}</p>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">{word.jlptLevel || "N5"}</Badge>
                <Badge className="rounded-full border border-border bg-muted text-muted-foreground">{word.studyFocus}</Badge>
              </div>
            </div>

            <p className="text-sm text-foreground/80">{word.meaning}</p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-[16px] border border-border bg-muted/40 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Next review</p>
                <p className="mt-2 font-medium text-foreground">{formatRelativeReview(word.nextReviewAt)}</p>
              </div>
              <div className="rounded-[16px] border border-border bg-muted/40 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Interval</p>
                <p className="mt-2 font-medium text-foreground">{word.reviewIntervalDays} ngay</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>Lap lai: {word.repetitionCount}</span>
              <span>·</span>
              <span>Review: {word.reviewCount}</span>
              <span>·</span>
              <span>Ease: {word.easeFactor?.toFixed?.(2) ?? word.easeFactor}</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {(["AGAIN", "HARD", "GOOD", "EASY"] as const).map((rating) => (
                <Button
                  key={rating}
                  className={`rounded-xl ${ratingButtonClass[rating]}`}
                  disabled={reviewingId === word.id}
                  onClick={() => onReview(word.id, rating)}
                  size="sm"
                >
                  {rating}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </PageSection>
);

export default ReviewQueueSection;
