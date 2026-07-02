import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen } from "lucide-react";

import { kanjiApi, vocabularyApi, type KanjiInfo } from "@/api";
import KanjiPracticeCanvas from "@/components/kanji/KanjiPracticeCanvas";
import KanjiStrokeOrder from "@/components/kanji/KanjiStrokeOrder";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, PageHeader, PageSection, StatStrip } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getKanjiByCharacter, kanjiCatalog, type KanjiEntry } from "@/data/kanji";
import { useKanjiSrs } from "@/hooks/learning/useKanjiSrs";
import type { KanjiReviewRating } from "@/lib/kanjiSrs";

/** Map a KanjiInfo (kanjiapi.dev) into the page's KanjiEntry; curated-only fields default empty. */
const apiToEntry = (d?: KanjiInfo): KanjiEntry | null =>
  d
    ? {
        character: d.character,
        meaning: d.meaning ?? "",
        onReadings: d.onReadings ?? [],
        kunReadings: d.kunReadings ?? [],
        radical: "",
        radicalMeaning: "",
        strokeCount: d.strokeCount ?? 0,
        jlptLevel: d.jlptLevel ?? "",
        mnemonic: "",
        tags: [],
        exampleWords: [],
      }
    : null;

interface VocabularyItem {
  id: number;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning: string;
  jlptLevel?: string;
}

const REVIEW_RATINGS: KanjiReviewRating[] = ["AGAIN", "HARD", "GOOD", "EASY"];

const ratingTone: Record<KanjiReviewRating, string> = {
  AGAIN: "bg-rose-500 text-white hover:bg-rose-400",
  HARD: "bg-amber-500 text-white hover:bg-amber-400",
  GOOD: "bg-sky-500 text-white hover:bg-sky-400",
  EASY: "bg-emerald-500 text-white hover:bg-emerald-400",
};

const formatReviewDate = (value?: string) => {
  if (!value) return "Chưa vào deck";
  return new Date(value).toLocaleDateString("vi-VN");
};

