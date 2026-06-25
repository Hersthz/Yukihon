import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookOpen,
  Plus,
  Play,
  Globe2,
  Lock,
  Loader2,
  Layers,
  Pencil,
  BarChart3,
  Settings,
  Copy,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { deckApi, type Deck } from "@/api/deckApi";

const DeckCard = ({
  deck,
  isOwn,
  onStudy,
  onManage,
  onStats,
  onSettings,
  onClone,
  cloning,
}: {
  deck: Deck;
  isOwn: boolean;
  onStudy: (id: number) => void;
  onManage: (id: number) => void;
  onStats: (id: number) => void;
  onSettings: (id: number) => void;
  onClone: (id: number) => void;
  cloning: boolean;
}) => (
  <Card className="flex flex-col border-border/70 transition hover:shadow-md">
    <CardHeader>
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-primary/10 text-primary">
          <Layers className="h-5 w-5" />
        </div>
        <Badge variant="secondary" className="gap-1">
          {deck.visibility === "PUBLIC" ? (
            <Globe2 className="h-3 w-3" />
          ) : (
            <Lock className="h-3 w-3" />
          )}
          {deck.visibility}
        </Badge>
      </div>
      <CardTitle className="mt-2 text-lg">{deck.title}</CardTitle>
      {deck.description && (
        <CardDescription className="line-clamp-2">{deck.description}</CardDescription>
      )}
    </CardHeader>
    <CardContent className="mt-auto flex items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground">{deck.totalCards} thẻ</span>
      {isOwn ? (
        <div className="flex items-center gap-1.5">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Thống kê"
            onClick={() => onStats(deck.id)}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Cài đặt SRS"
            onClick={() => onSettings(deck.id)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onManage(deck.id)}>
            <Pencil className="mr-1 h-4 w-4" /> Quản lý
          </Button>
          <Button size="sm" onClick={() => onStudy(deck.id)} disabled={deck.totalCards === 0}>
            <Play className="mr-1 h-4 w-4" /> Học
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onClone(deck.id)} disabled={cloning}>
            {cloning ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Copy className="mr-1 h-4 w-4" />
            )}
            Sao chép
          </Button>
          <Button size="sm" onClick={() => onStudy(deck.id)} disabled={deck.totalCards === 0}>
            <Play className="mr-1 h-4 w-4" /> Học
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);

const DecksPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const mine = useQuery({ queryKey: ["decks", "mine"], queryFn: deckApi.listMine });
  const publicDecks = useQuery({ queryKey: ["decks", "public"], queryFn: deckApi.listPublic });

  const createMutation = useMutation({
    mutationFn: () =>
      deckApi.create({
        title: title.trim(),
        description: description.trim(),
        visibility: "PRIVATE",
      }),
    onSuccess: () => {
      toast({ title: "Đã tạo deck" });
      setDialogOpen(false);
      setTitle("");
      setDescription("");
      void queryClient.invalidateQueries({ queryKey: ["decks", "mine"] });
    },
    onError: (e: unknown) =>
      toast({
        title: "Tạo thất bại",
        description: e instanceof Error ? e.message : "Lỗi",
        variant: "destructive",
      }),
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

  const study = (id: number) => navigate(`/decks/${id}/study`);
  const manage = (id: number) => navigate(`/decks/${id}/cards`);
  const stats = (id: number) => navigate(`/decks/${id}/stats`);
  const settings = (id: number) => navigate(`/decks/${id}/settings`);

  const mineDecks = mine.data ?? [];
  const otherPublic = (publicDecks.data ?? []).filter((d) => !mineDecks.some((m) => m.id === d.id));

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Thư viện
            </p>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <BookOpen className="h-6 w-6 text-primary" /> Bộ thẻ của tôi
            </h1>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Tạo deck
          </Button>
        </div>

        {mine.isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : mineDecks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              Chưa có deck nào. Bấm “Tạo deck” để bắt đầu.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mineDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                isOwn
                onStudy={study}
                onManage={manage}
                onStats={stats}
                onSettings={settings}
                onClone={cloneMutation.mutate}
                cloning={false}
              />
            ))}
          </div>
        )}

        {otherPublic.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Khám phá (công khai)</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {otherPublic.map((deck) => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  isOwn={false}
                  onStudy={study}
                  onManage={manage}
                  onStats={stats}
                  onSettings={settings}
                  onClone={cloneMutation.mutate}
                  cloning={cloneMutation.isPending && cloneMutation.variables === deck.id}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo deck mới</DialogTitle>
            <DialogDescription>Tạo một bộ thẻ để học theo SRS.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Tiêu đề</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: N5 Động từ"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mô tả</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={createMutation.isPending}
            >
              Huỷ
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!title.trim() || createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Tạo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DecksPage;
