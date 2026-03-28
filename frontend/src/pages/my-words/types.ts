export type ReviewRating = "AGAIN" | "HARD" | "GOOD" | "EASY";
export type ReviewMode = "ALL" | "KANJI" | "VOCABULARY";

export interface SavedWord {
  id: number;
  vocabularyId: number;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning: string;
  exampleSentenceJP?: string;
  exampleSentenceEN?: string;
  jlptLevel: string;
  folderName: string;
  personalNote: string;
  mastered: boolean;
  reviewIntervalDays: number;
  easeFactor: number;
  repetitionCount: number;
  reviewCount: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  dueForReview: boolean;
  studyFocus: "KANJI" | "VOCABULARY";
  createdAt: string;
}

export interface WordStats {
  totalSaved: number;
  masteredCount: number;
  dueTodayCount: number;
  kanjiDueTodayCount: number;
  vocabularyDueTodayCount: number;
  folders: string[];
}
