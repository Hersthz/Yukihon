import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2, RotateCcw, PartyPopper, Eye } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { srsApi, type SrsRating, type StudyCard, type StudyQueue } from "@/api/srsApi";
import { deckApi } from "@/api/deckApi";

const RATINGS: {
  key: SrsRating;
  label: string;
  hint: string;
  classes: string;
  shortcut: string;
}[] = [
  {
    key: "AGAIN",
    label: "Lại",
    hint: "againPreview",
    classes: "bg-rose-500 hover:bg-rose-600",
    shortcut: "1",
  },
  {
    key: "HARD",
    label: "Khó",
    hint: "hardPreview",
    classes: "bg-amber-500 hover:bg-amber-600",
    shortcut: "2",
  },
  {
    key: "GOOD",
    label: "Tốt",
    hint: "goodPreview",
    classes: "bg-emerald-500 hover:bg-emerald-600",
    shortcut: "3",
  },
  {
    key: "EASY",
    label: "Dễ",
    hint: "easyPreview",
    classes: "bg-sky-500 hover:bg-sky-600",
    shortcut: "4",
  },
];

const DeckStudyPage = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const id = Number(deckId);

  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [finished, setFinished] = useState(false);

  const studyQuery = useQuery({
    queryKey: ["deck", id, "study-queue"],
    queryFn: async (): Promise<{ queue: StudyQueue; deckTitle: string }> => {
      const [q, deck] = await Promise.all([srsApi.getQueue(id), deckApi.get(id).catch(() => null)]);
      return { queue: q, deckTitle: deck ? deck.title : "" };
    },
    enabled: Number.isFinite(id),
  });

  const queue = studyQuery.data?.queue ?? null;
  const deckTitle = studyQuery.data?.deckTitle ?? "";
  const loading = studyQuery.isLoading;

  // Reset the study session whenever a fresh queue is fetched (mount or refetch).
  useEffect(() => {
    if (!studyQuery.dataUpdatedAt) return;
    setFinished(false);
    setIndex(0);
    setShowBack(false);
    setReviewed(0);
  }, [studyQuery.dataUpdatedAt]);

  useEffect(() => {
    if (studyQuery.error) {
      toast({
        title: "Không tải được",
        description: studyQuery.error instanceof Error ? studyQuery.error.message : "Lỗi",
        variant: "destructive",
      });
    }
  }, [studyQuery.error, toast]);

  const cards = queue?.cards ?? [];
  const current: StudyCard | undefined = cards[index];

  const reviewMutation = useMutation({
    mutationFn: (rating: SrsRating) =>
      srsApi.review({
        deckId: id,
        flashcardId: current!.flashcardId,
        side: current!.side,
        rating,
      }),
    onSuccess: () => {
      setReviewed((r) => r + 1);
      if (index + 1 >= cards.length) {
        setFinished(true);
      } else {
        setIndex((i) => i + 1);
        setShowBack(false);
      }
    },
    onError: (e: unknown) => {
      toast({
        title: "Lỗi ghi nhận",
        description: e instanceof Error ? e.message : "Lỗi",
        variant: "destructive",
      });
    },
  });

  const submitting = reviewMutation.isPending;

  const rate = useCallback(
    (rating: SrsRating) => {
      if (!current || submitting) return;
      reviewMutation.mutate(rating);
    },
    [current, submitting, reviewMutation]
  );

  // Keyboard: Space/Enter to flip, 1-4 to rate.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (finished || loading || !current) return;
      if (!showBack && (e.code === "Space" || e.code === "Enter")) {
        e.preventDefault();
        setShowBack(true);
        return;
      }
      if (showBack) {
        const r = RATINGS.find((x) => x.shortcut === e.key);
        if (r) {
          e.preventDefault();
          void rate(r.key);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showBack, finished, loading, current, rate]);

  const progress = cards.length ? Math.round((index / cards.length) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-2xl flex-col">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/decks")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Thư viện
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            {deckTitle || "Học SRS"}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : finished || cards.length === 0 ? (
          <Card className="flex flex-1 items-center justify-center border-border/70">
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <PartyPopper className="h-12 w-12 text-emerald-500" />
              <div>
                <p className="text-xl font-bold">
                  {cards.length === 0 ? "Không có thẻ đến hạn" : "Hoàn thành!"}
                </p>
                <p className="text-muted-foreground">
                  {cards.length === 0
                    ? "Quay lại sau khi thẻ đến hạn ôn."
                    : `Bạn đã ôn ${reviewed} thẻ.`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate("/decks")}>
                  Về thư viện
                </Button>
                <Button onClick={() => void studyQuery.refetch()}>
                  <RotateCcw className="mr-1 h-4 w-4" /> Tải lại
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>
                  {index + 1} / {cards.length}
                </span>
                <span className="flex items-center gap-2 uppercase tracking-wide">
                  {current?.side === "REVERSE" && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium normal-case text-primary">
                      ⇄ chiều ngược
                    </span>
                  )}
                  {current?.state}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <Card className="flex flex-1 flex-col border-border/70">
              <CardContent className="flex flex-1 flex-col items-center justify-center gap-6 py-12 text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${current?.flashcardId}-${current?.side}-front`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold"
                  >
                    {current?.front}
                  </motion.div>
                </AnimatePresence>

                {showBack && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full space-y-3 border-t pt-6"
                  >
                    {current?.hint && (
                      <p className="text-lg text-muted-foreground">{current.hint}</p>
                    )}
                    <p className="text-2xl font-semibold text-primary">{current?.back}</p>
                    {current?.explanation && (
                      <p className="text-sm text-muted-foreground">{current.explanation}</p>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <div className="mt-4">
              {!showBack ? (
                <Button className="w-full" size="lg" onClick={() => setShowBack(true)}>
                  <Eye className="mr-1 h-4 w-4" /> Hiện đáp án{" "}
                  <span className="ml-2 opacity-60">(Space)</span>
                </Button>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {RATINGS.map((r) => (
                    <button
                      key={r.key}
                      disabled={submitting}
                      onClick={() => void rate(r.key)}
                      className={cn(
                        "flex flex-col items-center gap-0.5 rounded-xl py-3 text-white transition disabled:opacity-60",
                        r.classes
                      )}
                    >
                      <span className="text-sm font-semibold">{r.label}</span>
                      <span className="text-[11px] opacity-90">
                        {current?.[r.hint as keyof StudyCard] as string}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DeckStudyPage;
