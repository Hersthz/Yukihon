import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Plus, Search, Star, Volume2, X } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/apiClient";

interface VocabResult {
  id: number;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning: string;
  exampleSentenceJP: string;
  exampleSentenceEN: string;
  wordType: string;
  jlptLevel: string;
  additionalNotes: string;
}

const levelClass: Record<string, string> = {
  N5: "border-emerald-200 bg-emerald-50 text-emerald-700",
  N4: "border-sky-200 bg-sky-50 text-sky-700",
  N3: "border-amber-200 bg-amber-50 text-amber-700",
  N2: "border-orange-200 bg-orange-50 text-orange-700",
  N1: "border-rose-200 bg-rose-50 text-rose-700",
};

const Dictionary = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VocabResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedWord, setSelectedWord] = useState<VocabResult | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const data = (await apiClient.dictionary.search(query.trim())) as VocabResult[];
      setResults(data);
    } catch (error) {
      console.error("Dictionary search failed", error);
      toast({
        title: "Không thể tra cứu",
        description: "Vui lòng thử lại sau ít phút.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [query, toast]);

  const handleSaveWord = async (vocabId: number) => {
    try {
      await apiClient.myWords.saveWord({ vocabularyId: vocabId });
      toast({ title: "Đã lưu", description: "Từ vựng đã được thêm vào sổ tay." });
    } catch {
      toast({ title: "Lưu chưa thành công", description: "Từ này có thể đã tồn tại trong sổ tay.", variant: "destructive" });
    }
  };

  const quickStats = useMemo(
    () => [
      { label: "Kết quả", value: searched ? results.length : "-", icon: <Search className="h-4 w-4 text-sky-500" />, hint: "Số mục phù hợp" },
      { label: "Từ khóa", value: query.trim() ? query.trim().slice(0, 14) : "-", icon: <Star className="h-4 w-4 text-violet-500" />, hint: "Từ đang tra cứu" },
      { label: "Chế độ", value: "Nhật - Việt", icon: <BookOpen className="h-4 w-4 text-emerald-500" />, hint: "Tra nhanh trong một khung" },
    ],
    [query, results.length, searched]
  );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1380px]">
        <PageHeader
          icon={<BookOpen className="h-6 w-6 text-sky-600" />}
          title="Tra cứu"
          description="Giữ giao diện gọn, nhìn được nhiều kết quả hơn và mở nhanh phần chi tiết khi cần."
          eyebrow="Dictionary"
          action={
            <Button className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400" onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Tra cứu
            </Button>
          }
        />

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          {quickStats.map((item) => (
            <MetricCard key={item.label} hint={item.hint} icon={item.icon} label={item.label} value={item.value} />
          ))}
        </div>

        <PageSection className="mb-4" title="Ô tìm kiếm" description="Nhập kanji, hiragana, romaji hoặc nghĩa tiếng Việt.">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-12 rounded-2xl border-white/80 bg-white/90 pl-11 text-base text-slate-900 placeholder:text-slate-400"
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ví dụ: 勉強, benkyou, học tập..."
                value={query}
              />
            </div>
            <Button className="h-12 rounded-2xl bg-slate-900 text-white hover:bg-slate-800" onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Tìm ngay
            </Button>
          </div>
        </PageSection>

        <PageSection title="Kết quả" description="Card thấp, rõ nghĩa và đủ metadata để quét nhanh.">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-12 w-12 rounded-full border-4 border-sky-100 border-t-sky-500 animate-spin" />
            </div>
          ) : searched && results.length === 0 ? (
            <EmptyState
              description={`Không tìm thấy mục phù hợp với "${query}". Thử romaji, nghĩa tiếng Việt hoặc từ ngắn hơn.`}
              icon={<Search className="h-6 w-6" />}
              title="Chưa có kết quả"
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence>
                {results.map((word, index) => (
                  <motion.button
                    key={word.id}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[22px] border border-white bg-white p-4 text-left shadow-[0_10px_24px_rgba(148,163,184,0.10)] transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(148,163,184,0.16)]"
                    exit={{ opacity: 0, y: -10 }}
                    initial={{ opacity: 0, y: 10 }}
                    onClick={() => setSelectedWord(word)}
                    transition={{ delay: index * 0.03 }}
                    type="button"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[1.65rem] font-semibold text-slate-900">{word.kanji || word.hiragana}</p>
                        <p className="text-sm text-sky-700">
                          {word.hiragana} · {word.romaji}
                        </p>
                      </div>
                      {word.jlptLevel && (
                        <Badge className={`rounded-full border ${levelClass[word.jlptLevel] || "border-slate-200 bg-slate-50 text-slate-700"}`}>
                          {word.jlptLevel}
                        </Badge>
                      )}
                    </div>

                    <p className="line-clamp-2 text-sm text-slate-700">{word.meaning}</p>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      {word.wordType ? (
                        <Badge className="rounded-full border border-slate-200 bg-slate-50 text-slate-600">{word.wordType}</Badge>
                      ) : (
                        <span className="text-xs text-slate-400">Nhấn để xem ví dụ</span>
                      )}

                      <Button
                        className="rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveWord(word.id);
                        }}
                        size="sm"
                        variant="ghost"
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Lưu
                      </Button>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </PageSection>

        <AnimatePresence>
          {selectedWord && (
            <motion.div
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-sm"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setSelectedWord(null)}
            >
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl rounded-[28px] border border-white/80 bg-white/[0.96] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
                exit={{ opacity: 0, scale: 0.96 }}
                initial={{ opacity: 0, scale: 0.96 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[2.2rem] font-semibold leading-none text-slate-900">{selectedWord.kanji || selectedWord.hiragana}</p>
                    <p className="mt-2 text-sm text-sky-700">
                      {selectedWord.hiragana} · {selectedWord.romaji}
                    </p>
                  </div>
                  <Button className="rounded-xl" onClick={() => setSelectedWord(null)} size="icon" variant="ghost">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-1 text-xs uppercase tracking-[0.18em] text-slate-500">Nghĩa</p>
                    <p className="text-base text-slate-800">{selectedWord.meaning}</p>
                  </div>

                  {selectedWord.exampleSentenceJP && (
                    <div className="rounded-[20px] border border-slate-200 bg-white p-4">
                      <p className="mb-1 text-xs uppercase tracking-[0.18em] text-slate-500">Ví dụ</p>
                      <p className="text-sm text-slate-800">{selectedWord.exampleSentenceJP}</p>
                      {selectedWord.exampleSentenceEN && <p className="mt-2 text-sm text-slate-500">{selectedWord.exampleSentenceEN}</p>}
                    </div>
                  )}

                  {selectedWord.additionalNotes && (
                    <div className="rounded-[20px] border border-slate-200 bg-violet-50/70 p-4">
                      <p className="mb-1 text-xs uppercase tracking-[0.18em] text-slate-500">Ghi chú</p>
                      <p className="text-sm text-slate-700">{selectedWord.additionalNotes}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button className="rounded-2xl bg-sky-500 text-white hover:bg-sky-400" onClick={() => handleSaveWord(selectedWord.id)}>
                      <Star className="mr-2 h-4 w-4" />
                      Thêm vào sổ tay
                    </Button>
                    <Button className="rounded-2xl border-slate-200 bg-white text-slate-700" variant="outline">
                      <Volume2 className="mr-2 h-4 w-4" />
                      Phát âm
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Dictionary;
