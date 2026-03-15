import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VocabularyItem {
  id: number;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning: string;
  exampleSentenceJP?: string;
  exampleSentenceEN?: string;
  wordType?: string;
  jlptLevel?: string;
}

interface VocabularyCardProps {
  item: VocabularyItem;
  onLearn?: (id: number) => void;
  isLearned?: boolean;
}

const VocabularyCard = ({ item, onLearn, isLearned = false }: VocabularyCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance(item.kanji || item.hiragana);
    utterance.lang = "ja-JP";
    speechSynthesis.speak(utterance);
  };

  return (
    <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.99 }} className="h-full">
      <div
        className="h-full cursor-pointer overflow-hidden rounded-[22px] border border-white/70 bg-white/[0.84] shadow-[0_12px_30px_rgba(148,163,184,0.12)] backdrop-blur-xl"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ perspective: "1000px" }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          className="relative h-full w-full"
          initial={false}
          style={{
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transformStyle: "preserve-3d",
          }}
          transition={{ damping: 30, duration: 0.6, stiffness: 300, type: "spring" }}
        >
          <div
            className={`flex h-full flex-col justify-between p-5 ${isFlipped ? "pointer-events-none opacity-0" : "opacity-100"}`}
            style={{ backfaceVisibility: "hidden" }}
          >
            <div>
              <motion.span
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 inline-block rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm text-sky-700"
                initial={{ opacity: 0, scale: 0.85 }}
                transition={{ delay: 0.1 }}
              >
                {item.jlptLevel || "N4"}
              </motion.span>

              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-[linear-gradient(90deg,#0f172a,#0ea5e9,#8b5cf6)] bg-clip-text text-5xl font-bold text-transparent"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.15 }}
              >
                {item.kanji || item.hiragana}
              </motion.div>

              <motion.div
                animate={{ opacity: 1 }}
                className="space-y-3"
                initial={{ opacity: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-sky-600">Hiragana:</span>{" "}
                  <span className="text-lg font-medium text-slate-900">{item.hiragana}</span>
                </p>
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-violet-600">Romaji:</span>{" "}
                  <span className="text-base font-medium text-slate-800">{item.romaji}</span>
                </p>
                {item.wordType && (
                  <p className="text-xs italic text-slate-500">
                    Type: <span className="text-slate-700">{item.wordType}</span>
                  </p>
                )}
              </motion.div>
            </div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 pt-4"
              initial={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.25 }}
            >
              <Button
                size="sm"
                variant="ghost"
                className="rounded-xl border border-slate-200 bg-white/75 text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio();
                }}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-xl border border-slate-200 bg-white/75 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(item.kanji || item.hiragana);
                }}
              >
                <Copy className="h-4 w-4" />
                {copied && <span className="ml-1 text-xs">Copied!</span>}
              </Button>
            </motion.div>
          </div>

          <div
            className={`flex h-full flex-col justify-between p-5 ${!isFlipped ? "pointer-events-none opacity-0" : "opacity-100"}`}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 10 }} transition={{ delay: 0.1 }}>
              <p className="mb-4 bg-[linear-gradient(90deg,#8b5cf6,#ec4899)] bg-clip-text text-2xl font-semibold text-transparent">
                {item.meaning}
              </p>
              {item.exampleSentenceJP && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-violet-600">Example:</span>
                  </p>
                  <p className="italic text-slate-800">{item.exampleSentenceJP}</p>
                  {item.exampleSentenceEN && <p className="text-xs text-slate-500">{item.exampleSentenceEN}</p>}
                </div>
              )}
            </motion.div>

            {onLearn && (
              <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 10 }} transition={{ delay: 0.2 }}>
                <Button
                  className={`w-full font-semibold text-white ${isLearned ? "bg-emerald-500 hover:bg-emerald-400" : "bg-violet-500 hover:bg-violet-400"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLearn(item.id);
                  }}
                >
                  {isLearned ? "Learned" : "Mark as Learned"}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VocabularyCard;
