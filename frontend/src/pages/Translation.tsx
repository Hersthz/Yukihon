import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRightLeft,
  Bookmark,
  BookmarkCheck,
  Check,
  Clock,
  Copy,
  History,
  Languages,
  Plus,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import {
  dictionaryApi,
  myWordsApi,
  translationApi,
  type DictionaryEntry,
  type TranslationHistoryItem,
} from "@/api";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmptyState, MetricCard, PageHeader, PageSection } from "@/components/layout/UserPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
  { code: "ko", label: "한국어" },
  { code: "zh", label: "中文" },
];

const QUICK_PHRASES = [
  { ja: "おはようございます", vi: "Chào buổi sáng", romaji: "Ohayou gozaimasu" },
  { ja: "ありがとうございます", vi: "Cảm ơn rất nhiều", romaji: "Arigatou gozaimasu" },
  { ja: "すみません", vi: "Xin lỗi / Cho phép hỏi", romaji: "Sumimasen" },
  { ja: "大丈夫です", vi: "Không sao đâu", romaji: "Daijoubu desu" },
];

const MAX_CHARS = 5000;

const langLabel = (code: string) => LANGUAGES.find((item) => item.code === code)?.label || code;

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
};

const normalizeSavedStatuses = (statuses: Record<string, boolean>) =>
  Object.fromEntries(Object.entries(statuses).map(([id, saved]) => [Number(id), saved])) as Record<
    number,
    boolean
  >;

const JAPANESE_GROUP_REGEX = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]+/gu;
const HAN_GROUP_REGEX = /\p{Script=Han}+/gu;

const extractJapaneseFragments = (text: string) => {
  const fragments: string[] = [];
  const groups = text.match(JAPANESE_GROUP_REGEX) ?? [];

  groups.forEach((group) => {
    if (group.length >= 2) {
      fragments.push(group);
    }

    const hanGroups = group.match(HAN_GROUP_REGEX) ?? [];
    hanGroups.forEach((hanGroup) => {
      fragments.push(hanGroup);

      if (hanGroup.length > 1) {
        for (let size = Math.min(4, hanGroup.length); size >= 2; size -= 1) {
          for (let index = 0; index <= hanGroup.length - size; index += 1) {
            fragments.push(hanGroup.slice(index, index + size));
          }
        }
      }
    });
  });

  return Array.from(
    new Set(fragments.map((item) => item.trim()).filter((item) => item.length >= 2))
  ).slice(0, 12);
};

