import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Languages, ArrowRightLeft, Copy, Check, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import WinterNightBackground from "@/components/WinterNightBackground";
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
      <div className="min-h-screen relative">
        <WinterNightBackground snowCount={30} sparkleCount={15} intensity="light" />
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <Languages className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Dịch thuật 翻訳
                </h1>
                <p className="text-muted-foreground">Dịch Việt ↔ Nhật ↔ Anh</p>
              </div>
            </div>
          </motion.div>

          {/* Translation Box */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card/40 backdrop-blur-md border-border/50 mb-8">
              <CardContent className="pt-6">
                {/* Language Selectors */}
                <div className="flex items-center gap-4 mb-4">
                  <Select value={sourceLang} onValueChange={setSourceLang}>
                    <SelectTrigger className="w-[180px] bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="ghost" size="icon" onClick={swapLanguages} className="rounded-full">
                    <ArrowRightLeft className="w-5 h-5" />
                  </Button>

                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger className="w-[180px] bg-background/50">
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
                      className="min-h-[200px] bg-background/50 text-lg resize-none"
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{sourceText.length} ký tự</span>
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <Textarea
                        placeholder="Bản dịch sẽ hiện ở đây..."
                        value={translatedText}
                        readOnly
                        className="min-h-[200px] bg-background/30 text-lg resize-none"
                      />
                      {translatedText && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={copyToClipboard}
                        >
                          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleTranslate}
                  disabled={loading || !sourceText.trim()}
                  className="w-full mt-4 h-12 text-lg"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Languages className="w-5 h-5 mr-2" />
                      Dịch
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Phrases */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-card/40 backdrop-blur-md border-border/50 mb-8">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                  Cụm từ thông dụng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {QUICK_PHRASES.map((phrase, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="p-3 rounded-lg bg-background/50 border border-border/50 hover:bg-background/70 transition-colors cursor-pointer"
                      onClick={() => {
                        setSourceText(phrase.ja);
                        setSourceLang("ja");
                        setTargetLang("vi");
                        setTranslatedText(phrase.vi);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-lg font-semibold text-white">{phrase.ja}</p>
                          <p className="text-sm text-cyan-400">{phrase.romaji}</p>
                          <p className="text-sm text-muted-foreground">{phrase.vi}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Grammar Cheat Sheet */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-card/40 backdrop-blur-md border-border/50">
              <CardHeader>
                <CardTitle className="text-xl">📝 Mẫu ngữ pháp phổ biến</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {GRAMMAR_EXAMPLES.map((g, index) => (
                    <div key={index} className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-purple-400">{g.pattern}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">{g.level}</span>
                      </div>
                      <p className="text-sm text-white">{g.meaning}</p>
                      <p className="text-xs text-muted-foreground mt-1">{g.example}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Translation;
