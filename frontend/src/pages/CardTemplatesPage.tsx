import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Loader2, Plus, Trash2 } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { templateApi, type FlashcardTemplate } from "@/api/templateApi";

const SAMPLE: Record<string, string> = {
  front: "学校",
  reading: "がっこう",
  romaji: "gakkou",
  meaning: "trường học",
  onyomi: "コウ",
  kunyomi: "",
  example: "学校に行く。",
  exampleTranslation: "Đi đến trường.",
  note: "Danh từ · N5",
  hint: "がっこう",
};

const fill = (tpl?: string) =>
  (tpl ?? "").replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, k: string) => SAMPLE[k] ?? "");

const blank = {
  id: null as number | null,
  name: "",
  frontTemplate: "",
  backTemplate: "",
  styling: "",
};

const CardTemplatesPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(false);

  const listQuery = useQuery({
    queryKey: ["flashcard-templates"],
    queryFn: () => templateApi.list(),
  });
  const templates = listQuery.data ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["flashcard-templates"] });

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name.trim(),
        cardType: "BASIC",
        frontTemplate: form.frontTemplate,
        backTemplate: form.backTemplate,
        styling: form.styling,
      };
      return form.id ? templateApi.update(form.id, payload) : templateApi.create(payload);
    },
    onSuccess: () => {
      toast({ title: form.id ? "Đã lưu mẫu" : "Đã tạo mẫu" });
      setEditing(false);
      setForm(blank);
      void invalidate();
    },
    onError: (e: unknown) =>
      toast({
        title: "Lưu thất bại",
        description: e instanceof Error ? e.message : "Lỗi",
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => templateApi.delete(id),
    onSuccess: () => void invalidate(),
  });

  const startNew = () => {
    setForm({
      ...blank,
      frontTemplate: '<div class="c-front">{{front}}<div class="c-reading">{{reading}}</div></div>',
      backTemplate:
        '<div class="c-back"><div class="c-meaning">{{meaning}}</div><div class="c-ex">{{example}}</div></div>',
      styling:
        ".c-front{text-align:center;font-size:2rem;font-weight:700}.c-reading{font-size:1rem;color:#0284c7}.c-meaning{text-align:center;font-size:1.4rem;color:#0284c7}.c-ex{text-align:center;margin-top:.5rem;color:#334155}",
    });
    setEditing(true);
  };

  const startEdit = (t: FlashcardTemplate) => {
    setForm({
      id: t.id ?? null,
      name: t.name ?? "",
      frontTemplate: t.frontTemplate ?? "",
      backTemplate: t.backTemplate ?? "",
      styling: t.styling ?? "",
    });
    setEditing(true);
  };

  const previewStyle = useMemo(() => form.styling, [form.styling]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <PageHeader
          icon={<Layers className="h-5 w-5 text-primary" />}
          title="Mẫu thẻ"
          eyebrow="Thư viện"
          description="Tùy biến cách hiển thị mặt trước/sau bằng HTML + CSS, dùng {{field}} để chèn nội dung."
          action={
            !editing ? (
              <Button size="sm" className="rounded-xl" onClick={startNew}>
                <Plus className="mr-1.5 h-4 w-4" />
                Tạo mẫu
              </Button>
            ) : undefined
          }
        />

        {editing ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <PageSection>
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm">Tên mẫu</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Mẫu của tôi"
                  />
                </div>
                {(
                  [
                    ["Mặt trước (HTML)", "frontTemplate"],
                    ["Mặt sau (HTML)", "backTemplate"],
                    ["CSS", "styling"],
                  ] as const
                ).map(([label, key]) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <Label className="text-sm">{label}</Label>
                    <textarea
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      rows={key === "styling" ? 4 : 3}
                      spellCheck={false}
                      className="w-full rounded-xl border border-border bg-background p-2.5 font-mono text-xs text-foreground outline-none focus:border-primary/40"
                    />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Field: {"{{front}} {{reading}} {{meaning}} {{onyomi}} {{kunyomi}} {{example}}"}{" "}
                  {"{{exampleTranslation}} {{note}} {{hint}}"}
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      setEditing(false);
                      setForm(blank);
                    }}
                  >
                    Huỷ
                  </Button>
                  <Button
                    className="rounded-xl"
                    disabled={!form.name.trim() || saveMutation.isPending}
                    onClick={() => saveMutation.mutate()}
                  >
                    Lưu
                  </Button>
                </div>
              </div>
            </PageSection>

            <PageSection title="Xem trước">
              <style>{previewStyle}</style>
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                    Mặt trước
                  </p>
                  <div dangerouslySetInnerHTML={{ __html: fill(form.frontTemplate) }} />
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                    Mặt sau
                  </p>
                  <div dangerouslySetInnerHTML={{ __html: fill(form.backTemplate) }} />
                </div>
              </div>
            </PageSection>
          </div>
        ) : (
          <PageSection>
            {listQuery.isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {templates.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {t.name}
                        </span>
                        {t.isSystem && (
                          <Badge variant="secondary" className="rounded-full text-[10px]">
                            Hệ thống
                          </Badge>
                        )}
                      </div>
                      {t.description && (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {t.description}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg"
                        onClick={() => startEdit(t)}
                      >
                        {t.mine ? "Sửa" : "Xem"}
                      </Button>
                      {t.mine && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-lg text-muted-foreground hover:text-rose-600"
                          onClick={() => t.id && deleteMutation.mutate(t.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PageSection>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CardTemplatesPage;
