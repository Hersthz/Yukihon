import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Settings, Sparkles } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, PageSection } from "@/components/layout/UserPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { deckApi } from "@/api/deckApi";
import { srsApi, type AnkiSrsSetting } from "@/api/srsApi";

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const DeckSettingsPage = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const id = Number(deckId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deckQuery = useQuery({
    queryKey: ["deck", id],
    queryFn: () => deckApi.get(id),
    enabled: !!id,
  });
  const settingsQuery = useQuery({
    queryKey: ["deck", id, "settings"],
    queryFn: () => srsApi.getSettings(id),
    enabled: !!id,
  });
  const algorithmsQuery = useQuery({
    queryKey: ["srs", "algorithms"],
    queryFn: () => srsApi.getAlgorithms(),
  });

  const [form, setForm] = useState<AnkiSrsSetting>({});
  useEffect(() => {
    if (settingsQuery.data) setForm(settingsQuery.data);
  }, [settingsQuery.data]);

  const currentAlgo = (form.algorithmType || "SM2").toUpperCase();
  const availableTypes = new Set(
    (algorithmsQuery.data ?? []).map((a) => (a.algorithmType || "").toUpperCase())
  );

  const switchMutation = useMutation({
    mutationFn: (algorithmType: string) => srsApi.switchAlgorithm(id, algorithmType),
    onSuccess: (data) => {
      setForm(data);
      toast({
        title: "Đã đổi thuật toán",
        description:
          (data.algorithmType || "").toUpperCase() === "FSRS"
            ? "Các thẻ đã được chuyển sang FSRS và giữ nguyên lịch sử ôn."
            : "Đã chuyển về SM-2.",
      });
      void queryClient.invalidateQueries({ queryKey: ["deck", id, "settings"] });
      void queryClient.invalidateQueries({ queryKey: ["deck", id, "stats"] });
    },
    onError: (e: unknown) =>
      toast({
        title: "Đổi thuật toán thất bại",
        description: e instanceof Error ? e.message : "Lỗi",
        variant: "destructive",
      }),
  });

  const saveMutation = useMutation({
    mutationFn: () => srsApi.updateSettings(id, form),
    onSuccess: () => {
      toast({ title: "Đã lưu cài đặt" });
      void queryClient.invalidateQueries({ queryKey: ["deck", id, "settings"] });
    },
    onError: (e: unknown) =>
      toast({
        title: "Lưu thất bại",
        description: e instanceof Error ? e.message : "Lỗi",
        variant: "destructive",
      }),
  });

  const num = (v: string) => (v === "" ? undefined : Number(v));
  const retentionPct = Math.round((form.targetRetention ?? 0.9) * 100);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[760px]">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link to="/decks">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Bộ thẻ
          </Link>
        </Button>

        <PageHeader
          icon={<Settings className="h-5 w-5 text-primary" />}
          eyebrow="Cài đặt SRS"
          title={deckQuery.data?.title || "Cài đặt"}
          description="Điều chỉnh mục tiêu ghi nhớ, giới hạn mỗi ngày và ngưỡng thẻ khó."
          action={
            <Badge variant="secondary" className="rounded-full">
              Thuật toán: {form.algorithmType || "SM2"}
            </Badge>
          }
        />

        {settingsQuery.isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <PageSection className="mb-5">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Thuật toán lập lịch</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    type: "SM2",
                    name: "SM-2 (Anki)",
                    desc: "Cổ điển, ổn định. Khoảng cách ôn dựa trên hệ số dễ (ease).",
                  },
                  {
                    type: "FSRS",
                    name: "FSRS-5",
                    desc: "Hiện đại, tối ưu theo mục tiêu ghi nhớ. Dự đoán trí nhớ chính xác hơn.",
                  },
                ].map((algo) => {
                  const active = currentAlgo === algo.type;
                  const unavailable = availableTypes.size > 0 && !availableTypes.has(algo.type);
                  const switching =
                    switchMutation.isPending && switchMutation.variables === algo.type;
                  if (unavailable && !active) return null;
                  return (
                    <button
                      key={algo.type}
                      type="button"
                      disabled={active || switchMutation.isPending}
                      onClick={() => switchMutation.mutate(algo.type)}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        active
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border hover:border-primary/40 hover:bg-muted/40"
                      } ${switchMutation.isPending && !active ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{algo.name}</span>
                        {active ? (
                          <Badge variant="secondary" className="rounded-full text-xs">
                            Đang dùng
                          </Badge>
                        ) : switching ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">{algo.desc}</p>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Đổi sang FSRS sẽ chuyển toàn bộ thẻ và ước lượng độ ổn định/độ khó từ lịch sử ôn
                hiện tại — không mất tiến độ.
              </p>
            </PageSection>

            <PageSection>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label={`Mục tiêu ghi nhớ: ${retentionPct}%`}
                  hint="Cao hơn = ôn dày hơn, nhớ chắc hơn (70–98%)."
                >
                  <input
                    type="range"
                    min={70}
                    max={98}
                    value={retentionPct}
                    onChange={(e) =>
                      setForm({ ...form, targetRetention: Number(e.target.value) / 100 })
                    }
                    className="accent-primary"
                  />
                </Field>

                <Field label="Thẻ mới mỗi ngày" hint="Số thẻ chưa học được giới thiệu mỗi ngày.">
                  <Input
                    type="number"
                    min={0}
                    value={form.maxItemsPerDay ?? ""}
                    onChange={(e) => setForm({ ...form, maxItemsPerDay: num(e.target.value) })}
                  />
                </Field>

                <Field label="Lượt ôn tối đa mỗi ngày">
                  <Input
                    type="number"
                    min={0}
                    value={form.maxReviewsPerDay ?? ""}
                    onChange={(e) => setForm({ ...form, maxReviewsPerDay: num(e.target.value) })}
                  />
                </Field>

                <Field label="Khoảng cách ôn tối đa (ngày)">
                  <Input
                    type="number"
                    min={1}
                    value={form.maximumIntervalDays ?? ""}
                    onChange={(e) => setForm({ ...form, maximumIntervalDays: num(e.target.value) })}
                  />
                </Field>

                <Field
                  label="Ngưỡng thẻ khó (leech)"
                  hint="Quên quá số lần này sẽ bị đánh dấu thẻ khó."
                >
                  <Input
                    type="number"
                    min={1}
                    value={form.leechThreshold ?? ""}
                    onChange={(e) => setForm({ ...form, leechThreshold: num(e.target.value) })}
                  />
                </Field>

                <Field label="Tự ẩn thẻ khó" hint="Tạm ẩn thẻ leech khỏi hàng ôn.">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, suspendLeeches: !form.suspendLeeches })}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      form.suspendLeeches ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        form.suspendLeeches ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </Field>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  Lưu cài đặt
                </Button>
              </div>
            </PageSection>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DeckSettingsPage;
