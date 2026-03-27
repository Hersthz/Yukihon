export type AdminTab = "lessons" | "vocabulary" | "grammar" | "quizzes";

export interface Lesson {
  id?: number;
  title: string;
  description: string;
  jlptLevel: string;
  category: string;
  content: string;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
  orderIndex: number;
  audioUrl: string;
  videoUrl: string;
  imageUrl: string;
  relatedVocabularyIds: number[];
  relatedGrammarIds: number[];
  relatedQuizIds: number[];
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
  lessonId?: number;
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
  reviewLessons: number;
  archivedLessons: number;
  totalVocabulary: number;
  totalGrammar: number;
  totalQuizzes: number;
  totalContentItems: number;
  levelBreakdown: ContentLevelBreakdown[];
}

export interface LessonVersion {
  id: number;
  lessonId: number;
  versionNumber: number;
  changeAction: string;
  title: string;
  description: string;
  content: string;
  jlptLevel: string;
  category: string;
  status: string;
  orderIndex: number;
  audioUrl: string;
  videoUrl: string;
  imageUrl: string;
  relatedVocabularyIds: number[];
  relatedGrammarIds: number[];
  relatedQuizIds: number[];
  createdAt: string;
}

export interface MediaUploadResult {
  url: string;
  filename: string;
  contentType: string;
  size: number;
}

export type EditableItem = Lesson | VocabItem | GrammarItem | QuizItem;
