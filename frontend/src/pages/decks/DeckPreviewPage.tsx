import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Globe2, Heart, Layers, Loader2, Play, Sparkles } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, PageSection } from "@/components/layout/UserPage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { deckApi } from "@/api/deckApi";

const DeckPreviewPage = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const id = Number(deckId);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
  const favoritesQuery = useQuery({
    queryKey: ["decks", "favorites"],
    queryFn: deckApi.listFavorites,
  });
  const mineQuery = useQuery({ queryKey: ["decks", "mine"], queryFn: deckApi.listMine });

  const deck = deckQuery.data;
  const favorited = useMemo(
    () => (favoritesQuery.data ?? []).some((d) => d.id === id),
    [favoritesQuery.data, id]
  );
  const isOwn = useMemo(
    () => (mineQuery.data ?? []).some((d) => d.id === id),
    [mineQuery.data, id]
  );

  const favoriteMutation = useMutation({
    mutationFn: () => deckApi.toggleFavorite(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["decks", "favorites"] });
      void queryClient.invalidateQueries({ queryKey: ["deck", id] });
    },
  });

  const cloneMutation = useMutation({
    mutationFn: () => deckApi.clone(id),
    onSuccess: (newDeck) => {
      toast({ title: "Đã sao chép vào thư viện của bạn" });
      void queryClient.invalidateQueries({ queryKey: ["decks", "mine"] });
      if (newDeck?.id) navigate(`/decks/${newDeck.id}/cards`);
    },
    onError: (e: unknown) =>
      toast({
        title: "Sao chép thất bại",
        description: e instanceof Error ? e.message : "Lỗi",
        variant: "destructive",
      }),
  });

  const cards = cardsQuery.data ?? [];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1000px]">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link to="/decks/explore">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Khám phá
          </Link>
        </Button>

        <PageHeader
          icon={<Layers className="h-5 w-5 text-primary" />}
          eyebrow="Xem trước bộ thẻ"
          title={deck?.title || "Bộ thẻ"}
          description={deck?.description || undefined}
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => favoriteMutation.mutate()}
                className={cn(favorited && "border-rose-200 text-rose-500")}
              >
                <Heart className={cn("mr-1.5 h-4 w-4", favorited && "fill-current")} />
                {favorited ? "Đã thích" : "Yêu thích"}
              </Button>
              {isOwn ? (
                <Button onClick={() => navigate(`/decks/${id}/study`)}>
                  <Play className="mr-1.5 h-4 w-4" /> Học
                </Button>
              ) : (
                <Button onClick={() => cloneMutation.mutate()} disabled={cloneMutation.isPending}>
                  {cloneMutation.isPending ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="mr-1.5 h-4 w-4" />
                  )}
                  Sao chép
                </Button>
              )}
            </div>
          }
        />

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Globe2 className="h-3 w-3" /> {deck?.visibility}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Layers className="h-3 w-3" /> {deck?.totalCards} thẻ
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Heart className="h-3 w-3" /> {deck?.favoriteCount} thích
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Copy className="h-3 w-3" /> {deck?.cloneCount} lượt sao chép
          </Badge>
        </div>

        <PageSection
          title="Thẻ trong bộ"
          description={`Xem trước ${Math.min(cards.length, 24)} thẻ đầu tiên.`}
        >
          {cardsQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : cards.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              <Sparkles className="mx-auto mb-2 h-6 w-6 text-primary" />
              Bộ thẻ này chưa có thẻ nào.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cards.slice(0, 24).map((card) => (
                <div key={card.flashcardId} className="yukihon-card-flat p-4">
                  <p className="text-lg font-semibold text-foreground">{card.front}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{card.back}</p>
                  {card.hint && (
                    <p className="mt-1 text-xs text-muted-foreground/80">Gợi ý: {card.hint}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </PageSection>
      </div>
    </DashboardLayout>
  );
};

export default DeckPreviewPage;
