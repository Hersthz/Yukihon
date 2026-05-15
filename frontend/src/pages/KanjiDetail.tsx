import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Languages, Sparkles, WandSparkles } from "lucide-react";

import { vocabularyApi } from "@/api";
import KanjiPracticeCanvas from "@/components/kanji/KanjiPracticeCanvas";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getKanjiByCharacter, kanjiCatalog } from "@/data/kanji";
import { useKanjiSrs } from "@/hooks/learning/useKanjiSrs";
import type { KanjiReviewRating } from "@/lib/kanjiSrs";

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
  const kanji = getKanjiByCharacter(decodedCharacter);
  const { recordMap, addToSrs, removeFromSrs, review } = useKanjiSrs(kanjiCatalog);

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
          <EmptyState
            title="Không tìm thấy kanji"
            description="Ký tự này chưa có trong kanji system hiện tại."
            icon={<BookOpen className="h-6 w-6" />}
          />
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
          eyebrow="Kanji Detail"
          icon={<BookOpen className="h-6 w-6 text-sky-600" />}
          title={`${kanji.character} • ${kanji.meaning}`}
          description="Trang detail riêng cho bộ thủ, cách đọc, từ ví dụ, writing practice và SRS."
          action={
            <>
              <Button className="rounded-2xl border-border bg-card text-foreground/80" onClick={() => navigate("/kanji-library")} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Về thư viện
              </Button>
              {inDeck ? (
                <Button className="rounded-2xl bg-rose-500 text-white hover:bg-rose-400" onClick={() => removeFromSrs(kanji.character)}>
                  Xóa khỏi SRS
                </Button>
              ) : (
                <Button className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400" onClick={() => addToSrs(kanji.character)}>
                  Thêm vào SRS
                </Button>
              )}
            </>
          }
        />

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <MetricCard hint="Cấp JLPT" icon={<BookOpen className="h-4 w-4 text-sky-500" />} label="Level" value={kanji.jlptLevel} />
          <MetricCard hint="Tổng số nét" icon={<WandSparkles className="h-4 w-4 text-violet-500" />} label="Số nét" value={kanji.strokeCount} />
          <MetricCard hint="Bộ thủ chính" icon={<Languages className="h-4 w-4 text-amber-500" />} label="Bộ thủ" value={`${kanji.radical} • ${kanji.radicalMeaning}`} />
          <MetricCard hint="Lịch riêng cho kanji này" icon={<Sparkles className="h-4 w-4 text-emerald-500" />} label="Next review" value={formatReviewDate(srsRecord?.nextReviewAt)} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <PageSection title="Hồ sơ kanji" description="Tập trung vào thông tin cần nhớ khi học một chữ mới.">
            <div className="space-y-4">
              <div className="rounded-[22px] border border-border bg-card p-5 text-center">
                <p className="text-8xl font-semibold text-foreground">{kanji.character}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">{kanji.jlptLevel}</Badge>
                  {kanji.tags.map((tag) => (
                    <Badge key={tag} className="rounded-full border border-border bg-muted text-muted-foreground">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-[22px] border border-border bg-card p-5">
                <p className="text-sm font-semibold text-foreground">Onyomi</p>
                <p className="mt-2 text-lg text-foreground">{kanji.onReadings.join(" • ") || "Không có"}</p>
                <p className="mt-4 text-sm font-semibold text-foreground">Kunyomi</p>
                <p className="mt-2 text-lg text-foreground">{kanji.kunReadings.join(" • ") || "Không có"}</p>
              </div>

              <div className="rounded-[22px] border border-amber-200 bg-amber-50/70 p-5">
                <p className="text-sm font-semibold text-amber-900">Mnemonic</p>
                <p className="mt-2 text-sm leading-6 text-foreground/80">{kanji.mnemonic}</p>
              </div>

              {inDeck && (
                <div className="rounded-[22px] border border-emerald-200 bg-emerald-50/70 p-5">
                  <p className="text-sm font-semibold text-emerald-900">Quick review</p>
                  <p className="mt-1 text-xs text-emerald-800">
                    {srsRecord?.reviewCount ?? 0} lần ôn • interval {srsRecord?.intervalDays ?? 0} ngày
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {REVIEW_RATINGS.map((rating) => (
                      <Button key={rating} className={`rounded-xl ${ratingTone[rating]}`} onClick={() => review(kanji.character, rating)} size="sm">
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

            <PageSection title="Từ ví dụ" description="Kết hợp ví dụ trong catalog và từ vựng thật của dự án để nhìn kanji trong ngữ cảnh.">
              <div className="grid gap-3 md:grid-cols-2">
                {kanji.exampleWords.map((word) => (
                  <div key={word} className="rounded-[18px] border border-border bg-card p-4 text-sm text-foreground/85">
                    {word}
                  </div>
                ))}
                {vocabularyLoading && (
                  <div className="rounded-[18px] border border-border bg-card p-4 text-sm text-muted-foreground">Đang tải từ vựng liên quan...</div>
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
