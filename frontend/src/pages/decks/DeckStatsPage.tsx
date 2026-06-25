import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BarChart3, BookOpen, Flame, Layers, Loader2, Sparkles } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Button } from "@/components/ui/button";
import { deckApi } from "@/api/deckApi";
import { srsApi, type AnkiStatsBucket } from "@/api/srsApi";

const BarRow = ({ label, count, max }: { label: string; count: number; max: number }) => (
  <div className="flex items-center gap-3">
    <span className="w-20 shrink-0 text-xs text-muted-foreground">{label}</span>
    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
        style={{ width: max > 0 ? `${Math.round((count / max) * 100)}%` : "0%" }}
      />
    </div>
    <span className="w-8 shrink-0 text-right text-xs font-semibold text-foreground">{count}</span>
  </div>
);

const BarBlock = ({ title, buckets }: { title: string; buckets: AnkiStatsBucket[] }) => {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <PageSection title={title}>
      <div className="space-y-2.5">
        {buckets.map((b) => (
          <BarRow key={b.label} label={b.label} count={b.count} max={max} />
        ))}
      </div>
    </PageSection>
  );
};

const DeckStatsPage = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const id = Number(deckId);

  const deckQuery = useQuery({
    queryKey: ["deck", id],
    queryFn: () => deckApi.get(id),
    enabled: !!id,
  });
  const statsQuery = useQuery({
    queryKey: ["deck", id, "stats"],
    queryFn: () => srsApi.getStats(id),
    enabled: !!id,
  });

  const stats = statsQuery.data;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1280px]">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link to="/decks">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Bộ thẻ
          </Link>
        </Button>

        <PageHeader
          icon={<BarChart3 className="h-5 w-5 text-primary" />}
          eyebrow="Thống kê SRS"
          title={deckQuery.data?.title || "Thống kê"}
          description="Phân bố trạng thái thẻ, dự báo ôn tập và độ khó."
        />

        {statsQuery.isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : !stats ? (
          <EmptyState
            icon={<BarChart3 className="h-6 w-6" />}
            title="Chưa có dữ liệu"
            description="Học vài thẻ để hệ thống bắt đầu thống kê."
          />
        ) : (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Tổng thẻ"
                value={stats.totalCards}
                icon={<Layers className="h-4 w-4" />}
                hint={`${stats.newCards} thẻ mới`}
              />
              <MetricCard
                label="Đang học"
                value={stats.learningCards + stats.relearningCards}
                icon={<BookOpen className="h-4 w-4" />}
                hint={`${stats.reviewCards} thẻ đã thuộc`}
              />
              <MetricCard
                label="Đến hạn hôm nay"
                value={stats.dueToday}
                icon={<Flame className="h-4 w-4" />}
                hint={`Mai: ${stats.dueTomorrow}`}
              />
              <MetricCard
                label="Điểm ghi nhớ TB"
                value={`${stats.avgMemoryScore}`}
                icon={<Sparkles className="h-4 w-4" />}
                hint={`Ease TB ${stats.avgEaseFactor} · ${stats.avgIntervalDays}d`}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
              <BarBlock title="Dự báo ôn tập (14 ngày)" buckets={stats.futureReviews} />
              <PageSection title="Tổng quan">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Thẻ mới", stats.newCards],
                    ["Đang học", stats.learningCards],
                    ["Học lại", stats.relearningCards],
                    ["Đã thuộc", stats.reviewCards],
                    ["Tổng lượt ôn", stats.totalReviews],
                    ["Tổng lần quên", stats.totalLapses],
                    ["Thẻ khó (leech)", stats.leechCards],
                    ["Tạm ẩn", stats.suspendedCards],
                  ].map(([label, value]) => (
                    <div
                      key={label as string}
                      className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2"
                    >
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </PageSection>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <BarBlock title="Phân bố khoảng cách ôn" buckets={stats.intervalBuckets} />
              <BarBlock title="Phân bố độ dễ (ease)" buckets={stats.easeBuckets} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DeckStatsPage;
