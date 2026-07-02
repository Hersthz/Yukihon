import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Send, Trash2 } from "lucide-react";

import { dictionaryApi, type DictContribution } from "@/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/** Community meanings/examples for a headword, with voting + a submit form (Mazii-style). */
const WordContributions = ({ headword }: { headword: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const key = ["dictionary", "contributions", headword];

  const [type, setType] = useState<"MEANING" | "EXAMPLE">("MEANING");
  const [content, setContent] = useState("");
  const [translation, setTranslation] = useState("");

  const listQuery = useQuery({
    queryKey: key,
    queryFn: () => dictionaryApi.getContributions(headword),
    enabled: headword.length > 0,
  });
  const items = listQuery.data ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });

  const addMutation = useMutation({
    mutationFn: () =>
      dictionaryApi.addContribution({
        headword,
        type,
        content: content.trim(),
        translation: type === "EXAMPLE" && translation.trim() ? translation.trim() : undefined,
      }),
    onSuccess: () => {
      setContent("");
      setTranslation("");
      void invalidate();
      toast({ title: "Đã gửi đóng góp", description: "Cảm ơn bạn đã đóng góp cho từ điển!" });
    },
    onError: (e: unknown) =>
      toast({
        title: "Gửi thất bại",
        description: e instanceof Error ? e.message : "Lỗi",
        variant: "destructive",
      }),
  });

  const voteMutation = useMutation({
    mutationFn: ({ id, value }: { id: number; value: number }) =>
      dictionaryApi.voteContribution(id, value),
    onSuccess: () => void invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => dictionaryApi.deleteContribution(id),
    onSuccess: () => void invalidate(),
  });

  const vote = (c: DictContribution, dir: number) =>
    voteMutation.mutate({ id: c.id!, value: c.myVote === dir ? 0 : dir });

  return (
    <div className="rounded-[20px] border border-border bg-card p-4">
      <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Ý kiến đóng góp ({items.length})
      </p>

      {items.length > 0 && (
        <ul className="mb-4 space-y-3">
          {items.map((c) => (
            <li key={c.id} className="flex gap-3">
              <div className="flex flex-col items-center gap-0.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => vote(c, 1)}
                  className={`rounded p-0.5 transition hover:bg-muted ${
                    c.myVote === 1 ? "text-emerald-600" : "text-muted-foreground"
                  }`}
                  aria-label="Hữu ích"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold text-foreground">
                  {(c.upvotes ?? 0) - (c.downvotes ?? 0)}
                </span>
                <button
                  type="button"
                  onClick={() => vote(c, -1)}
                  className={`rounded p-0.5 transition hover:bg-muted ${
                    c.myVote === -1 ? "text-rose-600" : "text-muted-foreground"
                  }`}
                  aria-label="Không hữu ích"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                {c.type === "EXAMPLE" && (
                  <span className="mb-1 inline-block rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700">
                    Ví dụ
                  </span>
                )}
                <p className="text-sm text-foreground">{c.content}</p>
                {c.translation && <p className="mt-0.5 text-sm text-sky-700">{c.translation}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.userDisplayName || "Ẩn danh"}
                </p>
              </div>

              {c.mine && (
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(c.id!)}
                  className="h-fit rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-rose-600"
                  aria-label="Xoá"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Submit form */}
      <div className="space-y-2 border-t border-border pt-3">
        <div className="flex gap-1.5">
          {(["MEANING", "EXAMPLE"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                type === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {t === "MEANING" ? "Nghĩa" : "Ví dụ"}
            </button>
          ))}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={type === "MEANING" ? "Thêm một nghĩa…" : "Thêm câu ví dụ (tiếng Nhật)…"}
          rows={2}
          className="w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40"
        />
        {type === "EXAMPLE" && (
          <input
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            placeholder="Nghĩa tiếng Việt của câu (tuỳ chọn)"
            className="w-full rounded-xl border border-border bg-background p-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40"
          />
        )}
        <div className="flex justify-end">
          <Button
            size="sm"
            className="rounded-xl"
            disabled={!content.trim() || addMutation.isPending}
            onClick={() => addMutation.mutate()}
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            Gửi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WordContributions;
