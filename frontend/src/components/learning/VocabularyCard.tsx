import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookmarkCheck,
  BookmarkPlus,
  Copy,
  GraduationCap,
  Trash2,
  Volume2,
  Clock3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SavedWord } from "@/pages/my-words/types";

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
  savedWord?: SavedWord | null;
  onSave?: (vocabularyId: number) => void;
  onRemove?: (savedWordId: number) => void;
  onToggleMastered?: (savedWordId: number) => void;
  isSaving?: boolean;
  isRemoving?: boolean;
  isTogglingMastered?: boolean;
}

const resolveSourceLabel = (folderName?: string) => {
  const normalized = folderName?.trim().toUpperCase();
  if (normalized === "DICTIONARY") {
    return { label: "Dictionary", className: "border-cyan-200 bg-cyan-50 text-cyan-700" };
  }
  if (normalized === "TRANSLATION") {
    return { label: "Translation", className: "border-amber-200 bg-amber-50 text-amber-700" };
  }
  if (normalized === "VOCABULARY") {
    return { label: "Vocabulary", className: "border-violet-200 bg-violet-50 text-violet-700" };
  }
  if (folderName && folderName.trim()) {
    return { label: folderName.trim(), className: "border-slate-200 bg-slate-50 text-slate-700" };
  }
  return null;
};

const VocabularyCard = ({
  item,
  savedWord = null,
  onSave,
  onRemove,
  onToggleMastered,
  isSaving = false,
  isRemoving = false,
  isTogglingMastered = false,
}: VocabularyCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const sourceBadge = resolveSourceLabel(savedWord?.folderName);
  const isSaved = Boolean(savedWord);
  const isMastered = savedWord?.mastered ?? false;
  const isDue = savedWord?.dueForReview ?? false;
  const isBusy = isSaving || isRemoving || isTogglingMastered;

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
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 flex flex-wrap gap-2"
                initial={{ opacity: 0, scale: 0.85 }}
                transition={{ delay: 0.1 }}
              >
                <Badge className="border-sky-200 bg-sky-50 text-sky-700">
                  {item.jlptLevel || "N4"}
                </Badge>
                {item.wordType ? (
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    {item.wordType}
                  </Badge>
                ) : null}
                {sourceBadge ? (
                  <Badge className={sourceBadge.className}>{sourceBadge.label}</Badge>
                ) : null}
                {isSaved ? (
                  <Badge className="border-violet-200 bg-violet-50 text-violet-700">Saved</Badge>
                ) : null}
                {isDue ? (
                  <Badge className="border-rose-200 bg-rose-50 text-rose-700">Due</Badge>
                ) : null}
                {isMastered ? (
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    Mastered
                  </Badge>
                ) : null}
              </motion.div>

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
              {isSaved && savedWord ? (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isBusy}
                  className="rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove?.(savedWord.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  {isRemoving ? "Removing..." : "Remove"}
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={isBusy}
                  className="rounded-xl bg-violet-500 text-white hover:bg-violet-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave?.(item.id);
                  }}
                >
                  <BookmarkPlus className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              )}
            </motion.div>
          </div>

          <div
            className={`flex h-full flex-col justify-between p-5 ${!isFlipped ? "pointer-events-none opacity-0" : "opacity-100"}`}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.1 }}
            >
              <p className="mb-4 bg-[linear-gradient(90deg,#8b5cf6,#ec4899)] bg-clip-text text-2xl font-semibold text-transparent">
                {item.meaning}
              </p>
              {item.exampleSentenceJP && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-violet-600">Example:</span>
                  </p>
                  <p className="italic text-slate-800">{item.exampleSentenceJP}</p>
                  {item.exampleSentenceEN && (
                    <p className="text-xs text-slate-500">{item.exampleSentenceEN}</p>
                  )}
                </div>
              )}
            </motion.div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.2 }}
            >
              {savedWord ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    {isMastered ? (
                      <BookmarkCheck className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Clock3 className="h-4 w-4 text-rose-600" />
                    )}
                    {isMastered
                      ? "This word is marked as mastered."
                      : isDue
                        ? "This word is due for review now."
                        : "This word is in your review system."}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Reviews: {savedWord.reviewCount ?? 0} · Interval:{" "}
                    {savedWord.reviewIntervalDays ?? 0} day(s)
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/70 px-3 py-3 text-sm text-violet-700">
                  Save this card to move it into My Words and track its review rhythm.
                </div>
              )}

              {savedWord ? (
                <Button
                  className={`w-full font-semibold text-white ${isMastered ? "bg-emerald-500 hover:bg-emerald-400" : "bg-slate-900 hover:bg-slate-800"}`}
                  disabled={isBusy}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMastered?.(savedWord.id);
                  }}
                >
                  <GraduationCap className="h-4 w-4" />
                  {isTogglingMastered
                    ? "Updating..."
                    : isMastered
                      ? "Unmark Mastered"
                      : "Mark as Mastered"}
                </Button>
              ) : (
                <Button
                  className="w-full bg-violet-500 font-semibold text-white hover:bg-violet-400"
                  disabled={isBusy}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave?.(item.id);
                  }}
                >
                  <BookmarkPlus className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save to My Words"}
                </Button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VocabularyCard;
