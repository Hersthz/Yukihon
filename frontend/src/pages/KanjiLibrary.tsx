import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, BrushCleaning, Search, Sparkles } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KANJI_LEVELS, kanjiCatalog } from "@/data/kanji";
import { useKanjiSrs } from "@/hooks/learning/useKanjiSrs";

const formatRelativeReview = (value?: string) => {
  if (!value) return "Review ngay";
  const diffDays = Math.ceil((new Date(value).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Den han hom nay";
  if (diffDays === 1) return "Den han ngay mai";
  return `${diffDays} ngay nua`;
};

const KanjiLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("N5");
  const { dueToday, masteredCount, deck, recordMap, addToSrs, review } = useKanjiSrs(kanjiCatalog);

  const filteredKanji = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    return kanjiCatalog.filter((item) => {
      const matchesLevel = item.jlptLevel === selectedLevel;
      if (!matchesLevel) return false;
      if (!normalized) return true;
      return (
        item.character.includes(searchQuery) ||
        item.meaning.toLowerCase().includes(normalized) ||
        item.tags.some((tag) => tag.toLowerCase().includes(normalized))
      );
    });
  }, [searchQuery, selectedLevel]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1460px]">
        <PageHeader
          eyebrow="Kanji"
          icon={<BookOpen className="h-6 w-6 text-sky-600" />}
          title="Kanji system"
          description="Thu vien, chi tiet, writing practice va SRS rieng cho kanji da nam chung trong mot flow."
        />

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <MetricCard hint="Cap dang xem" icon={<BookOpen className="h-4 w-4 text-sky-500" />} label="Level" value={selectedLevel} />
          <MetricCard hint="So kanji hop bo loc" icon={<Search className="h-4 w-4 text-violet-500" />} label="Hien thi" value={filteredKanji.length} />
          <MetricCard hint="Can review trong deck rieng" icon={<Sparkles className="h-4 w-4 text-amber-500" />} label="Due today" value={dueToday.length} />
          <MetricCard hint="Kanji da vao SRS" icon={<BrushCleaning className="h-4 w-4 text-emerald-500" />} label="Trong deck" value={`${deck.length} / ${masteredCount} mastered`} />
        </div>

        <PageSection className="mb-4" title="Tim kiem va loc" description="Loc nhanh theo JLPT, meaning va tag de vao detail page nhanh hon.">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-11 rounded-2xl border-border bg-card pl-11 text-foreground placeholder:text-muted-foreground"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tim theo kanji, meaning hoac tag"
                value={searchQuery}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {KANJI_LEVELS.map((level) => (
                <button
                  key={level}
                  className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                    selectedLevel === level ? "border-sky-200 bg-sky-50 text-sky-700" : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setSelectedLevel(level)}
                  type="button"
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </PageSection>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <PageSection title="Kanji library" description="Moi o dan vao detail page de hoc sau hon, khong con dung modal nho nua.">
            {filteredKanji.length === 0 ? (
              <EmptyState title="Khong tim thay kanji" description="Thu doi level hoac tu khoa khac." icon={<BookOpen className="h-6 w-6" />} />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                {filteredKanji.map((kanji) => {
                  const inDeck = recordMap.has(kanji.character);

                  return (
                    <div key={kanji.character} className="rounded-[22px] border border-white bg-card p-3 shadow-[0_10px_24px_rgba(148,163,184,0.10)]">
                      <Link to={`/kanji-library/${encodeURIComponent(kanji.character)}`} className="block rounded-[18px] p-2 transition hover:bg-sky-50/60">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-4xl font-semibold text-foreground">{kanji.character}</p>
                          <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">{kanji.jlptLevel}</Badge>
                        </div>
                        <p className="mt-2 text-sm font-medium text-foreground">{kanji.meaning}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{kanji.strokeCount} net • bo {kanji.radical}</p>
                      </Link>

                      <div className="mt-3 flex gap-2">
                        <Button asChild className="flex-1 rounded-2xl" size="sm" variant="outline">
                          <Link to={`/kanji-library/${encodeURIComponent(kanji.character)}`}>Chi tiet</Link>
                        </Button>
                        <Button className="flex-1 rounded-2xl bg-sky-500 text-white hover:bg-sky-400" onClick={() => addToSrs(kanji.character)} size="sm">
                          {inDeck ? "Trong deck" : "Add SRS"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </PageSection>

          <PageSection title="Kanji review queue" description="Deck rieng danh cho kanji, tach khoi My Words de de tap trung luyen mat chu.">
            {deck.length === 0 ? (
              <EmptyState title="Deck kanji dang trong" description="Them mot kanji vao SRS tu library hoac detail page de bat dau review." icon={<Sparkles className="h-6 w-6" />} />
            ) : (
              <div className="space-y-3">
                {deck.slice(0, 6).map((item) => (
                  <div key={item.character} className="rounded-[20px] border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-3xl font-semibold text-foreground">{item.character}</p>
                        <p className="mt-1 text-sm text-foreground/80">{item.meaning}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatRelativeReview(item.srs.nextReviewAt)}</p>
                      </div>
                      <Badge className="rounded-full border border-border bg-muted text-muted-foreground">{item.jlptLevel}</Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(["AGAIN", "HARD", "GOOD", "EASY"] as const).map((rating) => (
                        <Button
                          key={rating}
                          className={`rounded-xl ${
                            rating === "AGAIN"
                              ? "bg-rose-500 text-white hover:bg-rose-400"
                              : rating === "HARD"
                                ? "bg-amber-500 text-white hover:bg-amber-400"
                                : rating === "GOOD"
                                  ? "bg-sky-500 text-white hover:bg-sky-400"
                                  : "bg-emerald-500 text-white hover:bg-emerald-400"
                          }`}
                          onClick={() => review(item.character, rating)}
                          size="sm"
                        >
                          {rating}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PageSection>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KanjiLibrary;