const KanjiDetail = () => {
  const { character = "" } = useParams();
  const navigate = useNavigate();
  const decodedCharacter = decodeURIComponent(character);
  const staticKanji = getKanjiByCharacter(decodedCharacter);
  const { recordMap, addToSrs, removeFromSrs, review } = useKanjiSrs(kanjiCatalog);

  // Always pull the live kanji API (kanjiapi.dev + KanjiVG, cached) — it provides the stroke-order
  // SVG, frequency and components even for characters already in the curated catalog.
  const kanjiInfoQuery = useQuery({
    queryKey: ["kanji-info", decodedCharacter],
    queryFn: () => kanjiApi.get(decodedCharacter),
    enabled: decodedCharacter.length > 0,
    retry: false,
  });
  const apiInfo = kanjiInfoQuery.data;
  const kanji = useMemo(
    () => staticKanji ?? apiToEntry(kanjiInfoQuery.data),
    [staticKanji, kanjiInfoQuery.data]
  );

  const { data: vocabulary = [], isLoading: vocabularyLoading } = useQuery({
    queryKey: ["kanji-vocabulary", kanji?.character],
    queryFn: () => vocabularyApi.getAll(),
    enabled: !!kanji,
    staleTime: 1000 * 60 * 5,
  });

  const relatedWords = useMemo(() => {
    if (!kanji) return [];
    return (vocabulary as VocabularyItem[])
      .filter((item) => item.kanji?.includes(kanji.character))
      .slice(0, 8);
  }, [kanji, vocabulary]);

  if (!kanji) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-[1200px]">
          {kanjiInfoQuery.isFetching ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-100 border-t-sky-500" />
            </div>
          ) : (
            <EmptyState
              title="Không tìm thấy kanji"
              description="Ký tự này chưa có trong từ điển kanji."
              icon={<BookOpen className="h-6 w-6" />}
            />
          )}
        </div>
      </DashboardLayout>
    );
  }

  const srsRecord = recordMap.get(kanji.character);
  const inDeck = Boolean(srsRecord);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1420px]">
        <PageHeader
          eyebrow="Chi tiết Kanji"
          icon={<BookOpen className="h-6 w-6 text-sky-600" />}
          title={`${kanji.character} • ${kanji.meaning}`}
          description="Trang chi tiết riêng cho bộ thủ, cách đọc, từ ví dụ, luyện viết và SRS."
          action={
            <>
              <Button
                className="rounded-2xl border-border bg-card text-foreground/80"
                onClick={() => navigate("/kanji-library")}
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Về thư viện
              </Button>
              {inDeck ? (
                <Button
                  className="rounded-2xl bg-rose-500 text-white hover:bg-rose-400"
                  onClick={() => removeFromSrs(kanji.character)}
                >
                  Xóa khỏi SRS
                </Button>
              ) : (
                <Button
                  className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400"
                  onClick={() => addToSrs(kanji.character)}
                >
                  Thêm vào SRS
                </Button>
              )}
            </>
          }
        />

        <StatStrip
          className="mb-4"
          items={[
            { label: "JLPT", value: kanji.jlptLevel || "—" },
            { label: "số nét", value: kanji.strokeCount || "—" },
            { label: "tần suất", value: apiInfo?.frequency ? `#${apiInfo.frequency}` : "—" },
            { label: "lần ôn kế", value: formatReviewDate(srsRecord?.nextReviewAt) },
          ]}
        />

        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <PageSection
            title="Hồ sơ kanji"
            description="Tập trung vào thông tin cần nhớ khi học một chữ mới."
          >
            <div className="space-y-4">
              <div className="rounded-[22px] border border-border bg-card p-5 text-center">
                <p className="text-8xl font-semibold text-foreground">{kanji.character}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                    {kanji.jlptLevel}
                  </Badge>
                  {kanji.tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="rounded-full border border-border bg-muted text-muted-foreground"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {apiInfo?.strokeSvg && (
                <div className="rounded-[22px] border border-border bg-card p-5">
                  <p className="mb-3 text-sm font-semibold text-foreground">Thứ tự nét</p>
                  <KanjiStrokeOrder svg={apiInfo.strokeSvg} />
                </div>
              )}

              {apiInfo?.components && apiInfo.components.length > 0 && (
                <div className="rounded-[22px] border border-border bg-card p-5">
                  <p className="mb-3 text-sm font-semibold text-foreground">Thành phần / bộ thủ</p>
                  <div className="flex flex-wrap gap-2">
                    {apiInfo.components.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => navigate(`/kanji/${encodeURIComponent(c)}`)}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-2xl font-semibold text-foreground transition hover:border-primary/40 hover:bg-primary/5"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-[22px] border border-border bg-card p-5">
                <p className="text-sm font-semibold text-foreground">Onyomi</p>
                <p className="mt-2 text-lg text-foreground">
                  {kanji.onReadings.join(" • ") || "Không có"}
                </p>
                <p className="mt-4 text-sm font-semibold text-foreground">Kunyomi</p>
                <p className="mt-2 text-lg text-foreground">
                  {kanji.kunReadings.join(" • ") || "Không có"}
                </p>
              </div>

              <div className="rounded-[22px] border border-amber-200 bg-amber-50/70 p-5">
                <p className="text-sm font-semibold text-amber-900">Mnemonic</p>
                <p className="mt-2 text-sm leading-6 text-foreground/80">{kanji.mnemonic}</p>
              </div>

              {inDeck && (
                <div className="rounded-[22px] border border-emerald-200 bg-emerald-50/70 p-5">
                  <p className="text-sm font-semibold text-emerald-900">Ôn nhanh</p>
                  <p className="mt-1 text-xs text-emerald-800">
                    {srsRecord?.reviewCount ?? 0} lần ôn • giãn cách {srsRecord?.intervalDays ?? 0}{" "}
                    ngày
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {REVIEW_RATINGS.map((rating) => (
                      <Button
                        key={rating}
                        className={`rounded-xl ${ratingTone[rating]}`}
                        onClick={() => review(kanji.character, rating)}
                        size="sm"
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PageSection>

          <div className="space-y-4">
            <KanjiPracticeCanvas kanji={kanji.character} />

            <PageSection
              title="Từ ví dụ"
              description="Kết hợp ví dụ trong catalog và từ vựng thật của dự án để nhìn kanji trong ngữ cảnh."
            >
              <div className="grid gap-3 md:grid-cols-2">
                {kanji.exampleWords.map((word) => (
                  <div
                    key={word}
                    className="rounded-[18px] border border-border bg-card p-4 text-sm text-foreground/85"
                  >
                    {word}
                  </div>
                ))}
                {vocabularyLoading && (
                  <div className="rounded-[18px] border border-border bg-card p-4 text-sm text-muted-foreground">
                    Đang tải từ vựng liên quan...
                  </div>
                )}
                {!vocabularyLoading &&
                  relatedWords.map((word) => (
                    <Link
                      key={word.id}
                      to="/dictionary"
                      className="rounded-[18px] border border-sky-100 bg-sky-50/60 p-4 text-sm text-foreground/85 transition hover:bg-sky-50"
                    >
                      <p className="font-semibold text-foreground">{word.kanji || word.hiragana}</p>
                      <p className="mt-1 text-muted-foreground">
                        {word.hiragana} • {word.meaning}
                      </p>
                    </Link>
                  ))}
              </div>
            </PageSection>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KanjiDetail;
