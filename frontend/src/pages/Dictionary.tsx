import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, Leaf, Mic, Plus, Search, Star, Volume2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  dictionaryApi,
  grammarApi,
  kanjiApi,
  myWordsApi,
  type DictionaryEntry,
  type GrammarDto,
  type KanjiInfo,
} from "@/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FuriganaText from "@/components/dictionary/FuriganaText";
import { EmptyState, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { speakJapanese } from "@/lib/speech";
import { createRecognition, firstTranscript, type RecognitionLike } from "@/lib/speechRecognition";
import type { SavedWord } from "@/pages/my-words/types";

type DictTab = "vocab" | "kanji" | "examples" | "grammar";

const TABS: { key: DictTab; label: string }[] = [
  { key: "vocab", label: "Từ vựng" },
  { key: "kanji", label: "Hán tự" },
  { key: "examples", label: "Mẫu câu" },
  { key: "grammar", label: "Ngữ pháp" },
];

const levelClass: Record<string, string> = {
  N5: "border-emerald-200 bg-emerald-50 text-emerald-700",
  N4: "border-sky-200 bg-sky-50 text-sky-700",
  N3: "border-amber-200 bg-amber-50 text-amber-700",
  N2: "border-orange-200 bg-orange-50 text-orange-700",
  N1: "border-rose-200 bg-rose-50 text-rose-700",
};

const levelBadge = (level?: string) =>
  `rounded-full border ${level && levelClass[level] ? levelClass[level] : "border-border bg-muted text-foreground/80"}`;

const normalizeSavedStatuses = (statuses: Record<string, boolean>) =>
  Object.fromEntries(Object.entries(statuses).map(([id, saved]) => [Number(id), saved])) as Record<
    number,
    boolean
  >;

/** Unique CJK characters in a query, for the "Hán tự" tab. */
const extractKanji = (text: string) =>
  Array.from(new Set(Array.from(text))).filter((ch) => /[㐀-鿿]/.test(ch));

const Dictionary = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<DictTab>("vocab");
  const [selectedWord, setSelectedWord] = useState<DictionaryEntry | null>(null);
  // Optimistic "saved" flags for words saved this session (keyed by displayed id, incl. JMdict).
  const [savedOverrides, setSavedOverrides] = useState<Record<number, boolean>>({});

  const searched = committedQuery.trim().length > 0;

  // ---- Từ vựng ----
  const searchKey = ["dictionary", "search", committedQuery] as const;
  const searchQuery = useQuery({
    queryKey: searchKey,
    queryFn: () => dictionaryApi.search(committedQuery),
    enabled: searched,
  });
  const results = useMemo(() => searchQuery.data ?? [], [searchQuery.data]);

  useEffect(() => {
    if (searchQuery.error) {
      toast({
        title: "Không thể tra cứu",
        description: "Vui lòng thử lại sau ít phút.",
        variant: "destructive",
      });
    }
  }, [searchQuery.error, toast]);

  // ---- Hán tự ----
  const kanjiChars = useMemo(() => extractKanji(committedQuery), [committedQuery]);
  const kanjiResults = useQueries({
    queries: kanjiChars.map((ch) => ({
      queryKey: ["kanji", ch],
      queryFn: () => kanjiApi.get(ch),
      enabled: activeTab === "kanji" && searched,
      retry: false,
    })),
  });
  const kanjiLoading = kanjiResults.some((r) => r.isLoading);
  const kanjiList = kanjiResults.map((r) => r.data).filter((k): k is KanjiInfo => !!k);

  // ---- Mẫu câu ----
  const examplesTabQuery = useQuery({
    queryKey: ["dictionary", "examples", committedQuery],
    queryFn: () => dictionaryApi.getExamples(committedQuery),
    enabled: activeTab === "examples" && searched,
  });
  const exampleTabTexts = useMemo(
    () => (examplesTabQuery.data ?? []).map((e) => e.jp),
    [examplesTabQuery.data]
  );
  const furiganaTabQuery = useQuery({
    queryKey: ["furigana", exampleTabTexts],
    queryFn: () => dictionaryApi.furigana(exampleTabTexts),
    enabled: exampleTabTexts.length > 0,
  });

  // ---- Ngữ pháp ----
  const grammarAllQuery = useQuery({
    queryKey: ["grammar"],
    queryFn: () => grammarApi.getAll(),
    enabled: activeTab === "grammar",
  });
  const grammarMatches = useMemo(() => {
    const q = committedQuery.trim().toLowerCase();
    if (!q) return [] as GrammarDto[];
    return (grammarAllQuery.data ?? []).filter((g) =>
      [g.pattern, g.title, g.explanation, g.usage, g.exampleJP]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    );
  }, [grammarAllQuery.data, committedQuery]);

  // ---- Từ vựng: saved state ----
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
  const modalExampleTexts = useMemo(
    () => (examplesQuery.data ?? []).map((e) => e.jp),
    [examplesQuery.data]
  );
  const furiganaModalQuery = useQuery({
    queryKey: ["furigana", modalExampleTexts],
    queryFn: () => dictionaryApi.furigana(modalExampleTexts),
    enabled: modalExampleTexts.length > 0,
  });

  // ---- Detail: constituent-kanji breakdown + related/compound words ----
  const detailKanjiChars = useMemo(() => extractKanji(selectedWord?.kanji || ""), [selectedWord]);
  const detailKanjiQueries = useQueries({
    queries: detailKanjiChars.map((ch) => ({
      queryKey: ["kanji", ch],
      queryFn: () => kanjiApi.get(ch),
      enabled: !!selectedWord,
      retry: false,
    })),
  });

  const relatedWord = selectedWord?.kanji || selectedWord?.hiragana || "";
  const relatedQuery = useQuery({
    queryKey: ["dictionary", "related", relatedWord],
    queryFn: () => dictionaryApi.getRelated(relatedWord),
    enabled: !!relatedWord,
  });
  const relatedWords = relatedQuery.data ?? [];

  const handleSearch = () => {
    setCommittedQuery(query.trim());
  };

  // ---- Voice search (Web Speech API, Chrome/Edge) ----
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<RecognitionLike | null>(null);

  const handleVoiceSearch = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = createRecognition("ja-JP");
    if (!recognition) {
      toast({
        title: "Trình duyệt không hỗ trợ nhập giọng nói",
        description: "Hãy thử Chrome hoặc Edge để tìm bằng giọng nói.",
        variant: "destructive",
      });
      return;
    }
    recognitionRef.current = recognition;
    recognition.onresult = (event) => {
      const transcript = firstTranscript(event).trim();
      if (transcript) {
        setQuery(transcript);
        setCommittedQuery(transcript);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
    setListening(true);
  };

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

  const speak = (text: string) => {
    if (!speakJapanese(text)) {
      toast({
        title: "Trình duyệt không hỗ trợ phát âm",
        description: "Hãy thử Chrome hoặc Edge để nghe phát âm tiếng Nhật.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1380px]">
        <PageHeader
          icon={<BookOpen className="h-5 w-5 text-primary" />}
          title="Từ điển"
          description="Một ô tìm — tra từ vựng, Hán tự, mẫu câu và ngữ pháp."
          eyebrow="Nhật – Việt"
        />

        {/* Search + tabs */}
        <div className="mb-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
            <input
              className="h-14 w-full rounded-2xl border border-primary/25 bg-card pl-12 pr-14 text-base text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Ví dụ: 勉強, benkyou, học tập…"
              value={query}
            />
            <button
              type="button"
              onClick={handleVoiceSearch}
              aria-label="Tìm bằng giọng nói"
              className={`absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl transition ${
                listening
                  ? "animate-pulse bg-rose-500 text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              }`}
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {!searched ? (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="Nhập từ để bắt đầu"
            description="Tra bằng kanji, hiragana, romaji hoặc nghĩa tiếng Việt."
          />
        ) : (
          <div className="mb-8">
            {/* ===== TỪ VỰNG ===== */}
            {activeTab === "vocab" &&
              (searchQuery.isFetching ? (
                <Loader />
              ) : results.length === 0 ? (
                <EmptyState
                  icon={<Search className="h-6 w-6" />}
                  title="Chưa có kết quả"
                  description={`Không tìm thấy từ phù hợp với "${committedQuery}". Thử romaji hoặc nghĩa tiếng Việt.`}
                />
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
                          transition={{ delay: index * 0.02 }}
                          type="button"
                        >
                          <span className="shrink-0 text-[2.4rem] font-semibold leading-none text-foreground">
                            {word.kanji || word.hiragana}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-primary">
                              {word.hiragana} · {word.romaji}
                            </p>
                            <p className="line-clamp-2 text-sm text-foreground/80">
                              {word.meaning}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            {word.jlptLevel && (
                              <Badge className={levelBadge(word.jlptLevel)}>{word.jlptLevel}</Badge>
                            )}
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleSaveWord(word);
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
              ))}

            {/* ===== HÁN TỰ ===== */}
            {activeTab === "kanji" &&
              (kanjiChars.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="h-6 w-6" />}
                  title="Không có Hán tự trong từ khoá"
                  description="Nhập một từ có chứa kanji để xem chi tiết chữ Hán."
                />
              ) : kanjiLoading ? (
                <Loader />
              ) : kanjiList.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="h-6 w-6" />}
                  title="Chưa có dữ liệu Hán tự"
                  description="Không tìm thấy thông tin cho các chữ Hán trong từ khoá."
                />
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {kanjiList.map((kanji) => (
                    <button
                      key={kanji.character}
                      type="button"
                      onClick={() => navigate(`/kanji/${encodeURIComponent(kanji.character)}`)}
                      className="yukihon-card flex items-start gap-4 p-4 text-left"
                    >
                      <span className="shrink-0 text-[2.8rem] font-semibold leading-none text-foreground">
                        {kanji.character}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold text-foreground">
                          {kanji.meaning}
                        </p>
                        {kanji.kunReadings?.length > 0 && (
                          <p className="mt-1 line-clamp-1 text-xs text-sky-700">
                            Kun: {kanji.kunReadings.join("、")}
                          </p>
                        )}
                        {kanji.onReadings?.length > 0 && (
                          <p className="line-clamp-1 text-xs text-rose-600">
                            On: {kanji.onReadings.join("、")}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          {kanji.jlptLevel && (
                            <Badge className={levelBadge(`N${kanji.jlptLevel}`)}>
                              N{kanji.jlptLevel}
                            </Badge>
                          )}
                          {kanji.strokeCount ? (
                            <span className="text-xs text-muted-foreground">
                              {kanji.strokeCount} nét
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}

            {/* ===== MẪU CÂU ===== */}
            {activeTab === "examples" &&
              (examplesTabQuery.isFetching ? (
                <Loader />
              ) : (examplesTabQuery.data ?? []).length === 0 ? (
                <EmptyState
                  icon={<Search className="h-6 w-6" />}
                  title="Chưa có mẫu câu"
                  description={`Không tìm thấy câu ví dụ chứa "${committedQuery}".`}
                />
              ) : (
                <div className="space-y-2.5">
                  {(examplesTabQuery.data ?? []).map((ex, i) => (
                    <div key={ex.tatoebaId} className="yukihon-card-flat p-4">
                      <div className="flex items-start justify-between gap-3">
                        {furiganaTabQuery.data?.[i] ? (
                          <FuriganaText
                            className="text-base text-foreground"
                            tokens={furiganaTabQuery.data[i]}
                          />
                        ) : (
                          <p className="text-base text-foreground">{ex.jp}</p>
                        )}
                        <button
                          type="button"
                          onClick={() => speak(ex.jp)}
                          className="shrink-0 rounded-lg p-1.5 text-primary hover:bg-primary/10"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </div>
                      {ex.vi && <p className="mt-1 text-sm text-sky-700">{ex.vi}</p>}
                      {!ex.vi && ex.en && (
                        <p className="mt-1 text-sm text-muted-foreground">{ex.en}</p>
                      )}
                    </div>
                  ))}
                </div>
              ))}

            {/* ===== NGỮ PHÁP ===== */}
            {activeTab === "grammar" &&
              (grammarAllQuery.isFetching ? (
                <Loader />
              ) : grammarMatches.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="h-6 w-6" />}
                  title="Chưa có mẫu ngữ pháp"
                  description={`Không tìm thấy mẫu ngữ pháp khớp với "${committedQuery}".`}
                />
              ) : (
                <div className="space-y-3">
                  {grammarMatches.map((g) => (
                    <div key={g.id} className="yukihon-card-flat p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-lg font-semibold text-foreground">{g.pattern}</p>
                          {g.title && <p className="text-sm text-primary">{g.title}</p>}
                        </div>
                        {g.jlptLevel && (
                          <Badge className={levelBadge(g.jlptLevel)}>{g.jlptLevel}</Badge>
                        )}
                      </div>
                      {g.explanation && (
                        <p className="mt-2 text-sm leading-6 text-foreground/80">{g.explanation}</p>
                      )}
                      {g.exampleJP && (
                        <div className="mt-2 border-l-2 border-primary/30 pl-3">
                          <p className="text-sm text-foreground">{g.exampleJP}</p>
                          {g.exampleEN && (
                            <p className="mt-0.5 text-sm text-muted-foreground">{g.exampleEN}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
          </div>
        )}

        {/* Saved words (vocab context) */}
        {activeTab === "vocab" && (
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
              <Loader />
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
        )}

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

        {/* Word detail modal */}
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
                className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-border bg-card p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
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
                        onClick={() => handleTranslate(selectedWord)}
                        disabled={translating}
                      >
                        {translating ? "Đang dịch…" : "Dịch nghĩa sang tiếng Việt"}
                      </Button>
                    )}
                  </div>

                  {/* Constituent kanji breakdown */}
                  {detailKanjiChars.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Chữ Hán cấu thành
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {detailKanjiChars.map((ch, i) => {
                          const info = detailKanjiQueries[i]?.data;
                          return (
                            <button
                              key={ch}
                              type="button"
                              onClick={() => navigate(`/kanji/${encodeURIComponent(ch)}`)}
                              className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5 text-left transition hover:border-primary/40 hover:bg-primary/5"
                            >
                              <span className="shrink-0 text-2xl font-semibold text-foreground">
                                {ch}
                              </span>
                              <div className="min-w-0">
                                <p className="line-clamp-1 text-sm text-foreground">
                                  {info?.meaning || "…"}
                                </p>
                                {(info?.kunReadings?.length || info?.onReadings?.length) && (
                                  <p className="line-clamp-1 text-xs text-muted-foreground">
                                    {[...(info?.kunReadings ?? []), ...(info?.onReadings ?? [])]
                                      .slice(0, 3)
                                      .join("、")}
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Related / compound words */}
                  {relatedWords.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Từ liên quan
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {relatedWords.map((rw) => (
                          <button
                            key={rw.id}
                            type="button"
                            onClick={() => setSelectedWord(rw)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-left transition hover:border-primary/40 hover:bg-primary/5"
                          >
                            <span className="text-sm font-semibold text-foreground">
                              {rw.kanji || rw.hiragana}
                            </span>
                            {rw.hiragana && rw.kanji && (
                              <span className="text-xs text-muted-foreground">{rw.hiragana}</span>
                            )}
                          </button>
                        ))}
                      </div>
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
                          {examples.map((ex, i) => (
                            <li key={ex.tatoebaId} className="border-l-2 border-sky-200 pl-3">
                              {furiganaModalQuery.data?.[i] ? (
                                <FuriganaText
                                  className="text-sm text-foreground"
                                  tokens={furiganaModalQuery.data[i]}
                                />
                              ) : (
                                <p className="text-sm text-foreground">{ex.jp}</p>
                              )}
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
                      onClick={() => handleSaveWord(selectedWord)}
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
                      onClick={() =>
                        speak(selectedWord.hiragana || selectedWord.kanji || selectedWord.romaji)
                      }
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

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
  </div>
);

export default Dictionary;
