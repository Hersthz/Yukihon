import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Languages, ArrowRightLeft, Copy, Check, Volume2,
  History, Bookmark, BookmarkCheck, Trash2, ChevronDown,
  ChevronUp, Clock, X, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import apiClient, { TranslationHistoryItem } from "@/lib/apiClient";

const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt 🇻🇳", flag: "🇻🇳" },
  { code: "ja", label: "日本語 🇯🇵", flag: "🇯🇵" },
  { code: "en", label: "English 🇺🇸", flag: "🇺🇸" },
  { code: "ko", label: "한국어 🇰🇷", flag: "🇰🇷" },
  { code: "zh", label: "中文 🇨🇳", flag: "🇨🇳" },
];

// Quick phrase suggestions for learning
const QUICK_PHRASES = [
  { ja: "おはようございます", vi: "Chào buổi sáng", romaji: "Ohayou gozaimasu" },
  { ja: "ありがとうございます", vi: "Cảm ơn rất nhiều", romaji: "Arigatou gozaimasu" },
  { ja: "すみません", vi: "Xin lỗi / Cho phép hỏi", romaji: "Sumimasen" },
  { ja: "いただきます", vi: "Tôi xin phép ăn", romaji: "Itadakimasu" },
  { ja: "お願いします", vi: "Làm ơn / Xin vui lòng", romaji: "Onegaishimasu" },
  { ja: "大丈夫です", vi: "Không sao đâu", romaji: "Daijoubu desu" },
  { ja: "頑張ってください", vi: "Hãy cố gắng lên", romaji: "Ganbatte kudasai" },
  { ja: "お疲れ様です", vi: "Bạn vất vả rồi", romaji: "Otsukaresama desu" },
];

const GRAMMAR_EXAMPLES = [
  { pattern: "〜ている", meaning: "Đang làm gì đó / Trạng thái", example: "食べている → Đang ăn", level: "N5" },
  { pattern: "〜たい", meaning: "Muốn làm gì", example: "行きたい → Muốn đi", level: "N5" },
  { pattern: "〜てもいい", meaning: "Có thể / Được phép", example: "見てもいい → Có thể xem", level: "N4" },
  { pattern: "〜なければならない", meaning: "Phải / Bắt buộc", example: "勉強しなければならない → Phải học", level: "N4" },
  { pattern: "〜ようにする", meaning: "Cố gắng để...", example: "早く寝るようにする → Cố ngủ sớm", level: "N3" },
  { pattern: "〜わけがない", meaning: "Không thể nào / Không có lý do", example: "分かるわけがない → Không thể hiểu được", level: "N2" },
];

const MAX_CHARS = 5000;

const langLabel = (code: string) => LANGUAGES.find((l) => l.code === code)?.flag ?? code;

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

