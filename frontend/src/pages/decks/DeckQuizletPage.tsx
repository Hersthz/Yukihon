import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Layers,
  Loader2,
  RotateCcw,
  Shuffle,
  Sparkles,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, PageHeader } from "@/components/layout/UserPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { deckApi, type DeckCard } from "@/api/deckApi";
import { quizletApi } from "@/api/quizletApi";

type Mode = "flashcard" | "learn" | "match";

const MODES: { key: Mode; label: string }[] = [
  { key: "flashcard", label: "Lật thẻ" },
  { key: "learn", label: "Điền từ" },
  { key: "match", label: "Ghép cặp" },
];

const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();

/* ----------------------------- Flashcard ----------------------------- */
const FlashcardMode = ({ cards }: { cards: DeckCard[] }) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[index];

  const go = (delta: number) => {
    setFlipped(false);
    setIndex((i) => (i + delta + cards.length) % cards.length);
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="yukihon-card flex min-h-[260px] w-full flex-col items-center justify-center gap-3 p-8 text-center"
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {flipped ? "Mặt sau" : "Mặt trước"}
        </span>
        <span className="text-3xl font-bold text-foreground">
          {flipped ? card.back : card.front}
        </span>
        {!flipped && card.hint && (
          <span className="text-sm text-muted-foreground">Gợi ý: {card.hint}</span>
        )}
        <span className="mt-2 text-xs text-muted-foreground">Nhấn để lật</span>
      </button>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => go(-1)}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Trước
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {index + 1} / {cards.length}
        </span>
        <Button onClick={() => go(1)}>
          Sau <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

