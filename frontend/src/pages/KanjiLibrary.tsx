import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Flame,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { KANJI_LEVELS, kanjiCatalog, type KanjiEntry } from "@/data/kanji";
import { useKanjiSrs } from "@/hooks/learning/useKanjiSrs";
import type { KanjiReviewRating } from "@/lib/kanjiSrs";

const REVIEW_RATINGS: KanjiReviewRating[] = ["AGAIN", "HARD", "GOOD", "EASY"];

const levelTone: Record<string, string> = {
  N5: "border-emerald-200 bg-emerald-50 text-emerald-700",
  N4: "border-sky-200 bg-sky-50 text-sky-700",
  N3: "border-violet-200 bg-violet-50 text-violet-700",
  N2: "border-amber-200 bg-amber-50 text-amber-700",
  N1: "border-rose-200 bg-rose-50 text-rose-700",
};

const ratingTone: Record<KanjiReviewRating, string> = {
  AGAIN: "bg-rose-500 text-white hover:bg-rose-400",
  HARD: "bg-amber-500 text-white hover:bg-amber-400",
  GOOD: "bg-sky-500 text-white hover:bg-sky-400",
  EASY: "bg-emerald-500 text-white hover:bg-emerald-400",
};

const ratingLabel: Record<KanjiReviewRating, string> = {
  AGAIN: "Lại",
  HARD: "Khó",
  GOOD: "Tốt",
  EASY: "Dễ",
};

const retentionChartConfig = {
  reviewCount: {
    label: "Lượt ôn",
    color: "#38bdf8",
  },
  retentionRate: {
    label: "Tỷ lệ nhớ %",
    color: "#10b981",
  },
} satisfies ChartConfig;

