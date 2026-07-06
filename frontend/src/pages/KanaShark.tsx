import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Layers, Loader2, Waves } from "lucide-react";

import { deckApi } from "@/api/deckApi";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, PageHeader } from "@/components/layout/UserPage";
import { Button } from "@/components/ui/button";
import KanaSharkGame, { type GameCard } from "@/components/games/KanaSharkGame";

const KanaShark = () => {
  const [deckId, setDeckId] = useState<number | null>(null);

  const decksQuery = useQuery({
    queryKey: ["decks", "mine"],
    queryFn: () => deckApi.listMine(),
  });
  const decks = decksQuery.data ?? [];

  const cardsQuery = useQuery({
    queryKey: ["deck", deckId, "cards"],
    queryFn: () => deckApi.listCards(deckId as number),
    enabled: deckId != null,
  });
  const cards: GameCard[] = useMemo(
    () =>
      (cardsQuery.data ?? [])
        .filter((c) => c.front && c.back)
        .map((c) => ({ front: c.front as string, back: c.back as string, hint: c.hint })),
    [cardsQuery.data]
  );

  const selectedDeck = decks.find((d) => d.id === deckId);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <PageHeader
          icon={<Waves className="h-5 w-5 text-primary" />}
          title="Kana Shark"
          eyebrow="Trò chơi"
          description="Chọn một bộ thẻ rồi gõ đáp án thật nhanh để bắn cá mập lùi ra xa."
          action={
            deckId != null ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => setDeckId(null)}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Đổi bộ thẻ
              </Button>
            ) : undefined
          }
        />

        {deckId == null ? (
          decksQuery.isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : decks.length === 0 ? (
            <EmptyState
              icon={<Layers className="h-6 w-6" />}
              title="Chưa có bộ thẻ"
              description="Hãy tạo hoặc nhập một bộ thẻ ở mục Học SRS trước khi chơi."
            />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {decks.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDeckId(d.id as number)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{d.title}</p>
                    <p className="text-xs text-muted-foreground">{d.totalCards ?? 0} thẻ</p>
                  </div>
                  <Waves className="h-4 w-4 shrink-0 text-primary" />
                </button>
              ))}
            </div>
          )
        ) : cardsQuery.isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : cards.length < 1 ? (
          <EmptyState
            icon={<Layers className="h-6 w-6" />}
            title="Bộ thẻ chưa có thẻ nào"
            description="Thêm thẻ cho bộ này rồi quay lại chơi."
          />
        ) : (
          <KanaSharkGame cards={cards} deckTitle={selectedDeck?.title ?? "Bộ thẻ"} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default KanaShark;
