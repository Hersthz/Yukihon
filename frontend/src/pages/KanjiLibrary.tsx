import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Brush, CheckCircle2, Layers, Search, Sparkles } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const formatRelativeReview = (value?: string) => {
  if (!value) return "Review ngay";
  const diffDays = Math.ceil((new Date(value).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Đến hạn hôm nay";
  if (diffDays === 1) return "Đến hạn ngày mai";
  return `${diffDays} ngày nữa`;
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
  const { dueToday, masteredCount, deck, recordMap, addToSrs, removeFromSrs, review } = useKanjiSrs(kanjiCatalog);

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

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1460px]">
        <PageHeader
          eyebrow="Kanji"
          icon={<BookOpen className="h-6 w-6 text-sky-600" />}
          title="Kanji system"
          description="Thư viện kanji, detail page, writing practice và SRS riêng đã nằm chung trong một flow học liền mạch."
        />

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <MetricCard hint="Toàn bộ catalog hiện có" icon={<Layers className="h-4 w-4 text-sky-500" />} label="Kanji" value={kanjiCatalog.length} />
          <MetricCard hint="Số kanji hợp bộ lọc" icon={<Search className="h-4 w-4 text-violet-500" />} label="Hiển thị" value={filteredKanji.length} />
          <MetricCard hint="Cần review trong deck riêng" icon={<Sparkles className="h-4 w-4 text-amber-500" />} label="Due today" value={dueToday.length} />
          <MetricCard hint="Kanji đã vào SRS" icon={<Brush className="h-4 w-4 text-emerald-500" />} label="Trong deck" value={`${deck.length} / ${masteredCount} mastered`} />
        </div>

        <PageSection className="mb-4" title="Tìm kiếm và lọc" description="Lọc theo JLPT, meaning, reading, radical, tag hoặc từ ví dụ.">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-11 rounded-2xl border-border bg-card pl-11 text-foreground placeholder:text-muted-foreground"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm kanji, meaning, reading, bộ thủ hoặc ví dụ"
                value={searchQuery}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                  selectedLevel === "all" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setSelectedLevel("all")}
                type="button"
              >
                All
              </button>
              {KANJI_LEVELS.map((level) => (
                <button
                  key={level}
                  className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                    selectedLevel === level ? levelTone[level] : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setSelectedLevel(level)}
                  type="button"
                >
                  {level} <span className="ml-1 text-xs opacity-70">{levelCounts[level]}</span>
                </button>
              ))}
              <button
                className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                  showDueOnly ? "border-amber-200 bg-amber-50 text-amber-700" : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setShowDueOnly((value) => !value)}
                type="button"
              >
                Due only
              </button>
            </div>
          </div>
        </PageSection>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <PageSection title="Kanji library" description="Mỗi ô mở detail page với cách đọc, ví dụ, writing practice và thao tác SRS.">
            {filteredKanji.length === 0 ? (
              <EmptyState title="Không tìm thấy kanji" description="Thử đổi level, bỏ Due only hoặc dùng từ khóa khác." icon={<BookOpen className="h-6 w-6" />} />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                {filteredKanji.map((kanji) => {
                  const srsRecord = recordMap.get(kanji.character);
                  const inDeck = Boolean(srsRecord);

                  return (
                    <div key={kanji.character} className="rounded-[22px] border border-white bg-card p-3 shadow-[0_10px_24px_rgba(148,163,184,0.10)]">
                      <Link to={`/kanji-library/${encodeURIComponent(kanji.character)}`} className="block rounded-[18px] p-2 transition hover:bg-sky-50/60">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-4xl font-semibold text-foreground">{kanji.character}</p>
                          <Badge className={`rounded-full border ${levelTone[kanji.jlptLevel] || "border-border bg-muted text-muted-foreground"}`}>{kanji.jlptLevel}</Badge>
                        </div>
                        <p className="mt-2 text-sm font-medium text-foreground">{kanji.meaning}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {kanji.strokeCount} nét • bộ {kanji.radical}
                        </p>
                        <p className="mt-2 truncate text-xs text-sky-700">{kanji.exampleWords.join(" / ")}</p>
                      </Link>

                      <div className="mt-3 flex gap-2">
                        <Button asChild className="flex-1 rounded-2xl" size="sm" variant="outline">
                          <Link to={`/kanji-library/${encodeURIComponent(kanji.character)}`}>Chi tiết</Link>
                        </Button>
                        <Button
                          className={`flex-1 rounded-2xl ${inDeck ? "border-border bg-card text-foreground/80 hover:bg-muted" : "bg-sky-500 text-white hover:bg-sky-400"}`}
                          onClick={() => (inDeck ? removeFromSrs(kanji.character) : addToSrs(kanji.character))}
                          size="sm"
                          variant={inDeck ? "outline" : "default"}
                        >
                          {inDeck ? "Remove" : "Add SRS"}
                        </Button>
                      </div>
                      {srsRecord && <p className="mt-2 text-center text-[11px] text-muted-foreground">{formatRelativeReview(srsRecord.nextReviewAt)}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </PageSection>

          <div className="space-y-4">
            <PageSection title="Next review" description="Ôn nhanh kanji đến hạn hoặc kanji gần nhất trong deck.">
              {!nextReviewItem ? (
                <EmptyState title="Deck kanji đang trống" description="Thêm một kanji vào SRS từ library hoặc detail page để bắt đầu review." icon={<Sparkles className="h-6 w-6" />} />
              ) : (
                <div className="rounded-[22px] border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-6xl font-semibold text-foreground">{nextReviewItem.character}</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{nextReviewItem.meaning}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatRelativeReview(nextReviewItem.srs.nextReviewAt)}</p>
                    </div>
                    <Badge className={`rounded-full border ${levelTone[nextReviewItem.jlptLevel]}`}>{nextReviewItem.jlptLevel}</Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {REVIEW_RATINGS.map((rating) => (
                      <Button key={rating} className={`rounded-xl ${ratingTone[rating]}`} onClick={() => review(nextReviewItem.character, rating)} size="sm">
                        {rating}
                      </Button>
                    ))}
                  </div>

                  <Button asChild className="mt-3 w-full rounded-2xl" variant="outline">
                    <Link to={`/kanji-library/${encodeURIComponent(nextReviewItem.character)}`}>Mở detail</Link>
                  </Button>
                </div>
              )}
            </PageSection>

            <PageSection title="Deck overview" description="Tình trạng ôn tập theo SRS cục bộ của bạn.">
              {deck.length === 0 ? (
                <div className="rounded-[20px] border border-border bg-card p-4 text-sm text-muted-foreground">Chưa có kanji nào trong deck.</div>
              ) : (
                <div className="space-y-3">
                  {deck.slice(0, 6).map((item) => (
                    <Link
                      key={item.character}
                      to={`/kanji-library/${encodeURIComponent(item.character)}`}
                      className="flex items-center justify-between gap-3 rounded-[20px] border border-border bg-card p-4 transition hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-2xl font-semibold text-foreground">{item.character}</div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.meaning}</p>
                          <p className="text-xs text-muted-foreground">{formatRelativeReview(item.srs.nextReviewAt)}</p>
                        </div>
                      </div>
                      {item.srs.repetitionCount >= 5 || item.srs.intervalDays >= 21 ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : null}
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
