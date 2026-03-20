import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Kanji {
  character: string;
  meaning: string;
  onReading: string;
  kunReading: string;
  strokes: number;
  level: string;
  examples: string[];
}

const kanjiData: Kanji[] = [
  {
    character: "日",
    meaning: "sun, day",
    onReading: "ニチ、ジツ",
    kunReading: "ひ、か",
    strokes: 4,
    level: "N5",
    examples: ["日本 (にほん) - Japan", "毎日 (まいにち) - every day", "今日 (きょう) - today"],
  },
  {
    character: "本",
    meaning: "book, origin",
    onReading: "ホン",
    kunReading: "もと",
    strokes: 5,
    level: "N5",
    examples: ["本 (ほん) - book", "日本 (にほん) - Japan", "本当 (ほんとう) - truth"],
  },
  {
    character: "人",
    meaning: "person",
    onReading: "ジン、ニン",
    kunReading: "ひと",
    strokes: 2,
    level: "N5",
    examples: ["人 (ひと) - person", "日本人 (にほんじん) - Japanese person", "三人 (さんにん) - three people"],
  },
  {
    character: "学",
    meaning: "study, learning",
    onReading: "ガク",
    kunReading: "まな(ぶ)",
    strokes: 8,
    level: "N5",
    examples: ["学校 (がっこう) - school", "学生 (がくせい) - student", "大学 (だいがく) - university"],
  },
  {
    character: "生",
    meaning: "life, birth",
    onReading: "セイ、ショウ",
    kunReading: "い(きる)、う(まれる)",
    strokes: 5,
    level: "N5",
    examples: ["学生 (がくせい) - student", "先生 (せんせい) - teacher", "人生 (じんせい) - life"],
  },
  {
    character: "会",
    meaning: "meet, gathering",
    onReading: "カイ、エ",
    kunReading: "あ(う)",
    strokes: 6,
    level: "N5",
    examples: ["会社 (かいしゃ) - company", "会う (あう) - to meet", "社会 (しゃかい) - society"],
  },
];

const LEVELS = ["N5", "N4", "N3", "N2", "N1"];

const KanjiLibrary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("N5");
  const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(null);

  const filteredKanji = useMemo(() => {
    return kanjiData.filter(
      (item) =>
        item.level === selectedLevel &&
        (item.character.includes(searchQuery) || item.meaning.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, selectedLevel]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1380px]">
        <PageHeader
          eyebrow="Kanji"
          icon={<BookOpen className="h-6 w-6 text-sky-600" />}
          title="Kanji library"
          description="Bố cục thư viện được nén lại để bạn nhìn được nhiều ô kanji hơn, nhưng vẫn mở chi tiết dễ dàng khi cần."
        />

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricCard hint="Cấp đang xem" icon={<BookOpen className="h-4 w-4 text-sky-500" />} label="Level" value={selectedLevel} />
          <MetricCard hint="Số kanji đang hiện" icon={<Search className="h-4 w-4 text-violet-500" />} label="Hiển thị" value={filteredKanji.length} />
          <MetricCard hint="Joyo tổng quát" icon={<BookOpen className="h-4 w-4 text-emerald-500" />} label="Tổng bộ" value="2,136" />
        </div>

        <PageSection className="mb-4" title="Tìm kiếm và lọc" description="Gom search và level lên một hàng để giữ vùng lưới thật rộng.">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-11 rounded-2xl border-border bg-card pl-11 text-foreground placeholder:text-muted-foreground"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo kanji hoặc nghĩa"
                value={searchQuery}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {LEVELS.map((level) => (
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

        <PageSection title="Lưới kanji" description="Ô nhỏ vừa đủ để giữ cảm giác overview, không biến thư viện thành một trang cuộn quá sâu.">
          {filteredKanji.length === 0 ? (
            <EmptyState description="Thử từ khóa khác hoặc chuyển sang level khác." icon={<BookOpen className="h-6 w-6" />} title="Không tìm thấy kanji" />
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
              {filteredKanji.map((kanji) => (
                <button
                  key={kanji.character}
                  className="aspect-square rounded-[20px] border border-white bg-card p-3 text-center shadow-[0_10px_24px_rgba(148,163,184,0.10)] transition hover:-translate-y-1 hover:bg-sky-50/50"
                  onClick={() => setSelectedKanji(kanji)}
                  type="button"
                >
                  <div className="flex h-full flex-col items-center justify-center">
                    <p className="text-4xl font-semibold text-foreground">{kanji.character}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{kanji.meaning.split(",")[0]}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </PageSection>

        <Dialog onOpenChange={() => setSelectedKanji(null)} open={!!selectedKanji}>
          <DialogContent className="max-w-2xl rounded-[28px] border-border bg-white/[0.98]">
            {selectedKanji && (
              <>
                <DialogHeader>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="text-7xl font-semibold text-foreground">{selectedKanji.character}</div>
                    <Badge className="rounded-full border border-sky-200 bg-sky-50 text-sky-700">{selectedKanji.level}</Badge>
                  </div>
                  <DialogTitle className="text-2xl text-foreground">{selectedKanji.meaning}</DialogTitle>
                  <DialogDescription className="text-muted-foreground">{selectedKanji.strokes} nét</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[20px] border border-border bg-muted/40 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Onyomi</p>
                      <p className="mt-2 text-lg text-foreground">{selectedKanji.onReading}</p>
                    </div>
                    <div className="rounded-[20px] border border-border bg-muted/40 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Kunyomi</p>
                      <p className="mt-2 text-lg text-foreground">{selectedKanji.kunReading}</p>
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ví dụ</p>
                    <div className="mt-3 space-y-2">
                      {selectedKanji.examples.map((example) => (
                        <div key={example} className="rounded-[16px] border border-border bg-muted p-3 text-sm text-foreground/80">
                          {example}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default KanjiLibrary;
