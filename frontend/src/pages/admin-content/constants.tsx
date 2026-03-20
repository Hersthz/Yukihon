import { BookOpen, FileText, PenTool, HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ColumnDef } from "@/components/admin/DynamicTable";
import { AdminTab, GrammarItem, Lesson, QuizItem, VocabItem } from "./types";

export interface TabConfig {
  value: AdminTab;
  label: string;
  icon: LucideIcon;
}

export const TABS: TabConfig[] = [
  { value: "lessons", label: "Bai hoc", icon: BookOpen },
  { value: "vocabulary", label: "Tu vung", icon: FileText },
  { value: "grammar", label: "Ngu phap", icon: PenTool },
  { value: "quizzes", label: "Cau hoi", icon: HelpCircle },
];

export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"];

export const lessonColumns: ColumnDef[] = [
  { key: "title", label: "Tieu de", sortable: true, render: (val) => <span className="font-medium">{String(val)}</span> },
  { key: "jlptLevel", label: "JLPT", type: "badge", badgeColor: () => "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  { key: "category", label: "Danh muc", sortable: true },
  { key: "orderIndex", label: "Order", type: "number" },
];

export const vocabColumns: ColumnDef[] = [
  { key: "kanji", label: "Kanji", sortable: true, render: (val) => <span className="font-bold text-lg">{String(val)}</span> },
  { key: "hiragana", label: "Hiragana", render: (val) => <span className="text-cyan-400">{String(val)}</span> },
  { key: "romaji", label: "Romaji", render: (val) => <span className="text-xs text-muted-foreground">{String(val)}</span> },
  { key: "meaning", label: "Nghia", sortable: true },
  { key: "jlptLevel", label: "JLPT", type: "badge", badgeColor: () => "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
];

export const grammarColumns: ColumnDef[] = [
  { key: "pattern", label: "Mau cau", sortable: true, render: (val) => <span className="font-bold">{String(val)}</span> },
  { key: "meaning", label: "Nghia", sortable: true },
  { key: "jlptLevel", label: "JLPT", type: "badge", badgeColor: () => "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
];

export const quizColumns: ColumnDef[] = [
  { key: "question", label: "Cau hoi", sortable: true, render: (val) => <span className="truncate">{String(val)}</span> },
  { key: "correctAnswer", label: "Dap an", type: "badge", badgeColor: () => "bg-green-500/20 text-green-400 border-green-500/30" },
  { key: "jlptLevel", label: "JLPT", type: "badge", badgeColor: () => "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  { key: "category", label: "Danh muc" },
];

export const createEmptyLesson = (): Lesson => ({
  title: "",
  description: "",
  jlptLevel: "N5",
  category: "",
  content: "",
  orderIndex: 0,
});

export const createEmptyVocab = (): VocabItem => ({
  kanji: "",
  hiragana: "",
  romaji: "",
  meaning: "",
  jlptLevel: "N5",
  category: "",
  exampleSentence: "",
  exampleMeaning: "",
});

export const createEmptyGrammar = (): GrammarItem => ({
  pattern: "",
  meaning: "",
  jlptLevel: "N5",
  explanation: "",
  exampleSentence: "",
  exampleMeaning: "",
});

export const createEmptyQuiz = (): QuizItem => ({
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
  jlptLevel: "N5",
  category: "",
  explanation: "",
});
