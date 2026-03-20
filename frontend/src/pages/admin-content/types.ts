export type AdminTab = "lessons" | "vocabulary" | "grammar" | "quizzes";

export interface Lesson {
  id?: number;
  title: string;
  description: string;
  jlptLevel: string;
  category: string;
  content: string;
  orderIndex: number;
}

export interface VocabItem {
  id?: number;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning: string;
  jlptLevel: string;
  category: string;
  exampleSentence: string;
  exampleMeaning: string;
}

export interface GrammarItem {
  id?: number;
  pattern: string;
  meaning: string;
  jlptLevel: string;
  explanation: string;
  exampleSentence: string;
  exampleMeaning: string;
}

export interface QuizItem {
  id?: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  jlptLevel: string;
  category: string;
  explanation: string;
}

export type EditableItem = Lesson | VocabItem | GrammarItem | QuizItem;