const splitSuggestionCandidates = (text: string) => {
  const normalized = text.trim();
  if (!normalized) return [];

  const tokens = normalized
    .replace(/[\r\n]+/g, " ")
    .split(/[\s,.;!?、。！？]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

  return Array.from(
    new Set([normalized, ...extractJapaneseFragments(normalized), ...tokens])
  ).slice(0, 8);
};

const buildSuggestionQueries = (
  sourceLang: string,
  targetLang: string,
  sourceText: string,
  translatedText: string
) => {
  const japaneseCandidate =
    sourceLang === "ja" ? sourceText : targetLang === "ja" ? translatedText : "";
  const meaningCandidate =
    sourceLang === "ja" ? translatedText : targetLang === "ja" ? sourceText : "";

  return Array.from(
    new Set([
      ...splitSuggestionCandidates(japaneseCandidate),
      ...splitSuggestionCandidates(meaningCandidate),
    ])
  ).slice(0, 5);
};

const Translation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sourceLang, setSourceLang] = useState("vi");
  const [targetLang, setTargetLang] = useState("ja");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyTab, setHistoryTab] = useState<"all" | "bookmarks">("all");
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<TranslationHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);
  const [stats, setStats] = useState<{ totalTranslations: number; totalBookmarks: number } | null>(
    null
  );
  const [suggestions, setSuggestions] = useState<DictionaryEntry[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [savedStatuses, setSavedStatuses] = useState<Record<number, boolean>>({});
  const [savingWordId, setSavingWordId] = useState<number | null>(null);
  const [hasSuggestionLookup, setHasSuggestionLookup] = useState(false);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setSavedStatuses({});
    setHasSuggestionLookup(false);
  }, []);

  const loadSavedStatuses = useCallback(async (vocabularyIds: number[]) => {
    if (vocabularyIds.length === 0) {
      setSavedStatuses({});
      return;
    }

    try {
      const response = await myWordsApi.getSavedStatuses(vocabularyIds);
      setSavedStatuses(normalizeSavedStatuses(response));
    } catch {
      setSavedStatuses({});
    }
  }, []);

  const loadSuggestionWords = useCallback(
    async (
      nextSourceLang: string,
      nextTargetLang: string,
      nextSourceText: string,
      nextTranslatedText: string
    ) => {
      const queries = buildSuggestionQueries(
        nextSourceLang,
        nextTargetLang,
        nextSourceText,
        nextTranslatedText
      );
      setHasSuggestionLookup(true);

      if (queries.length === 0) {
        setSuggestions([]);
        setSavedStatuses({});
        return;
      }

      setSuggestionsLoading(true);
      try {
        const collected = new Map<number, DictionaryEntry>();

        for (const query of queries) {
          const matches = await dictionaryApi.search(query);
          matches.forEach((item) => {
            if (!collected.has(item.id) && collected.size < 6) {
              collected.set(item.id, item);
            }
          });
          if (collected.size >= 6) {
            break;
          }
        }

        const nextSuggestions = Array.from(collected.values());
        setSuggestions(nextSuggestions);
        await loadSavedStatuses(nextSuggestions.map((item) => item.id));
      } catch {
        setSuggestions([]);
        setSavedStatuses({});
      } finally {
        setSuggestionsLoading(false);
      }
    },
    [loadSavedStatuses]
  );

  const loadStats = useCallback(async () => {
    try {
      const response = await translationApi.getStats();
      setStats(response);
    } catch {
      // silent
    }
  }, []);

  const loadHistory = useCallback(
    async (page = 0) => {
      setHistoryLoading(true);
      try {
        const response = await translationApi.getHistory(page, 10);
        setHistory(response.content);
        setHistoryPage(response.number);
        setHistoryTotalPages(response.totalPages);
      } catch {
        toast({
          title: "Không tải được lịch sử",
          description: "Vui lòng thử lại.",
          variant: "destructive",
        });
      } finally {
        setHistoryLoading(false);
      }
    },
    [toast]
  );

  const loadBookmarks = useCallback(async () => {
    try {
      const response = await translationApi.getBookmarks();
      setBookmarks(response);
    } catch {
      // silent
    }
  }, []);

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) return;
    if (sourceText.length > MAX_CHARS) {
      toast({
        title: "Văn bản quá dài",
        description: `Tối đa ${MAX_CHARS} ký tự.`,
        variant: "destructive",
      });
      return;
    }
    if (sourceLang === targetLang) {
      toast({
        title: "Chọn hai ngôn ngữ khác nhau",
        description: "Nguồn và đích không thể trùng nhau.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await translationApi.translate({
        sourceLang,
        targetLang,
        text: sourceText.trim(),
      });
      setTranslatedText(response.translatedText);
      void loadStats();
      void loadSuggestionWords(
        response.sourceLang,
        response.targetLang,
        response.sourceText,
        response.translatedText
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không thể dịch lúc này.";
      setTranslatedText("");
      clearSuggestions();
      toast({ title: "Dịch chưa thành công", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [clearSuggestions, loadStats, loadSuggestionWords, sourceLang, sourceText, targetLang, toast]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      void handleTranslate();
    }
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
    clearSuggestions();
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(translatedText);
    setCopied(true);
    toast({ title: "Đã sao chép", description: "Bản dịch đã vào clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (!showHistory) return;
    if (historyTab === "all") {
      void loadHistory(0);
    } else {
      void loadBookmarks();
    }
  }, [historyTab, loadBookmarks, loadHistory, showHistory]);

  const handleToggleBookmark = async (id: number) => {
    try {
      const updated = await translationApi.toggleBookmark(id);
      setHistory((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setBookmarks((prev) => {
        if (updated.bookmarked) return [updated, ...prev.filter((item) => item.id !== id)];
        return prev.filter((item) => item.id !== id);
      });
      void loadStats();
    } catch {
      toast({
        title: "Không cập nhật được bookmark",
        description: "Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteHistory = async (id: number) => {
    try {
      await translationApi.deleteHistory(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      setBookmarks((prev) => prev.filter((item) => item.id !== id));
      void loadStats();
    } catch {
      toast({
        title: "Không xoá được mục này",
        description: "Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    try {
      await translationApi.clearHistory();
      setHistory([]);
      setBookmarks([]);
      void loadStats();
      toast({ title: "Đã xoá lịch sử", description: "Lịch sử dịch đã được làm trống." });
    } catch {
      toast({
        title: "Không thể xoá lịch sử",
        description: "Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const fillFromHistory = (item: TranslationHistoryItem) => {
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setSourceText(item.sourceText);
    setTranslatedText(item.translatedText);
    setShowHistory(false);
    void loadSuggestionWords(
      item.sourceLang,
      item.targetLang,
      item.sourceText,
      item.translatedText
    );
  };

  const handleSaveSuggestedWord = async (word: DictionaryEntry) => {
    if (savedStatuses[word.id]) {
      toast({
        title: "Đã có trong sổ tay",
        description: `${word.kanji || word.hiragana} đang nằm trong My Words rồi.`,
      });
      return;
    }

    try {
      setSavingWordId(word.id);
      const trimmedSource = sourceText.trim();
      const trimmedTranslation = translatedText.trim();
      const personalNote =
        trimmedSource && trimmedTranslation
          ? `Từ bản dịch: ${trimmedSource.slice(0, 120)} -> ${trimmedTranslation.slice(0, 120)}`
          : undefined;

      await myWordsApi.saveWord({
        vocabularyId: word.id,
        folderName: "Translation",
        personalNote,
      });
      setSavedStatuses((prev) => ({ ...prev, [word.id]: true }));
      toast({
        title: "Đã lưu",
        description: `${word.kanji || word.hiragana} đã được thêm vào My Words.`,
        action: (
          <ToastAction altText="Mở My Words" onClick={() => navigate("/my-words")}>
            Mở My Words
          </ToastAction>
        ),
      });
    } catch {
      toast({
        title: "Lưu chưa thành công",
        description: "Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setSavingWordId(null);
    }
  };

  const visibleHistory = historyTab === "all" ? history : bookmarks;
  const canSuggestVocabulary = sourceLang === "ja" || targetLang === "ja";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1440px]">
        <PageHeader
          icon={<Languages className="h-6 w-6 text-violet-600" />}
          title="Dịch"
          description="Bố cục thấp hơn để bạn vừa dịch, vừa nhìn lịch sử và cụm mẫu mà không bị phải cuộn quá nhiều."
          eyebrow="Dịch thuật"
          action={
            <>
              <Button
                className="rounded-2xl border-border bg-card text-foreground/80 hover:bg-card"
                disabled={loading}
                onClick={() => setShowHistory((prev) => !prev)}
                variant="outline"
              >
                <History className="mr-2 h-4 w-4" />
                {showHistory ? "Ẩn lịch sử" : "Mở lịch sử"}
              </Button>
              <Button
                className="rounded-2xl bg-violet-500 text-white hover:bg-violet-400"
                disabled={loading}
                onClick={() => void handleTranslate()}
              >
                <Languages className="mr-2 h-4 w-4" />
                {loading ? "Đang dịch..." : "Dịch ngay"}
              </Button>
            </>
          }
        />

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <MetricCard
            hint="Tổng số lần đã dịch"
            icon={<Languages className="h-4 w-4 text-sky-500" />}
            label="Lượt dịch"
            value={stats?.totalTranslations ?? "-"}
          />
          <MetricCard
            hint="Bookmark đang lưu"
            icon={<BookmarkCheck className="h-4 w-4 text-amber-500" />}
            label="Đã lưu"
            value={stats?.totalBookmarks ?? "-"}
          />
          <MetricCard
            hint="Phím tắt Ctrl/Cmd + Enter"
            icon={<Clock className="h-4 w-4 text-violet-500" />}
            label="Tốc độ"
            value="Nhanh"
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <PageSection
              title="Khung dịch"
              description="Hai ô dịch đặt ngang để dễ so sánh và tránh mất nhịp đọc."
            >
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <Select onValueChange={setSourceLang} value={sourceLang}>
                  <SelectTrigger className="h-11 w-[180px] rounded-2xl border-border bg-card text-foreground/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        {language.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  className="rounded-2xl border-border bg-white text-foreground/80"
                  onClick={swapLanguages}
                  size="icon"
                  variant="outline"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>

                <Select onValueChange={setTargetLang} value={targetLang}>
                  <SelectTrigger className="h-11 w-[180px] rounded-2xl border-border bg-card text-foreground/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        {language.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-[22px] border border-border bg-card p-3">
                  <Textarea
                    className="min-h-[220px] resize-none rounded-[18px] border-none bg-muted text-base text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
                    maxLength={MAX_CHARS}
                    onChange={(event) => setSourceText(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập văn bản cần dịch..."
                    value={sourceText}
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {sourceText.length} / {MAX_CHARS} ký tự
                    </span>
                    {sourceText.length > MAX_CHARS * 0.9 && (
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Sắp chạm giới hạn
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative rounded-[22px] border border-border bg-card p-3">
                  <Textarea
                    className="min-h-[220px] resize-none rounded-[18px] border-none bg-sky-50/65 text-base text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
                    placeholder="Bản dịch sẽ hiển thị ở đây..."
                    readOnly
                    value={translatedText}
                  />
                  {translatedText && (
                    <Button
                      className="absolute right-5 top-5 rounded-xl"
                      onClick={copyToClipboard}
                      size="icon"
                      variant="ghost"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </PageSection>

            {translatedText && canSuggestVocabulary && (
              <PageSection
                title="Gợi ý lưu vào My Words"
                description="Sau khi dịch xong, mình thử dò các mục từ điển gần nhất để bạn lưu thẳng vào sổ tay."
              >
                {suggestionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-10 w-10 rounded-full border-4 border-violet-100 border-t-violet-500 animate-spin" />
                  </div>
                ) : suggestions.length === 0 && hasSuggestionLookup ? (
                  <EmptyState
                    icon={<Languages className="h-6 w-6" />}
                    title="Chưa tìm thấy vocab phù hợp"
                    description="Nếu đây là cả một câu dài, bạn có thể rút ngắn từ khóa hoặc mở trang Dictionary để tra kỹ hơn."
                  />
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {suggestions.map((word) => {
                      const isSaved = !!savedStatuses[word.id];
                      const isSaving = savingWordId === word.id;

                      return (
                        <div
                          key={word.id}
                          className="rounded-[20px] border border-border bg-card p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold text-foreground">
                                {word.kanji || word.hiragana}
                              </p>
                              <p className="mt-1 text-sm text-sky-700">
                                {word.hiragana} · {word.romaji}
                              </p>
                            </div>
                            {word.jlptLevel ? (
                              <Badge className="rounded-full border border-violet-200 bg-violet-50 text-violet-700">
                                {word.jlptLevel}
                              </Badge>
                            ) : null}
                          </div>

                          <p className="mt-3 text-sm text-muted-foreground">{word.meaning}</p>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-xs text-muted-foreground">
                              {word.wordType || "Từ vựng"}
                            </span>
                            <Button
                              className="rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 disabled:bg-emerald-50 disabled:text-emerald-700"
                              onClick={() => void handleSaveSuggestedWord(word)}
                              size="sm"
                              variant="ghost"
                              disabled={isSaved || isSaving}
                            >
                              {isSaved ? (
                                <Check className="mr-1 h-4 w-4" />
                              ) : (
                                <Plus className="mr-1 h-4 w-4" />
                              )}
                              {isSaved ? "Đã lưu" : isSaving ? "Đang lưu..." : "Lưu vào My Words"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </PageSection>
            )}

            <PageSection
              title="Cụm mẫu thường dùng"
              description="Giữ sẵn vài cụm ngắn để dịch nhanh và học bằng ví dụ thật."
            >
              <div className="grid gap-3 md:grid-cols-2">
                {QUICK_PHRASES.map((phrase) => (
                  <button
                    key={phrase.ja}
                    className="rounded-[20px] border border-border bg-card p-4 text-left transition hover:-translate-y-1 hover:bg-sky-50/60"
                    onClick={() => {
                      setSourceText(phrase.ja);
                      setSourceLang("ja");
                      setTargetLang("vi");
                      setTranslatedText(phrase.vi);
                      clearSuggestions();
                    }}
                    type="button"
                  >
                    <p className="text-base font-semibold text-foreground">{phrase.ja}</p>
                    <p className="mt-1 text-sm text-violet-600">{phrase.romaji}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{phrase.vi}</p>
                  </button>
                ))}
              </div>
            </PageSection>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {showHistory && (
                <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 10 }}>
                  <PageSection
                    action={
                      historyTab === "all" && history.length > 0 ? (
                        <Button
                          className="rounded-xl text-rose-600 hover:text-rose-700"
                          onClick={handleClearAll}
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Xoá tất cả
                        </Button>
                      ) : null
                    }
                    title="Lịch sử dịch"
                    description="Ẩn/hiện theo nhu cầu để dashboard dịch luôn gọn."
                  >
                    <div className="mb-3 flex gap-2">
                      <Button
                        className={
                          historyTab === "all"
                            ? "rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                            : "rounded-xl border-border bg-white text-muted-foreground"
                        }
                        onClick={() => setHistoryTab("all")}
                        size="sm"
                        variant={historyTab === "all" ? "default" : "outline"}
                      >
                        <Clock className="mr-1 h-4 w-4" />
                        Tất cả
                      </Button>
                      <Button
                        className={
                          historyTab === "bookmarks"
                            ? "rounded-xl bg-amber-500 text-white hover:bg-amber-400"
                            : "rounded-xl border-border bg-white text-muted-foreground"
                        }
                        onClick={() => setHistoryTab("bookmarks")}
                        size="sm"
                        variant={historyTab === "bookmarks" ? "default" : "outline"}
                      >
                        <BookmarkCheck className="mr-1 h-4 w-4" />
                        Đã lưu
                      </Button>
                    </div>

                    {historyLoading ? (
                      <div className="flex items-center justify-center py-14">
                        <div className="h-10 w-10 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
                      </div>
                    ) : visibleHistory.length === 0 ? (
                      <EmptyState
                        description="Lịch sử sẽ hiển thị lại ngay khi bạn thực hiện hoặc lưu bản dịch mới."
                        icon={<History className="h-6 w-6" />}
                        title="Chưa có dữ liệu"
                      />
                    ) : (
                      <div className="space-y-2">
                        {visibleHistory.map((item) => (
                          <button
                            key={item.id}
                            className="w-full rounded-[18px] border border-border bg-card p-3 text-left transition hover:bg-muted"
                            onClick={() => fillFromHistory(item)}
                            type="button"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>
                                    {langLabel(item.sourceLang)} → {langLabel(item.targetLang)}
                                  </span>
                                  <span>•</span>
                                  <span>{timeAgo(item.createdAt)}</span>
                                </div>
                                <p className="truncate text-sm text-foreground">
                                  {item.sourceText}
                                </p>
                                <p className="mt-1 truncate text-sm text-sky-700">
                                  {item.translatedText}
                                </p>
                              </div>
                              <div
                                className="flex shrink-0 items-center gap-1"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <Button
                                  className="h-8 w-8 rounded-xl"
                                  onClick={() => void handleToggleBookmark(item.id)}
                                  size="icon"
                                  variant="ghost"
                                >
                                  {item.bookmarked ? (
                                    <BookmarkCheck className="h-4 w-4 text-amber-500" />
                                  ) : (
                                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                                <Button
                                  className="h-8 w-8 rounded-xl"
                                  onClick={() => void handleDeleteHistory(item.id)}
                                  size="icon"
                                  variant="ghost"
                                >
                                  <X className="h-4 w-4 text-rose-500" />
                                </Button>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {historyTab === "all" && historyTotalPages > 1 && (
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <Button
                          className="rounded-xl"
                          disabled={historyPage === 0}
                          onClick={() => void loadHistory(historyPage - 1)}
                          size="sm"
                          variant="outline"
                        >
                          Trước
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {historyPage + 1} / {historyTotalPages}
                        </span>
                        <Button
                          className="rounded-xl"
                          disabled={historyPage >= historyTotalPages - 1}
                          onClick={() => void loadHistory(historyPage + 1)}
                          size="sm"
                          variant="outline"
                        >
                          Sau
                        </Button>
                      </div>
                    )}
                  </PageSection>
                </motion.div>
              )}
            </AnimatePresence>

            <PageSection
              title="Gợi ý dùng nhanh"
              description="Một vài nguyên tắc để thao tác ít hơn nhưng vẫn hiệu quả."
            >
              <div className="space-y-3">
                <div className="rounded-[18px] border border-violet-200 bg-violet-50/70 p-4">
                  <p className="text-sm font-semibold text-violet-800">Ctrl/Cmd + Enter</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Dịch ngay mà không cần rê chuột xuống nút bấm.
                  </p>
                </div>
                <div className="rounded-[18px] border border-sky-200 bg-sky-50/70 p-4">
                  <p className="text-sm font-semibold text-sky-800">Đảo ngôn ngữ</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Đảo chiều dịch khi cần đối chiếu nhanh hai chiều Việt - Nhật.
                  </p>
                </div>
                <div className="rounded-[18px] border border-amber-200 bg-amber-50/70 p-4">
                  <p className="text-sm font-semibold text-amber-800">Lưu bản dịch tốt</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Bookmark những câu bạn muốn ôn lại sau để biến lịch sử thành tài liệu học.
                  </p>
                </div>
                <Button
                  className="w-full rounded-2xl border-border bg-white text-foreground/80"
                  variant="outline"
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  Phát âm văn bản sau khi dịch
                </Button>
              </div>
            </PageSection>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Translation;