/* ------------------------------- Learn ------------------------------- */
const LearnMode = ({ deckId, cards }: { deckId: number; cards: DeckCard[] }) => {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const card = cards[index];
  const done = index >= cards.length;

  const submit = () => {
    if (result !== "idle") return;
    const ok = norm(value) === norm(card.back);
    setResult(ok ? "correct" : "wrong");
    setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }));
    void quizletApi.answer({ deckId, flashcardId: card.flashcardId, correct: ok }).catch(() => {});
  };

  const next = () => {
    setValue("");
    setResult("idle");
    setIndex((i) => i + 1);
  };

  const restart = () => {
    setValue("");
    setResult("idle");
    setScore({ correct: 0, total: 0 });
    setIndex(0);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="yukihon-card flex flex-col items-center gap-3 p-8 text-center">
          <Sparkles className="h-10 w-10 text-primary" />
          <p className="text-xl font-bold text-foreground">Hoàn thành!</p>
          <p className="text-muted-foreground">
            Đúng {score.correct} / {score.total} thẻ
          </p>
          <Button className="mt-2" onClick={restart}>
            <RotateCcw className="mr-1 h-4 w-4" /> Học lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {index + 1} / {cards.length}
        </span>
        <span>Đúng {score.correct}</span>
      </div>

      <div className="yukihon-card space-y-4 p-6">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Nhập nghĩa / mặt sau
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground">{card.front}</p>
          {card.hint && <p className="mt-1 text-sm text-muted-foreground">Gợi ý: {card.hint}</p>}
        </div>

        <Input
          autoFocus
          value={value}
          disabled={result !== "idle"}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (result === "idle" ? submit() : next())}
          placeholder="Câu trả lời của bạn…"
          className={cn(
            "h-12 text-center text-lg",
            result === "correct" && "border-emerald-400",
            result === "wrong" && "border-red-400"
          )}
        />

        <AnimatePresence>
          {result !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl p-3 text-sm font-semibold",
                result === "correct" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              )}
            >
              {result === "correct" ? (
                <>
                  <Check className="h-4 w-4" /> Chính xác!
                </>
              ) : (
                <>
                  <X className="h-4 w-4" /> Đáp án: <span className="font-bold">{card.back}</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {result === "idle" ? (
          <Button className="w-full" onClick={submit} disabled={!value.trim()}>
            Kiểm tra
          </Button>
        ) : (
          <Button className="w-full" onClick={next}>
            {index + 1 >= cards.length ? "Xem kết quả" : "Thẻ tiếp theo"}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

/* ------------------------------- Match ------------------------------- */
interface Tile {
  id: string;
  cardId: number;
  text: string;
}

const buildTiles = (cards: DeckCard[]): Tile[] => {
  const pick = [...cards].sort(() => Math.random() - 0.5).slice(0, 6);
  const tiles: Tile[] = [];
  pick.forEach((c) => {
    tiles.push({ id: `f-${c.flashcardId}`, cardId: c.flashcardId, text: c.front });
    tiles.push({ id: `b-${c.flashcardId}`, cardId: c.flashcardId, text: c.back });
  });
  return tiles.sort(() => Math.random() - 0.5);
};

const MatchMode = ({ deckId, cards }: { deckId: number; cards: DeckCard[] }) => {
  const [tiles, setTiles] = useState<Tile[]>(() => buildTiles(cards));
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);

  const pairs = tiles.length / 2;
  const completed = matched.size === pairs && pairs > 0;

  const reset = () => {
    setTiles(buildTiles(cards));
    setSelected(null);
    setMatched(new Set());
    setWrong(null);
  };

  const click = (tile: Tile) => {
    if (matched.has(tile.cardId) || wrong) return;
    if (!selected) {
      setSelected(tile.id);
      return;
    }
    if (selected === tile.id) {
      setSelected(null);
      return;
    }
    const first = tiles.find((t) => t.id === selected)!;
    if (first.cardId === tile.cardId) {
      setMatched((m) => new Set(m).add(tile.cardId));
      setSelected(null);
      void quizletApi.answer({ deckId, flashcardId: tile.cardId, correct: true }).catch(() => {});
    } else {
      setWrong(tile.id);
      setTimeout(() => {
        setWrong(null);
        setSelected(null);
      }, 600);
    }
  };

  if (completed) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="yukihon-card flex flex-col items-center gap-3 p-8 text-center">
          <Sparkles className="h-10 w-10 text-primary" />
          <p className="text-xl font-bold text-foreground">Ghép xong tất cả!</p>
          <Button className="mt-2" onClick={reset}>
            <Shuffle className="mr-1 h-4 w-4" /> Chơi lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Đã ghép {matched.size} / {pairs}
        </span>
        <Button variant="ghost" size="sm" onClick={reset}>
          <Shuffle className="mr-1 h-4 w-4" /> Xáo lại
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {tiles.map((tile) => {
          const isMatched = matched.has(tile.cardId);
          const isSelected = selected === tile.id;
          const isWrong = wrong === tile.id;
          return (
            <button
              key={tile.id}
              type="button"
              disabled={isMatched}
              onClick={() => click(tile)}
              className={cn(
                "flex min-h-[88px] items-center justify-center rounded-2xl border p-3 text-center text-sm font-medium transition-all",
                isMatched && "pointer-events-none border-emerald-200 bg-emerald-50 opacity-50",
                isSelected && "border-primary bg-primary/10 text-primary",
                isWrong && "border-red-400 bg-red-50 text-red-700",
                !isMatched &&
                  !isSelected &&
                  !isWrong &&
                  "border-border bg-card hover:border-primary/40"
              )}
            >
              {tile.text}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------- Page ------------------------------- */
const DeckQuizletPage = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const id = Number(deckId);
  const [params, setParams] = useSearchParams();
  const mode = (params.get("mode") as Mode) || "flashcard";

  const deckQuery = useQuery({
    queryKey: ["deck", id],
    queryFn: () => deckApi.get(id),
    enabled: !!id,
  });
  const cardsQuery = useQuery({
    queryKey: ["deck", id, "cards"],
    queryFn: () => deckApi.listCards(id),
    enabled: !!id,
  });

  const cards = useMemo(
    () => (cardsQuery.data ?? []).filter((c) => c.front && c.back),
    [cardsQuery.data]
  );

  const setMode = (m: Mode) => setParams({ mode: m }, { replace: true });

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1280px]">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link to="/decks">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Bộ thẻ
          </Link>
        </Button>

        <PageHeader
          icon={<Layers className="h-5 w-5 text-primary" />}
          eyebrow="Ôn nhanh (không tính lịch SRS)"
          title={deckQuery.data?.title || "Ôn tập"}
          description="Lật thẻ, điền từ hoặc ghép cặp — học thoải mái mà không ảnh hưởng lịch ôn SRS."
        />

        <div className="mb-6 inline-flex rounded-full border border-border bg-card p-1">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                mode === m.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {cardsQuery.isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : cards.length === 0 ? (
          <EmptyState
            icon={<Layers className="h-6 w-6" />}
            title="Bộ thẻ chưa có thẻ"
            description="Thêm thẻ vào bộ này để bắt đầu ôn tập."
          />
        ) : mode === "flashcard" ? (
          <FlashcardMode cards={cards} />
        ) : mode === "learn" ? (
          <LearnMode deckId={id} cards={cards} />
        ) : (
          <MatchMode deckId={id} cards={cards} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default DeckQuizletPage;
