export type AdminTab = "lessons" | "vocabulary" | "grammar" | "quizzes";

export interface Lesson {
  id?: number;
  title: string;
  description: string;
  jlptLevel: string;
  category: string;
  content: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  orderIndex: number;
  audioUrl: string;
  videoUrl: string;
  imageUrl: string;
  createdAt?: string;
}

export interface VocabItem {
  id?: number;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning: string;
  jlptLevel: string;
  wordType: string;
  exampleSentenceJP: string;
  exampleSentenceEN: string;
  additionalNotes: string;
}

export interface GrammarItem {
  id?: number;
  title: string;
  pattern: string;
  jlptLevel: string;
  explanation: string;
  usage: string;
  exampleJP: string;
  exampleEN: string;
  relatedPatterns: string;
  notes: string;
}

export interface QuizItem {
  id?: number;
  title: string;
  description: string;
  quizType: string;
  difficultyLevel: string;
  jlptLevel: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  audioUrl: string;
  imageUrl: string;
}

export interface ContentLevelBreakdown {
  jlptLevel: string;
  lessons: number;
  vocabulary: number;
  grammar: number;
  quizzes: number;
  total: number;
}

export interface ContentOverview {
  totalLessons: number;
  publishedLessons: number;
  draftLessons: number;
  archivedLessons: number;
  totalVocabulary: number;
  totalGrammar: number;
  totalQuizzes: number;
  totalContentItems: number;
  levelBreakdown: ContentLevelBreakdown[];
}

export type EditableItem = Lesson | VocabItem | GrammarItem | QuizItem;