const formatRelativeReview = (value?: string) => {
  if (!value) return "Ôn ngay";
  const diffDays = Math.ceil((new Date(value).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Đến hạn hôm nay";
  if (diffDays === 1) return "Đến hạn ngày mai";
  return `Còn ${diffDays} ngày`;
};

const toShortDate = (isoDate: string) => {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  return `${parts[1]}/${parts[2]}`;
};

const getSearchText = (item: KanjiEntry) =>
  [
    item.character,
    item.meaning,
    item.radical,
    item.radicalMeaning,
    item.jlptLevel,
    ...item.tags,
    ...item.onReadings,
    ...item.kunReadings,
    ...item.exampleWords,
  ]
    .join(" ")
    .toLowerCase();

const KanjiLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [showDueOnly, setShowDueOnly] = useState(false);
  const { dueToday, masteredCount, dashboard, deck, recordMap, addToSrs, removeFromSrs, review } =
    useKanjiSrs(kanjiCatalog);

  const levelCounts = useMemo(() => {
    return KANJI_LEVELS.reduce<Record<string, number>>((acc, level) => {
      acc[level] = kanjiCatalog.filter((item) => item.jlptLevel === level).length;
      return acc;
    }, {});
  }, []);

  const filteredKanji = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    const dueSet = new Set(dueToday.map((item) => item.character));

    return kanjiCatalog.filter((item) => {
      if (selectedLevel !== "all" && item.jlptLevel !== selectedLevel) return false;
      if (showDueOnly && !dueSet.has(item.character)) return false;
      if (!normalized) return true;
      return getSearchText(item).includes(normalized);
    });
  }, [dueToday, searchQuery, selectedLevel, showDueOnly]);

  const nextReviewItem = deck[0];
  const weakKanjiCatalog = useMemo(
    () =>
      dashboard.weakKanji.map((weakItem) => ({
        ...weakItem,
        catalog: kanjiCatalog.find((item) => item.character === weakItem.character),
      })),
    [dashboard.weakKanji]
  );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1460px]">
        <PageHeader
          eyebrow="Kanji"
          icon={<BookOpen className="h-6 w-6 text-sky-600" />}
          title="Hệ thống Kanji"
          description="Thư viện, trang chi tiết, luyện viết và SRS từ backend giờ nằm chung trong một luồng học."
        />

        <StatStrip
          className="mb-4"
          items={[
            { label: "kanji", value: kanjiCatalog.length },
            { label: "đang hiện", value: filteredKanji.length },
            { label: "đến hạn hôm nay", value: dashboard.dueTodayCount || dueToday.length },
            {
              label: "bộ thẻ",
              value: `${dashboard.deckCount || deck.length} / ${dashboard.masteredCount || masteredCount} đã thuộc`,
            },
          ]}
        />

        <PageSection
          className="mb-4"
          title="Bảng điều khiển SRS Kanji"
          description="Theo dõi thẻ đến hạn, mức độ thuộc, kanji yếu, chuỗi ôn tập và tỷ lệ nhớ từ dữ liệu SRS của backend."
        >
          <div className="grid gap-3 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-background/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Quá hạn</p>
                <AlertTriangle className="h-4 w-4 text-rose-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {dashboard.overdueCount}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Thẻ cần xử lý ngay</p>
            </div>
            <div className="rounded-lg border border-border bg-background/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Đã thuộc</p>
                <Target className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {dashboard.masteredCount}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {dashboard.learningCount} thẻ đang học
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Chuỗi ôn tập</p>
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {dashboard.reviewStreakDays} ngày
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Đã ghi nhận {dashboard.totalReviews} lượt ôn gần đây
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Tỷ lệ nhớ</p>
                <BarChart3 className="h-4 w-4 text-sky-500" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {dashboard.retentionRate.toFixed(1)}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {dashboard.weakCount} thẻ được đánh dấu yếu
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-lg border border-border bg-background/60 p-4">
              <div className="mb-3">
                <p className="text-sm font-semibold text-foreground">Xu hướng tỷ lệ nhớ</p>
                <p className="text-xs text-muted-foreground">
                  Các lượt ôn không bị chọn Lại trong 14 ngày qua.
                </p>
              </div>
              <ChartContainer config={retentionChartConfig} className="h-[280px] w-full">
                <ComposedChart
                  data={dashboard.retentionTrend}
                  margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={20}
                    tickFormatter={(value: string) => toShortDate(value)}
                  />
                  <YAxis
                    yAxisId="count"
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={40}
                  />
                  <YAxis
                    yAxisId="percent"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    yAxisId="count"
                    dataKey="reviewCount"
                    fill="var(--color-reviewCount)"
                    barSize={18}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="percent"
                    type="monotone"
                    dataKey="retentionRate"
                    stroke="var(--color-retentionRate)"
                    strokeWidth={3}
                    dot={false}
                  />
                </ComposedChart>
              </ChartContainer>
            </div>

            <div className="rounded-lg border border-border bg-background/60 p-4">
              <div className="mb-3">
                <p className="text-sm font-semibold text-foreground">Kanji yếu</p>
                <p className="text-xs text-muted-foreground">
                  Ưu tiên theo ease thấp, interval ngắn hoặc lặp lại chưa ổn định.
                </p>
              </div>
              {weakKanjiCatalog.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Chưa có kanji yếu nào. Hãy ôn thêm thẻ và danh sách này sẽ tự cập nhật.
                </div>
              ) : (
                <div className="space-y-2">
                  {weakKanjiCatalog.map((item) => (
                    <Link
                      key={item.character}
                      to={`/kanji-library/${encodeURIComponent(item.character)}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 transition hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 text-2xl font-semibold text-foreground">
                          {item.character}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {item.catalog?.meaning || item.reason}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ease {item.easeFactor.toFixed(2)} | {item.reviewCount} lượt ôn
                          </p>
                        </div>
                      </div>
                      <Badge className="rounded-full border border-rose-200 bg-rose-50 text-rose-700">
                        {item.reason}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </PageSection>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 rounded-xl border-border bg-card pl-10 text-foreground placeholder:text-muted-foreground"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm kanji, nghĩa, cách đọc, bộ thủ hoặc ví dụ"
              value={searchQuery}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                selectedLevel === "all"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
              onClick={() => setSelectedLevel("all")}
              type="button"
            >
              Tất cả
            </button>
            {KANJI_LEVELS.map((level) => (
              <button
                key={level}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  selectedLevel === level
                    ? levelTone[level]
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setSelectedLevel(level)}
                type="button"
              >
                {level} <span className="ml-1 opacity-70">{levelCounts[level]}</span>
              </button>
            ))}
            <button
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                showDueOnly
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
              onClick={() => setShowDueOnly((value) => !value)}
              type="button"
            >
              Chỉ đến hạn
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <PageSection
            title="Thư viện Kanji"
            description="Mỗi thẻ mở trang chi tiết với cách đọc, ví dụ, luyện viết và các thao tác SRS."
          >
            {filteredKanji.length === 0 ? (
              <EmptyState
                title="Không tìm thấy kanji"
                description="Thử đổi cấp độ, tắt Chỉ đến hạn, hoặc dùng từ khóa khác."
                icon={<BookOpen className="h-6 w-6" />}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                {filteredKanji.map((kanji) => {
                  const srsRecord = recordMap.get(kanji.character);
                  const inDeck = Boolean(srsRecord);

                  return (
                    <div
                      key={kanji.character}
                      className="rounded-[22px] border border-white bg-card p-3 shadow-[0_10px_24px_rgba(148,163,184,0.10)]"
                    >
                      <Link
                        to={`/kanji-library/${encodeURIComponent(kanji.character)}`}
                        className="block rounded-[18px] p-2 transition hover:bg-sky-50/60"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-4xl font-semibold text-foreground">
                            {kanji.character}
                          </p>
                          <Badge
                            className={`rounded-full border ${levelTone[kanji.jlptLevel] || "border-border bg-muted text-muted-foreground"}`}
                          >
                            {kanji.jlptLevel}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm font-medium text-foreground">{kanji.meaning}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {kanji.strokeCount} nét | bộ thủ {kanji.radical}
                        </p>
                        <p className="mt-2 truncate text-xs text-sky-700">
                          {kanji.exampleWords.join(" / ")}
                        </p>
                      </Link>

                      <div className="mt-3 flex gap-2">
                        <Button asChild className="flex-1 rounded-2xl" size="sm" variant="outline">
                          <Link to={`/kanji-library/${encodeURIComponent(kanji.character)}`}>
                            Chi tiết
                          </Link>
                        </Button>
                        <Button
                          className={`flex-1 rounded-2xl ${inDeck ? "border-border bg-card text-foreground/80 hover:bg-muted" : "bg-sky-500 text-white hover:bg-sky-400"}`}
                          onClick={() =>
                            inDeck ? removeFromSrs(kanji.character) : addToSrs(kanji.character)
                          }
                          size="sm"
                          variant={inDeck ? "outline" : "default"}
                        >
                          {inDeck ? "Xóa" : "Thêm SRS"}
                        </Button>
                      </div>
                      {srsRecord && (
                        <p className="mt-2 text-center text-[11px] text-muted-foreground">
                          {formatRelativeReview(srsRecord.nextReviewAt)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </PageSection>

          <div className="space-y-4">
            <PageSection
              title="Lần ôn kế"
              description="Ôn kanji đến hạn kế tiếp hoặc thẻ gần nhất trong bộ của bạn."
            >
              {!nextReviewItem ? (
                <EmptyState
                  title="Bộ Kanji đang trống"
                  description="Thêm một kanji từ thư viện hoặc trang chi tiết để bắt đầu ôn."
                  icon={<Sparkles className="h-6 w-6" />}
                />
              ) : (
                <div className="rounded-[22px] border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-6xl font-semibold text-foreground">
                        {nextReviewItem.character}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {nextReviewItem.meaning}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatRelativeReview(nextReviewItem.srs.nextReviewAt)}
                      </p>
                    </div>
                    <Badge className={`rounded-full border ${levelTone[nextReviewItem.jlptLevel]}`}>
                      {nextReviewItem.jlptLevel}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {REVIEW_RATINGS.map((rating) => (
                      <Button
                        key={rating}
                        className={`rounded-xl ${ratingTone[rating]}`}
                        onClick={() => review(nextReviewItem.character, rating)}
                        size="sm"
                      >
                        {ratingLabel[rating]}
                      </Button>
                    ))}
                  </div>

                  <Button asChild className="mt-3 w-full rounded-2xl" variant="outline">
                    <Link to={`/kanji-library/${encodeURIComponent(nextReviewItem.character)}`}>
                      Mở chi tiết
                    </Link>
                  </Button>
                </div>
              )}
            </PageSection>

            <PageSection
              title="Tổng quan bộ thẻ"
              description="Trạng thái ôn tập hiện tại từ bộ SRS Kanji của bạn."
            >
              {deck.length === 0 ? (
                <div className="rounded-[20px] border border-border bg-card p-4 text-sm text-muted-foreground">
                  Chưa có kanji nào trong bộ thẻ của bạn.
                </div>
              ) : (
                <div className="space-y-3">
                  {deck.slice(0, 6).map((item) => (
                    <Link
                      key={item.character}
                      to={`/kanji-library/${encodeURIComponent(item.character)}`}
                      className="flex items-center justify-between gap-3 rounded-[20px] border border-border bg-card p-4 transition hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-2xl font-semibold text-foreground">
                          {item.character}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.meaning}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeReview(item.srs.nextReviewAt)}
                          </p>
                        </div>
                      </div>
                      {item.srs.repetitionCount >= 5 || item.srs.intervalDays >= 21 ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : null}
                    </Link>
                  ))}
                </div>
              )}
            </PageSection>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KanjiLibrary;
