// src/components/learning/VocabularyCard.tsx

import { motion } from "framer-motion";
import { Volume2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import GlassCard from "@/components/genshin/GlassCard";

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
    const utterance = new SpeechSynthesisUtterance(item.kanji);
    utterance.lang = "ja-JP";
    speechSynthesis.speak(utterance);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.95 }}
      className="h-full"
    >
      <GlassCard 
        className="h-full cursor-pointer perspective" 
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ perspective: "1000px" }}
      >
        <motion.div
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 30 }}
          className="relative h-full w-full"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            className={`p-6 h-full flex flex-col justify-between ${
              isFlipped ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            style={{ backfaceVisibility: "hidden" }}
          >
            <div>
              <motion.span
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-block px-3 py-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-cyan-300 rounded-full text-sm mb-4 border border-cyan-500/50"
              >
                {item.jlptLevel || "N4"}
              </motion.span>
              <motion.div 
                className="text-5xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {item.kanji}
              </motion.div>
              <motion.div 
                className="space-y-3 text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-sm text-gray-400">
                  <span className="text-cyan-400 font-semibold">Hiragana:</span> <span className="text-lg font-medium">{item.hiragana}</span>
                </p>
                <p className="text-sm text-gray-400">
                  <span className="text-blue-400 font-semibold">Romaji:</span> <span className="text-base font-medium">{item.romaji}</span>
                </p>
                {item.wordType && (
                  <p className="text-xs text-gray-500 italic">Type: <span className="text-gray-300">{item.wordType}</span></p>
                )}
              </motion.div>
            </div>

            <motion.div 
              className="flex gap-2 pt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio();
                }}
                className="hover:bg-cyan-500/20 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(item.kanji);
                }}
                className="hover:bg-blue-500/20 transition-colors"
              >
                <Copy className="w-4 h-4" />
                {copied && <span className="text-xs ml-1">Copied!</span>}
              </Button>
            </motion.div>
          </div>

          {/* Back */}
          <div
            className={`p-6 h-full flex flex-col justify-between ${
              !isFlipped ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-2xl font-semibold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-4">
                {item.meaning}
              </p>
              {item.exampleSentenceJP && (
                <div className="space-y-3">
                  <p className="text-gray-300 text-sm">
                    <span className="text-purple-400 font-semibold">Example:</span>
                  </p>
                  <p className="text-gray-200 italic">{item.exampleSentenceJP}</p>
                  {item.exampleSentenceEN && (
                    <p className="text-xs text-gray-400">{item.exampleSentenceEN}</p>
                  )}
                </div>
              )}
            </motion.div>

            {onLearn && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLearn(item.id);
                  }}
                  className={`w-full font-semibold transition-all ${
                    isLearned
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  }`}
                >
                  {isLearned ? "✓ Learned" : "Mark as Learned"}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </GlassCard>
    </motion.div>
  );
};

export default VocabularyCard;
