import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Languages, Sparkles, WandSparkles } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import KanjiPracticeCanvas from "@/components/kanji/KanjiPracticeCanvas";
import { getKanjiByCharacter, kanjiCatalog } from "@/data/kanji";
import { vocabularyApi } from "@/api";
import { useKanjiSrs } from "@/hooks/learning/useKanjiSrs";

interface VocabularyItem {
  id: number;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning: string;
  jlptLevel?: string;
}

const formatReviewDate = (value?: string) => {
  if (!value) return "Chua vao deck";
  return new Date(value).toLocaleDateString("vi-VN");
};

const KanjiDetail = () => {
  const { character = "" } = useParams();
  const navigate = useNavigate();
  const kanji = getKanjiByCharacter(decodeURIComponent(character));
  const { recordMap, addToSrs, removeFromSrs, review } = useKanjiSrs(kanjiCatalog);

  const { data: vocabulary = [] } = useQuery({
    queryKey: ["kanji-vocabulary", kanji?.character],
    queryFn: () => vocabularyApi.getAll(),
    enabled: !!kanji,
    staleTime: 1000 * 60 * 5,
  });

  const relatedWords = useMemo(() => {
    if (!kanji) return [];
    return (vocabulary as VocabularyItem[])
      .filter((item) => item.kanji?.includes(kanji.character))
      .slice(0, 6);
  }, [kanji, vocabulary]);

  if (!kanji) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-[1200px]">
          <EmptyState title="Khong tim thay kanji" description="Ky tu nay chua co trong kanji system hien tai." icon={<BookOpen className="h-6 w-6" />} />
        </div>
      </DashboardLayout>
    );
  }

  const srsRecord = recordMap.get(kanji.character);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1420px]">
        <PageHeader
          eyebrow="Kanji Detail"
          icon={<BookOpen className="h-6 w-6 text-sky-600" />}
          title={`${kanji.character} • ${kanji.meaning}`}
          description="Trang detail rieng cho bo thu, cach doc, tu vi du, writing practice va SRS rieng."
          action={
            <>
              <Button className="rounded-2xl border-border bg-card text-foreground/80" onClick={() => navigate("/kanji-library")} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ve thu vien
              </Button>
              {srsRecord ? (
                <Button className="rounded-2xl bg-rose-500 text-white hover:bg-rose-400" onClick={() => removeFromSrs(kanji.character)}>
                  Xoa khoi SRS
                </Button>
              ) : (
                <Button className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400" onClick={() => addToSrs(kanji.character)}>
                  Them vao SRS
                </Button>
              )}
            </>
          }
        />

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <MetricCard hint="Cap JLPT" icon={<BookOpen className="h-4 w-4 text-sky-500" />} label="Level" value={kanji.jlptLevel} />
          <MetricCard hint="Tong so net" icon={<WandSparkles className="h-4 w-4 text-violet-500" />} label="So net" value={kanji.strokeCount} />
          <MetricCard hint="Bo thu chinh" icon={<Languages className="h-4 w-4 text-amber-500" />} label="Bo thu" value={`${kanji.radical} • ${kanji.radicalMeaning}`} />
          <MetricCard hint="Lich rieng cho kanji nay" icon={<Sparkles className="h-4 w-4 text-emerald-500" />} label="Next review" value={formatReviewDate(srsRecord?.nextReviewAt)} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <PageSection title="Ho so kanji" description="Tap trung vao thong tin can nho khi hoc mot chu moi.">
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
                <p className="mt-2 text-lg text-foreground">{kanji.onReadings.join(" • ") || "Khong co"}</p>
                <p className="mt-4 text-sm font-semibold text-foreground">Kunyomi</p>
                <p className="mt-2 text-lg text-foreground">{kanji.kunReadings.join(" • ") || "Khong co"}</p>
              </div>

              <div className="rounded-[22px] border border-amber-200 bg-amber-50/70 p-5">
                <p className="text-sm font-semibold text-amber-900">Mnemonic</p>
                <p className="mt-2 text-sm leading-6 text-foreground/80">{kanji.mnemonic}</p>
              </div>

              {srsRecord ? (
                <div className="rounded-[22px] border border-emerald-200 bg-emerald-50/70 p-5">
                  <p className="text-sm font-semibold text-emerald-900">Quick review</p>
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
                        onClick={() => review(kanji.character, rating)}
                        size="sm"
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </PageSection>

          <div className="space-y-4">
            <KanjiPracticeCanvas kanji={kanji.character} />

            <PageSection title="Tu vi du" description="Ket hop vi du trong catalog va tu vung that cua du an de nhin kanji trong ngu canh.">
              <div className="grid gap-3 md:grid-cols-2">
                {kanji.exampleWords.map((word) => (
                  <div key={word} className="rounded-[18px] border border-border bg-card p-4 text-sm text-foreground/85">
                    {word}
                  </div>
                ))}
                {relatedWords.map((word) => (
                  <Link
                    key={word.id}
                    to="/dictionary"
                    className="rounded-[18px] border border-sky-100 bg-sky-50/60 p-4 text-sm text-foreground/85 transition hover:bg-sky-50"
                  >
                    <p className="font-semibold text-foreground">{word.kanji || word.hiragana}</p>
                    <p className="mt-1 text-muted-foreground">{word.hiragana} • {word.meaning}</p>
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
