import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Languages, ArrowRightLeft, Copy, Check, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt 🇻🇳", flag: "🇻🇳" },
  { code: "ja", label: "日本語 🇯🇵", flag: "🇯🇵" },
  { code: "en", label: "English 🇺🇸", flag: "🇺🇸" },
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

const Translation = () => {
  const { toast } = useToast();
  const [sourceLang, setSourceLang] = useState("vi");
  const [targetLang, setTargetLang] = useState("ja");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) return;
    setLoading(true);
    try {
      // Use free MyMemory Translation API
      const langPair = `${sourceLang}|${targetLang}`;
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${langPair}`
      );
      const data = await response.json();
      if (data.responseData?.translatedText) {
        setTranslatedText(data.responseData.translatedText);
      } else {
        setTranslatedText("Không thể dịch. Vui lòng thử lại.");
      }
    } catch {
      setTranslatedText("Lỗi kết nối. Vui lòng thử lại sau.");
      toast({ title: "Error", description: "Translation failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [sourceText, sourceLang, targetLang, toast]);

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
                <Languages className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Dịch thuật 翻訳</h1>
                <p className="text-sm text-slate-400">Dịch Việt ↔ Nhật ↔ Anh</p>
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
                      placeholder="Nhập văn bản cần dịch..."
                      value={sourceText}
                      onChange={(e) => setSourceText(e.target.value)}
                      className="min-h-[200px] bg-white/[0.03] border-white/[0.06] text-lg text-white placeholder:text-slate-500 resize-none focus:border-purple-500/40"
                    />
                    <span className="text-xs text-slate-500 mt-1 block">{sourceText.length} ký tự</span>
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
                  disabled={loading || !sourceText.trim()}
                  className="w-full mt-5 h-12 text-lg bg-white/[0.06] hover:bg-purple-500/15 text-white border border-white/[0.08] hover:border-purple-500/30 transition-all"
                >
                  {loading ? (
                    <div className="relative w-5 h-5">
                      <motion.div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                    </div>
                  ) : (
                    <>
                      <Languages className="w-5 h-5 mr-2" />
                      Dịch
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

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
