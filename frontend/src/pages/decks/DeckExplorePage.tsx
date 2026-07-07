import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Copy,
  Eye,
  Heart,
  Layers,
  Loader2,
  Play,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, PageHeader } from "@/components/layout/UserPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { deckApi, type Deck } from "@/api/deckApi";

const SORTS = [
  { value: "trending", label: "Thịnh hành" },
  { value: "newest", label: "Mới nhất" },
  { value: "cards", label: "Nhiều thẻ nhất" },
];

const ExploreCard = ({
  deck,
  favorited,
  isOwn,
  onPreview,
  onClone,
  onFavorite,
  onStudy,
  cloning,
}: {
  deck: Deck;
  favorited: boolean;
  isOwn: boolean;
  onPreview: (id: number) => void;
  onClone: (id: number) => void;
  onFavorite: (id: number) => void;
  onStudy: (id: number) => void;
  cloning: boolean;
}) => (
  <div className="yukihon-card flex flex-col p-5">
    <div className="mb-3 flex items-start justify-between gap-2">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
        <Layers className="h-5 w-5" />
      </div>
      <button
        type="button"
        onClick={() => onFavorite(deck.id!)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
          favorited
            ? "border-rose-200 bg-rose-50 text-rose-500"
            : "border-border text-muted-foreground hover:text-rose-500"
        )}
        title={favorited ? "Bỏ yêu thích" : "Yêu thích"}
      >
        <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
      </button>
    </div>

    <button type="button" onClick={() => onPreview(deck.id!)} className="text-left">
      <h3 className="line-clamp-1 text-lg font-bold text-foreground hover:text-primary">
        {deck.title}
      </h3>
    </button>
    {deck.description && (
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{deck.description}</p>
    )}

    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <Layers className="h-3.5 w-3.5" /> {deck.totalCards} thẻ
      </span>
      <span className="flex items-center gap-1">
        <Heart className="h-3.5 w-3.5" /> {deck.favoriteCount}
      </span>
      <span className="flex items-center gap-1">
        <Copy className="h-3.5 w-3.5" /> {deck.cloneCount}
      </span>
      <span className="flex items-center gap-1">
        <Eye className="h-3.5 w-3.5" /> {deck.viewCount ?? 0}
      </span>
    </div>

    <div className="mt-4 flex items-center gap-2 border-t border-border/50 pt-3">
      <Button variant="ghost" size="sm" onClick={() => onPreview(deck.id!)}>
        <Eye className="mr-1 h-4 w-4" /> Xem
      </Button>
      {isOwn ? (
        <Button size="sm" className="ml-auto" onClick={() => onStudy(deck.id!)}>
          <Play className="mr-1 h-4 w-4" /> Học
        </Button>
      ) : (
        <Button
          size="sm"
          className="ml-auto"
          variant="outline"
          onClick={() => onClone(deck.id!)}
          disabled={cloning}
        >
          {cloning ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Copy className="mr-1 h-4 w-4" />
          )}
          Sao chép
        </Button>
      )}
    </div>
  </div>
);

const DeckExplorePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<"explore" | "favorites">("explore");
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const [sort, setSort] = useState("trending");

  const publicQuery = useQuery({
    queryKey: ["decks", "public", applied, sort],
    queryFn: () => deckApi.listPublic({ search: applied, sort }),
  });
  const favoritesQuery = useQuery({
    queryKey: ["decks", "favorites"],
    queryFn: deckApi.listFavorites,
  });
  const mineQuery = useQuery({ queryKey: ["decks", "mine"], queryFn: deckApi.listMine });

  const favoritedIds = useMemo(
    () => new Set((favoritesQuery.data ?? []).map((d) => d.id)),
    [favoritesQuery.data]
  );
  const mineIds = useMemo(() => new Set((mineQuery.data ?? []).map((d) => d.id)), [mineQuery.data]);

  const favoriteMutation = useMutation({
    mutationFn: (id: number) => deckApi.toggleFavorite(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["decks", "favorites"] });
      void queryClient.invalidateQueries({ queryKey: ["decks", "public"] });
    },
  });

  const cloneMutation = useMutation({
    mutationFn: (id: number) => deckApi.clone(id),
    onSuccess: () => {
      toast({ title: "Đã sao chép vào thư viện của bạn" });
      void queryClient.invalidateQueries({ queryKey: ["decks", "mine"] });
    },
    onError: (e: unknown) =>
      toast({
        title: "Sao chép thất bại",
        description: e instanceof Error ? e.message : "Lỗi",
        variant: "destructive",
      }),
  });

  const decks = tab === "explore" ? (publicQuery.data ?? []) : (favoritesQuery.data ?? []);
  const loading = tab === "explore" ? publicQuery.isLoading : favoritesQuery.isLoading;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1320px]">
        <PageHeader
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          eyebrow="Cộng đồng"
          title="Khám phá bộ thẻ"
          description="Tìm bộ thẻ công khai, lưu yêu thích và sao chép vào thư viện của bạn."
        />

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full border border-border bg-card p-1">
            {(["explore", "favorites"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                  tab === t
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "explore" ? "Khám phá" : "Yêu thích"}
              </button>
            ))}
          </div>

          {tab === "explore" && (
            <>
              <div className="relative max-w-xs flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setApplied(search.trim())}
                  placeholder="Tìm bộ thẻ…"
                  className="h-9 pl-9"
                />
              </div>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-9 w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : decks.length === 0 ? (
          <EmptyState
            icon={
              tab === "explore" ? <Sparkles className="h-6 w-6" /> : <Heart className="h-6 w-6" />
            }
            title={tab === "explore" ? "Không tìm thấy bộ thẻ" : "Chưa có bộ thẻ yêu thích"}
            description={
              tab === "explore"
                ? "Thử từ khóa khác hoặc đổi cách sắp xếp."
                : "Nhấn ♥ trên một bộ thẻ để lưu vào đây."
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {decks.map((deck) => (
              <ExploreCard
                key={deck.id}
                deck={deck}
                favorited={favoritedIds.has(deck.id)}
                isOwn={mineIds.has(deck.id)}
                onPreview={(id) => navigate(`/decks/${id}/preview`)}
                onStudy={(id) => navigate(`/decks/${id}/study`)}
                onClone={cloneMutation.mutate}
                onFavorite={favoriteMutation.mutate}
                cloning={cloneMutation.isPending && cloneMutation.variables === deck.id}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DeckExplorePage;
