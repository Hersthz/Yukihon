import { BookOpen, FileText, HelpCircle, PenTool } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ColumnDef } from "@/components/admin/DynamicTable";
import { AdminTab, GrammarItem, Lesson, QuizItem, VocabItem } from "./types";

export interface TabConfig {
  value: AdminTab;
  label: string;
  icon: LucideIcon;
}

export const TABS: TabConfig[] = [
  { value: "lessons", label: "Lessons", icon: BookOpen },
  { value: "vocabulary", label: "Vocabulary", icon: FileText },
  { value: "grammar", label: "Grammar", icon: PenTool },
  { value: "quizzes", label: "Quizzes", icon: HelpCircle },
];

export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
export const LEVEL_FILTERS = ["ALL", ...JLPT_LEVELS] as const;
export const LESSON_STATUSES = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"] as const;
export const QUIZ_TYPES = ["MULTIPLE_CHOICE", "FILL_IN_BLANK", "MATCHING", "LISTENING", "WRITING", "TRANSLATION"] as const;
export const QUIZ_DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export const WORD_TYPES = ["noun", "verb", "adjective", "adverb", "expression", "phrase"] as const;

export const lessonColumns: ColumnDef[] = [
  { key: "title", label: "Title", sortable: true, render: (val) => <span className="font-medium">{String(val)}</span> },
  { key: "jlptLevel", label: "JLPT", type: "badge", badgeColor: () => "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  { key: "category", label: "Category", sortable: true },
  { key: "status", label: "Status", type: "badge", badgeColor: (value) => value === "PUBLISHED" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : value === "REVIEW" ? "bg-violet-500/20 text-violet-300 border-violet-500/30" : value === "DRAFT" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  { key: "orderIndex", label: "Order", type: "number", sortable: true },
];

export const vocabColumns: ColumnDef[] = [
  { key: "kanji", label: "Kanji", sortable: true, render: (val) => <span className="font-bold text-lg">{String(val)}</span> },
  { key: "hiragana", label: "Hiragana", render: (val) => <span className="text-cyan-300">{String(val)}</span> },
  { key: "meaning", label: "Meaning", sortable: true },
  { key: "wordType", label: "Type", sortable: true },
  { key: "jlptLevel", label: "JLPT", type: "badge", badgeColor: () => "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
];

export const grammarColumns: ColumnDef[] = [
  { key: "title", label: "Title", sortable: true, render: (val) => <span className="font-medium">{String(val)}</span> },
  { key: "pattern", label: "Pattern", sortable: true, render: (val) => <span className="font-bold">{String(val)}</span> },
  { key: "jlptLevel", label: "JLPT", type: "badge", badgeColor: () => "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
];

export const quizColumns: ColumnDef[] = [
  { key: "title", label: "Title", sortable: true, render: (val) => <span className="font-medium">{String(val)}</span> },
  { key: "lessonId", label: "Lesson", sortable: true, render: (val) => <span>{val ? `#${String(val)}` : "General"}</span> },
  { key: "quizType", label: "Type", sortable: true },
  { key: "difficultyLevel", label: "Difficulty", sortable: true },
  { key: "correctAnswer", label: "Correct", type: "badge", badgeColor: () => "bg-green-500/20 text-green-300 border-green-500/30" },
  { key: "jlptLevel", label: "JLPT", type: "badge", badgeColor: () => "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
];

export const createEmptyLesson = (): Lesson => ({
  title: "",
  description: "",
  jlptLevel: "N5",
  category: "",
  content: "",
  status: "DRAFT",
  orderIndex: 0,
  audioUrl: "",
  videoUrl: "",
  imageUrl: "",
  relatedVocabularyIds: [],
  relatedGrammarIds: [],
  relatedQuizIds: [],
});

export const createEmptyVocab = (): VocabItem => ({
  kanji: "",
  hiragana: "",
  romaji: "",
  meaning: "",
  jlptLevel: "N5",
  wordType: "noun",
  exampleSentenceJP: "",
  exampleSentenceEN: "",
  additionalNotes: "",
});

export const createEmptyGrammar = (): GrammarItem => ({
  title: "",
  pattern: "",
  jlptLevel: "N5",
  explanation: "",
  usage: "",
  exampleJP: "",
  exampleEN: "",
  relatedPatterns: "",
  notes: "",
});

export const createEmptyQuiz = (): QuizItem => ({
  title: "",
  description: "",
  quizType: "MULTIPLE_CHOICE",
  difficultyLevel: "BEGINNER",
  jlptLevel: "N5",
  lessonId: undefined,
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
  explanation: "",
  audioUrl: "",
  imageUrl: "",
});