const Translation = () => {
  const { toast } = useToast();
  const [sourceLang, setSourceLang] = useState("vi");
  const [targetLang, setTargetLang] = useState("ja");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // History & bookmark state
  const [showHistory, setShowHistory] = useState(false);
  const [historyTab, setHistoryTab] = useState<"all" | "bookmarks">("all");
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<TranslationHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);
  const [stats, setStats] = useState<{ totalTranslations: number; totalBookmarks: number } | null>(null);

  // ─── Stats (declared first so handleTranslate can reference) ────
  const loadStats = useCallback(async () => {
    try {
      const res = await apiClient.translation.getStats();
      setStats(res);
    } catch {
      /* silent */
    }
  }, []);

  // ─── History ──────────────────────────────────────────────────────
  const loadHistory = useCallback(async (page = 0) => {
    setHistoryLoading(true);
    try {
      const res = await apiClient.translation.getHistory(page, 10);
      setHistory(res.content);
      setHistoryPage(res.number);
      setHistoryTotalPages(res.totalPages);
    } catch {
      toast({ title: "Lỗi", description: "Không tải được lịch sử", variant: "destructive" });
    } finally {
      setHistoryLoading(false);
    }
  }, [toast]);

  const loadBookmarks = useCallback(async () => {
    try {
      const res = await apiClient.translation.getBookmarks();
      setBookmarks(res);
    } catch {
      /* silent */
    }
  }, []);

  // ─── Translate ───────────────────────────────────────────────────
  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) return;
    if (sourceText.length > MAX_CHARS) {
      toast({ title: "Quá dài", description: `Tối đa ${MAX_CHARS} ký tự`, variant: "destructive" });
      return;
    }
    if (sourceLang === targetLang) {
      toast({ title: "Lỗi", description: "Ngôn ngữ nguồn và đích phải khác nhau", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.translation.translate({
        sourceLang,
        targetLang,
        text: sourceText.trim(),
      });
      setTranslatedText(res.translatedText);
      // Refresh stats
      loadStats();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi dịch";
      setTranslatedText("");
      toast({ title: "Lỗi dịch", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [sourceText, sourceLang, targetLang, toast, loadStats]);

  // ─── Swap ────────────────────────────────────────────────────────
  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  // ─── Copy ────────────────────────────────────────────────────────
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(translatedText);
    setCopied(true);
    toast({ title: "Đã copy!", description: "Bản dịch đã được sao chép" });
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (showHistory) {
      if (historyTab === "all") loadHistory(0);
      else loadBookmarks();
    }
  }, [showHistory, historyTab, loadHistory, loadBookmarks]);

  const handleToggleBookmark = async (id: number) => {
    try {
      const updated = await apiClient.translation.toggleBookmark(id);
      setHistory((prev) => prev.map((h) => (h.id === id ? updated : h)));
      setBookmarks((prev) => {
        if (updated.bookmarked) return [updated, ...prev.filter((b) => b.id !== id)];
        return prev.filter((b) => b.id !== id);
      });
      loadStats();
    } catch {
      toast({ title: "Lỗi", description: "Không cập nhật được bookmark", variant: "destructive" });
    }
  };

  const handleDeleteHistory = async (id: number) => {
    try {
      await apiClient.translation.deleteHistory(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      loadStats();
    } catch {
      toast({ title: "Lỗi", description: "Không xoá được", variant: "destructive" });
    }
  };

  const handleClearAll = async () => {
    try {
      await apiClient.translation.clearHistory();
      setHistory([]);
      setBookmarks([]);
      loadStats();
      toast({ title: "Đã xoá", description: "Toàn bộ lịch sử dịch đã được xoá" });
    } catch {
      toast({ title: "Lỗi", description: "Không xoá được", variant: "destructive" });
    }
  };

  const fillFromHistory = (item: TranslationHistoryItem) => {
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setSourceText(item.sourceText);
    setTranslatedText(item.translatedText);
    setShowHistory(false);
  };

  // ─── Keyboard shortcut (Ctrl+Enter) ──────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleTranslate();
    }
  };

  const displayItems = historyTab === "all" ? history : bookmarks;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
                <Languages className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Dịch thuật 翻訳</h1>
                <p className="text-sm text-slate-400">Dịch Việt ↔ Nhật ↔ Anh ↔ Hàn ↔ Trung</p>
              </div>
            </div>

            {/* Stats + History toggle */}
            <div className="flex items-center gap-3">
              {stats && (
                <div className="flex gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5" /> {stats.totalTranslations} bản dịch
                  </span>
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5" /> {stats.totalBookmarks} đã lưu
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className={`gap-2 text-slate-400 hover:text-white ${showHistory ? "bg-white/[0.06] text-white" : ""}`}
              >
                <History className="w-4 h-4" />
                Lịch sử
                {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Translation Box */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden mb-8">
            <div className="h-0.5 bg-gradient-to-r from-purple-500/40 to-pink-500/40" />
            <div className="p-6">
              {/* Language Selectors */}
              <div className="flex items-center gap-4 mb-5">
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger className="w-[180px] bg-white/[0.03] border-white/[0.06] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="ghost" size="icon" onClick={swapLanguages} className="rounded-full text-slate-400 hover:text-white hover:bg-white/[0.06]">
                  <ArrowRightLeft className="w-5 h-5" />
                </Button>

                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger className="w-[180px] bg-white/[0.03] border-white/[0.06] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Text Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Textarea
                    placeholder="Nhập văn bản cần dịch... (Ctrl+Enter để dịch)"
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-h-[200px] bg-white/[0.03] border-white/[0.06] text-lg text-white placeholder:text-slate-500 resize-none focus:border-purple-500/40"
                    maxLength={MAX_CHARS}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-slate-500">{sourceText.length} / {MAX_CHARS} ký tự</span>
                    {sourceText.length > MAX_CHARS * 0.9 && (
                      <span className="text-xs text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Gần đầy
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <Textarea
                    placeholder="Bản dịch sẽ hiện ở đây..."
                    value={translatedText}
                    readOnly
                    className="min-h-[200px] bg-white/[0.02] border-white/[0.04] text-lg text-white placeholder:text-slate-600 resize-none"
                  />
                  {translatedText && (
                    <Button variant="ghost" size="sm" className="absolute top-2 right-2 text-slate-400 hover:text-white" onClick={copyToClipboard}>
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
              </div>

              <Button
                onClick={handleTranslate}
                disabled={loading || !sourceText.trim() || sourceLang === targetLang}
                className="w-full mt-5 h-12 text-lg bg-white/[0.06] hover:bg-purple-500/15 text-white border border-white/[0.08] hover:border-purple-500/30 transition-all"
              >
                {loading ? (
                  <div className="relative w-5 h-5">
                    <motion.div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                  </div>
                ) : (
                  <>
                    <Languages className="w-5 h-5 mr-2" />
                    Dịch (Ctrl+Enter)
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-emerald-500/40 to-teal-500/40" />
                <div className="p-6">
                  {/* Tabs + Clear */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setHistoryTab("all")}
                        className={`gap-2 ${historyTab === "all" ? "bg-white/[0.06] text-white" : "text-slate-400"}`}
                      >
                        <Clock className="w-4 h-4" /> Tất cả
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setHistoryTab("bookmarks")}
                        className={`gap-2 ${historyTab === "bookmarks" ? "bg-white/[0.06] text-white" : "text-slate-400"}`}
                      >
                        <BookmarkCheck className="w-4 h-4" /> Đã lưu
                      </Button>
                    </div>
                    {history.length > 0 && historyTab === "all" && (
                      <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-red-400 hover:text-red-300 gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Xoá tất cả
                      </Button>
                    )}
                  </div>

                  {/* Items */}
                  {historyLoading ? (
                    <div className="text-center py-8 text-slate-500">Đang tải...</div>
                  ) : displayItems.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      {historyTab === "all" ? "Chưa có lịch sử dịch" : "Chưa có bản dịch nào được lưu"}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {displayItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-emerald-500/20 hover:bg-white/[0.04] transition-all group cursor-pointer"
                          onClick={() => fillFromHistory(item)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                <span>{langLabel(item.sourceLang)} → {langLabel(item.targetLang)}</span>
                                <span>•</span>
                                <span>{timeAgo(item.createdAt)}</span>
                              </div>
                              <p className="text-sm text-white truncate">{item.sourceText}</p>
                              <p className="text-sm text-cyan-400 truncate mt-0.5">{item.translatedText}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-400 hover:text-amber-400"
                                onClick={() => handleToggleBookmark(item.id)}
                              >
                                {item.bookmarked ? (
                                  <BookmarkCheck className="w-4 h-4 text-amber-400" />
                                ) : (
                                  <Bookmark className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-400 hover:text-red-400"
                                onClick={() => handleDeleteHistory(item.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {historyTab === "all" && historyTotalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={historyPage === 0}
                        onClick={() => loadHistory(historyPage - 1)}
                        className="text-slate-400"
                      >
                        ← Trước
                      </Button>
                      <span className="text-xs text-slate-500 self-center">
                        {historyPage + 1} / {historyTotalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={historyPage >= historyTotalPages - 1}
                        onClick={() => loadHistory(historyPage + 1)}
                        className="text-slate-400"
                      >
                        Sau →
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Phrases */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden mb-8">
            <div className="h-0.5 bg-gradient-to-r from-cyan-500/40 to-blue-500/40" />
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-cyan-400" />
                Cụm từ thông dụng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {QUICK_PHRASES.map((phrase, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.04 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-cyan-500/20 hover:bg-white/[0.04] transition-all cursor-pointer"
                    onClick={() => {
                      setSourceText(phrase.ja);
                      setSourceLang("ja");
                      setTargetLang("vi");
                      setTranslatedText(phrase.vi);
                    }}
                  >
                    <p className="text-base font-semibold text-white">{phrase.ja}</p>
                    <p className="text-sm text-cyan-400 mt-0.5">{phrase.romaji}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{phrase.vi}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Grammar Cheat Sheet */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-amber-500/40 to-yellow-500/40" />
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Mẫu ngữ pháp phổ biến</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {GRAMMAR_EXAMPLES.map((g, index) => (
                  <div key={index} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-bold text-purple-400">{g.pattern}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">{g.level}</span>
                    </div>
                    <p className="text-sm text-white">{g.meaning}</p>
                    <p className="text-xs text-slate-500 mt-1">{g.example}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Translation;
