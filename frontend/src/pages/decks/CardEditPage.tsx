import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, GripVertical, Loader2, Plus, Save, Trash2 } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, PageSection } from "@/components/layout/UserPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { deckApi, type CardBlockInput } from "@/api/deckApi";

type Side = "FRONT" | "BACK" | "HINT";
interface Block {
  uid: number;
  label: string;
  contentType: string;
  contentValue: string;
}

const SIDES: { key: Side; label: string }[] = [
  { key: "FRONT", label: "Mặt trước" },
  { key: "BACK", label: "Mặt sau" },
  { key: "HINT", label: "Gợi ý" },
];
const TYPES: [string, string][] = [
  ["TEXT", "Chữ"],
  ["IMAGE", "Ảnh (URL)"],
  ["AUDIO", "Âm thanh (URL)"],
  ["VIDEO", "Video (URL)"],
  ["CLOZE", "Điền khuyết"],
];
const isSide = (s?: string): s is Side => s === "FRONT" || s === "BACK" || s === "HINT";

const CardEditPage = () => {
  const { deckId, flashcardId } = useParams();
  const id = Number(deckId);
  const fcId = Number(flashcardId);
  const navigate = useNavigate();
  const { toast } = useToast();

  const uidRef = useRef(1);
  const dragRef = useRef<{ side: Side; index: number } | null>(null);
  const [bySide, setBySide] = useState<Record<Side, Block[]>>({ FRONT: [], BACK: [], HINT: [] });

  const detailQuery = useQuery({
    queryKey: ["deck", id, "card", fcId],
    queryFn: () => deckApi.getCardDetail(id, fcId),
    enabled: Number.isFinite(id) && Number.isFinite(fcId),
  });

  useEffect(() => {
    if (!detailQuery.data) return;
    const next: Record<Side, Block[]> = { FRONT: [], BACK: [], HINT: [] };
    for (const s of detailQuery.data.sides ?? []) {
      if (!isSide(s.side)) continue;
      for (const c of s.contents ?? []) {
        next[s.side].push({
          uid: uidRef.current++,
          label: c.label ?? "",
          contentType: c.contentType ?? "TEXT",
          contentValue: c.contentValue ?? "",
        });
      }
    }
    setBySide(next);
  }, [detailQuery.data]);

  const addBlock = (side: Side) =>
    setBySide((p) => ({
      ...p,
      [side]: [
        ...p[side],
        { uid: uidRef.current++, label: "", contentType: "TEXT", contentValue: "" },
      ],
    }));
  const removeBlock = (side: Side, uid: number) =>
    setBySide((p) => ({ ...p, [side]: p[side].filter((b) => b.uid !== uid) }));
  const patchBlock = (side: Side, uid: number, patch: Partial<Block>) =>
    setBySide((p) => ({
      ...p,
      [side]: p[side].map((b) => (b.uid === uid ? { ...b, ...patch } : b)),
    }));
  const reorder = (side: Side, from: number, to: number) =>
    setBySide((p) => {
      if (from === to) return p;
      const arr = [...p[side]];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return { ...p, [side]: arr };
    });

  const saveMutation = useMutation({
    mutationFn: () => {
      const blocks: CardBlockInput[] = SIDES.flatMap(({ key }) =>
        bySide[key]
          .filter((b) => b.contentValue.trim())
          .map((b) => ({
            side: key,
            label: b.label.trim() || undefined,
            contentType: b.contentType,
            contentValue: b.contentValue.trim(),
          }))
      );
      return deckApi.saveCardSides(id, fcId, blocks);
    },
    onSuccess: () => {
      toast({ title: "Đã lưu thẻ" });
      navigate(`/decks/${id}/cards`);
    },
    onError: (e: unknown) =>
      toast({
        title: "Lưu thất bại",
        description: e instanceof Error ? e.message : "Lỗi",
        variant: "destructive",
      }),
  });

  const hasFront = bySide.FRONT.some((b) => b.contentValue.trim());
  const hasBack = bySide.BACK.some((b) => b.contentValue.trim());

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-2"
          onClick={() => navigate(`/decks/${id}/cards`)}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Thẻ trong bộ
        </Button>

        <PageHeader
          icon={<GripVertical className="h-5 w-5 text-primary" />}
          eyebrow="Sửa thẻ"
          title="Trình sửa khối"
          description="Thêm, xoá và kéo-thả các khối nội dung cho từng mặt thẻ."
          action={
            <Button
              className="rounded-xl"
              disabled={!hasFront || !hasBack || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-4 w-4" />
              )}
              Lưu
            </Button>
          }
        />

        {detailQuery.isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {SIDES.map(({ key, label }) => (
              <PageSection key={key}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{label}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => addBlock(key)}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Khối
                  </Button>
                </div>

                {bySide[key].length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
                    Chưa có khối nào.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {bySide[key].map((b, i) => (
                      <div
                        key={b.uid}
                        draggable
                        onDragStart={() => (dragRef.current = { side: key, index: i })}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (dragRef.current?.side === key) reorder(key, dragRef.current.index, i);
                          dragRef.current = null;
                        }}
                        className="flex items-start gap-2 rounded-xl border border-border bg-card p-2"
                      >
                        <GripVertical className="mt-2 h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2">
                            <Input
                              className="h-9 flex-1"
                              placeholder="Nhãn (tuỳ chọn)"
                              value={b.label}
                              onChange={(e) => patchBlock(key, b.uid, { label: e.target.value })}
                            />
                            <select
                              value={b.contentType}
                              onChange={(e) =>
                                patchBlock(key, b.uid, { contentType: e.target.value })
                              }
                              className="h-9 w-32 rounded-lg border border-border bg-card px-2 text-sm text-foreground"
                            >
                              {TYPES.map(([v, l]) => (
                                <option key={v} value={v}>
                                  {l}
                                </option>
                              ))}
                            </select>
                          </div>
                          {b.contentType === "TEXT" || b.contentType === "CLOZE" ? (
                            <textarea
                              value={b.contentValue}
                              onChange={(e) =>
                                patchBlock(key, b.uid, { contentValue: e.target.value })
                              }
                              rows={2}
                              placeholder="Nội dung"
                              className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground outline-none focus:border-primary/40"
                            />
                          ) : (
                            <Input
                              className="h-9"
                              placeholder="URL"
                              value={b.contentValue}
                              onChange={(e) =>
                                patchBlock(key, b.uid, { contentValue: e.target.value })
                              }
                            />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-rose-600"
                          onClick={() => removeBlock(key, b.uid)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </PageSection>
            ))}
            {(!hasFront || !hasBack) && (
              <p className="text-center text-xs text-muted-foreground">
                Cần ít nhất một khối có nội dung ở cả Mặt trước và Mặt sau.
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CardEditPage;
