import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, Plus, Search, Star, Volume2, X } from "lucide-react";
import { dictionaryApi, myWordsApi, type DictionaryEntry } from "@/api";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { speakJapanese } from "@/lib/speech";
import { Leaf } from "lucide-react";
import type { SavedWord } from "@/pages/my-words/types";

const levelClass: Record<string, string> = {
  N5: "border-emerald-200 bg-emerald-50 text-emerald-700",
  N4: "border-sky-200 bg-sky-50 text-sky-700",
  N3: "border-amber-200 bg-amber-50 text-amber-700",
  N2: "border-orange-200 bg-orange-50 text-orange-700",
  N1: "border-rose-200 bg-rose-50 text-rose-700",
};

const normalizeSavedStatuses = (statuses: Record<string, boolean>) =>
  Object.fromEntries(Object.entries(statuses).map(([id, saved]) => [Number(id), saved])) as Record<
    number,
    boolean
  >;

const Dictionary = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<DictionaryEntry | null>(null);
  // Optimistic "saved" flags for words saved this session (keyed by displayed id, incl. JMdict).
  const [savedOverrides, setSavedOverrides] = useState<Record<number, boolean>>({});

  const searchKey = ["dictionary", "search", committedQuery] as const;
  const searchQuery = useQuery({
    queryKey: searchKey,
    queryFn: () => dictionaryApi.search(committedQuery),
    enabled: committedQuery.trim().length > 0,
  });
  const results = useMemo(() => searchQuery.data ?? [], [searchQuery.data]);
  const loading = searchQuery.isFetching;
  const searched = committedQuery.trim().length > 0;

  useEffect(() => {
    if (searchQuery.error) {
      toast({
        title: "Không thể tra cứu",
        description: "Vui lòng thử lại sau ít phút.",
        variant: "destructive",
      });
    }
  }, [searchQuery.error, toast]);

  // Initial saved state for curated (positive-id) results; session saves tracked in savedOverrides.
  const savedIds = useMemo(() => results.filter((w) => w.id > 0).map((w) => w.id), [results]);
  const savedQuery = useQuery({
    queryKey: ["dictionary", "saved", savedIds],
    queryFn: () => myWordsApi.getSavedStatuses(savedIds),
    enabled: savedIds.length > 0,
  });
  const savedMap = normalizeSavedStatuses(savedQuery.data ?? {});
  const wordSaved = (id: number) => savedOverrides[id] ?? !!savedMap[id];

  const exampleWord = selectedWord?.kanji || selectedWord?.hiragana || "";
  const examplesQuery = useQuery({
    queryKey: ["dictionary", "examples", exampleWord],
    queryFn: () => dictionaryApi.getExamples(exampleWord),
    enabled: exampleWord.length > 0,
  });
  const examples = examplesQuery.data ?? [];
  const examplesLoading = examplesQuery.isFetching;

  const handleSearch = () => setCommittedQuery(query.trim());

  const translateMutation = useMutation({
    mutationFn: (dictWordId: number) => dictionaryApi.translateMeaning(dictWordId),
    onSuccess: ({ vi }, dictWordId) => {
      if (!vi) return;
      const displayId = -dictWordId;
      setSelectedWord((prev) => (prev && prev.id === displayId ? { ...prev, meaning: vi } : prev));
      queryClient.setQueryData<DictionaryEntry[]>(searchKey, (old) =>
        old?.map((w) => (w.id === displayId ? { ...w, meaning: vi } : w))
      );
    },
    onError: () =>
      toast({
        title: "Không dịch được",
        description: "Vui lòng thử lại sau ít phút.",
        variant: "destructive",
      }),
  });
  const translating = translateMutation.isPending;

  const handleTranslate = (word: DictionaryEntry) => {
    if (word.id >= 0) return; // only JMdict (English) results need translating
    translateMutation.mutate(-word.id);
  };

  const saveMutation = useMutation({
    mutationFn: async (word: DictionaryEntry) => {
      // JMdict results (synthetic negative id) aren't in vocabulary yet — promote first.
      const vocabularyId = word.id > 0 ? word.id : (await dictionaryApi.materialize(-word.id)).id;
      await myWordsApi.saveWord({ vocabularyId, folderName: "Dictionary" });
      return word;
    },
    onSuccess: (word) => {
      setSavedOverrides((prev) => ({ ...prev, [word.id]: true }));
      toast({
        title: "Đã lưu",
        description: `${word.kanji || word.hiragana} đã được thêm vào Sổ từ của tôi.`,
        action: (
          <ToastAction altText="Mở Sổ từ của tôi" onClick={() => navigate("/my-words")}>
            Mở Sổ từ của tôi
          </ToastAction>
        ),
      });
    },
    onError: () =>
      toast({
        title: "Lưu chưa thành công",
        description: "Vui lòng thử lại sau ít phút.",
        variant: "destructive",
      }),
  });
  const savingWordId = saveMutation.isPending ? (saveMutation.variables?.id ?? null) : null;

  const handleSaveWord = (word: DictionaryEntry) => {
    if (wordSaved(word.id)) {
      toast({
        title: "Đã có trong sổ tay",
        description: `${word.kanji || word.hiragana} đang nằm trong Sổ từ của tôi rồi.`,
      });
      return;
    }
    saveMutation.mutate(word);
  };

  const savedWordsQuery = useQuery({
    queryKey: ["dictionary", "saved-words"],
    queryFn: () => myWordsApi.getAll() as Promise<SavedWord[]>,
  });
  const savedWords = savedWordsQuery.data ?? [];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1380px]">
        <PageHeader
          icon={<BookOpen className="h-6 w-6 text-primary" />}
          title="Từ điển"
          description="Tra kanji, hiragana, romaji hoặc nghĩa tiếng Việt — kết quả gọn, mở nhanh phần chi tiết."
          eyebrow="Tra cứu Nhật – Việt"
        />

        {/* Big centered search */}
        <div className="mx-auto mb-8 max-w-2xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
            <input
              className="h-16 w-full rounded-full border border-primary/25 bg-card pl-14 pr-5 text-lg text-foreground outline-none transition-shadow placeholder:text-muted-foreground"
              style={{
                boxShadow:
                  "0 0 0 6px hsl(var(--primary) / 0.08), 0 16px 36px -16px hsl(var(--primary) / 0.45)",
              }}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleSearch()}
              placeholder="Ví dụ: 勉強, benkyou, học tập…"
              value={query}
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          </div>
        ) : searched && results.length === 0 ? (
          <EmptyState
            description={`Không tìm thấy mục phù hợp với "${query}". Thử romaji, nghĩa tiếng Việt hoặc từ ngắn hơn.`}
            icon={<Search className="h-6 w-6" />}
            title="Chưa có kết quả"
          />
        ) : results.length > 0 ? (
          <div className="mb-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {results.map((word, index) => {
                const isSaved = wordSaved(word.id);
                const isSaving = savingWordId === word.id;

                return (
                  <motion.button
                    key={word.id}
                    animate={{ opacity: 1, y: 0 }}
                    className="yukihon-card flex items-center gap-4 p-4 text-left"
                    exit={{ opacity: 0, y: -10 }}
                    initial={{ opacity: 0, y: 10 }}
                    onClick={() => setSelectedWord(word)}
                    transition={{ delay: index * 0.03 }}
                    type="button"
                  >
                    <span className="shrink-0 text-[2.6rem] font-semibold leading-none text-foreground">
                      {word.kanji || word.hiragana}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-primary">
                        {word.hiragana} · {word.romaji}
                      </p>
                      <p className="line-clamp-2 text-sm text-foreground/80">{word.meaning}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {word.jlptLevel && (
                        <Badge
                          className={`rounded-full border ${levelClass[word.jlptLevel] || "border-border bg-muted text-foreground/80"}`}
                        >
                          {word.jlptLevel}
                        </Badge>
                      )}
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleSaveWord(word);
                        }}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isSaved
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-primary/10 text-primary hover:bg-primary/15"
                        }`}
                      >
                        {isSaved ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                        {isSaved ? "Đã lưu" : isSaving ? "Đang lưu" : "Lưu"}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        ) : null}

        {/* Saved words */}
        <PageSection
          title="Từ đã lưu"
          description="Những từ bạn đã thêm vào Sổ từ của tôi."
          action={
            <Button
              variant="ghost"
              className="rounded-full text-primary hover:bg-primary/10"
              onClick={() => navigate("/my-words")}
            >
              Xem tất cả
            </Button>
          }
        >
          {savedWordsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            </div>
          ) : savedWords.length === 0 ? (
            <EmptyState
              icon={<Star className="h-6 w-6" />}
              title="Chưa có từ nào được lưu"
              description="Tra một từ rồi nhấn Lưu để thêm vào sổ tay của bạn."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {savedWords.slice(0, 12).map((word) => (
                <div key={word.id} className="yukihon-card-flat p-4">
                  <span
                    className={`mb-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      word.mastered
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {word.mastered ? (
                      <Star className="h-3 w-3 fill-current" />
                    ) : (
                      <Leaf className="h-3 w-3" />
                    )}
                    {word.mastered ? "Đã thuộc" : "Đang học"}
                  </span>
                  <p className="text-2xl font-semibold text-foreground">
                    {word.kanji || word.hiragana}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {word.hiragana}
                    {word.romaji ? ` · ${word.romaji}` : ""}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-foreground/80">{word.meaning}</p>
                </div>
              ))}
            </div>
          )}
        </PageSection>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Dữ liệu từ JMdict &amp; Tatoeba —{" "}
          <button
            type="button"
            className="text-sky-700 hover:underline"
            onClick={() => navigate("/credits")}
          >
            Giấy phép &amp; nguồn
          </button>
        </p>

        <AnimatePresence>
          {selectedWord && (
            <motion.div
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 backdrop-blur-sm"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setSelectedWord(null)}
            >
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl rounded-[28px] border border-border bg-card p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
                exit={{ opacity: 0, scale: 0.96 }}
                initial={{ opacity: 0, scale: 0.96 }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[2.2rem] font-semibold leading-none text-foreground">
                      {selectedWord.kanji || selectedWord.hiragana}
                    </p>
                    <p className="mt-2 text-sm text-sky-700">
                      {selectedWord.hiragana} · {selectedWord.romaji}
                    </p>
                  </div>
                  <Button
                    className="rounded-xl"
                    onClick={() => setSelectedWord(null)}
                    size="icon"
                    variant="ghost"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[20px] border border-border bg-muted p-4">
                    <p className="mb-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Nghĩa
                    </p>
                    <p className="text-base text-foreground">{selectedWord.meaning}</p>
                    {selectedWord.id < 0 && (
                      <Button
                        className="mt-2 h-auto p-0 text-sm text-sky-700"
                        variant="link"
                        onClick={() => void handleTranslate(selectedWord)}
                        disabled={translating}
                      >
                        {translating ? "Đang dịch…" : "Dịch nghĩa sang tiếng Việt"}
                      </Button>
                    )}
                  </div>

                  {selectedWord.exampleSentenceJP && (
                    <div className="rounded-[20px] border border-border bg-card p-4">
                      <p className="mb-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Ví dụ
                      </p>
                      <p className="text-sm text-foreground">{selectedWord.exampleSentenceJP}</p>
                      {selectedWord.exampleSentenceEN && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {selectedWord.exampleSentenceEN}
                        </p>
                      )}
                    </div>
                  )}

                  {selectedWord.additionalNotes && (
                    <div className="rounded-[20px] border border-border bg-violet-50/70 p-4">
                      <p className="mb-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Ghi chú
                      </p>
                      <p className="text-sm text-foreground/80">{selectedWord.additionalNotes}</p>
                    </div>
                  )}

                  {(examplesLoading || examples.length > 0) && (
                    <div className="rounded-[20px] border border-border bg-card p-4">
                      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Câu ví dụ (Tatoeba)
                      </p>
                      {examplesLoading ? (
                        <p className="text-sm text-muted-foreground">Đang tải ví dụ…</p>
                      ) : (
                        <ul className="space-y-3">
                          {examples.map((ex) => (
                            <li key={ex.tatoebaId} className="border-l-2 border-sky-200 pl-3">
                              <p className="text-sm text-foreground">{ex.jp}</p>
                              {ex.vi && <p className="mt-0.5 text-sm text-sky-700">{ex.vi}</p>}
                              {!ex.vi && ex.en && (
                                <p className="mt-0.5 text-sm text-muted-foreground">{ex.en}</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-emerald-500"
                      onClick={() => void handleSaveWord(selectedWord)}
                      disabled={!!wordSaved(selectedWord.id) || savingWordId === selectedWord.id}
                    >
                      {wordSaved(selectedWord.id) ? (
                        <Check className="mr-2 h-4 w-4" />
                      ) : (
                        <Star className="mr-2 h-4 w-4" />
                      )}
                      {wordSaved(selectedWord.id)
                        ? "Đã có trong sổ tay"
                        : savingWordId === selectedWord.id
                          ? "Đang lưu..."
                          : "Thêm vào sổ tay"}
                    </Button>
                    <Button
                      className="rounded-2xl border-border bg-white text-foreground/80"
                      variant="outline"
                      onClick={() => {
                        const spoken = speakJapanese(
                          selectedWord.hiragana || selectedWord.kanji || selectedWord.romaji
                        );
                        if (!spoken) {
                          toast({
                            title: "Trình duyệt không hỗ trợ phát âm",
                            description: "Hãy thử Chrome hoặc Edge để nghe phát âm tiếng Nhật.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
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
