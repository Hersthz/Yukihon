import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Settings } from "lucide-react";

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

  const [form, setForm] = useState<AnkiSrsSetting>({});
  useEffect(() => {
    if (settingsQuery.data) setForm(settingsQuery.data);
  }, [settingsQuery.data]);

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
        )}
      </div>
    </DashboardLayout>
  );
};

export default DeckSettingsPage;
