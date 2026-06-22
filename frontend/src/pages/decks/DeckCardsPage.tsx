import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, Play, Loader2, Layers } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { deckApi } from "@/api/deckApi";

const DeckCardsPage = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const id = Number(deckId);

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [hint, setHint] = useState("");

  const deck = useQuery({
    queryKey: ["deck", id],
    queryFn: () => deckApi.get(id),
    enabled: Number.isFinite(id),
  });
  const cards = useQuery({
    queryKey: ["deck", id, "cards"],
    queryFn: () => deckApi.listCards(id),
    enabled: Number.isFinite(id),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["deck", id, "cards"] });
    void queryClient.invalidateQueries({ queryKey: ["deck", id] });
    void queryClient.invalidateQueries({ queryKey: ["decks", "mine"] });
  };

  const addMutation = useMutation({
    mutationFn: () =>
      deckApi.addCard(id, {
        front: front.trim(),
        back: back.trim(),
        hint: hint.trim() || undefined,
      }),
    onSuccess: () => {
      setFront("");
      setBack("");
      setHint("");
      invalidate();
    },
    onError: (e: unknown) =>
      toast({
        title: "Thêm thẻ thất bại",
        description: e instanceof Error ? e.message : "Lỗi",
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (flashcardId: number) => deckApi.deleteCard(id, flashcardId),
    onSuccess: invalidate,
    onError: (e: unknown) =>
      toast({
        title: "Xoá thất bại",
        description: e instanceof Error ? e.message : "Lỗi",
        variant: "destructive",
      }),
  });

  const list = cards.data ?? [];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/decks")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Thư viện
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(`/decks/${id}/study`)}
            disabled={list.length === 0}
          >
            <Play className="mr-1 h-4 w-4" /> Học
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#d4efff]">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{deck.data?.title ?? "Deck"}</h1>
            <p className="text-sm text-muted-foreground">{list.length} thẻ</p>
          </div>
        </div>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-base">Thêm thẻ mới</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <Input
                placeholder="Mặt trước (vd 学校)"
                value={front}
                onChange={(e) => setFront(e.target.value)}
              />
              <Input
                placeholder="Mặt sau (vd trường học)"
                value={back}
                onChange={(e) => setBack(e.target.value)}
              />
              <Input
                placeholder="Gợi ý (vd がっこう)"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
              />
              <Button
                onClick={() => addMutation.mutate()}
                disabled={!front.trim() || !back.trim() || addMutation.isPending}
              >
                {addMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Mặt trước</TableHead>
                  <TableHead>Mặt sau</TableHead>
                  <TableHead>Gợi ý</TableHead>
                  <TableHead className="w-16 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      Chưa có thẻ. Thêm thẻ đầu tiên ở trên.
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((c, i) => (
                    <TableRow key={c.flashcardId}>
                      <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{c.front}</TableCell>
                      <TableCell>{c.back}</TableCell>
                      <TableCell className="text-muted-foreground">{c.hint}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(c.flashcardId)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DeckCardsPage;
