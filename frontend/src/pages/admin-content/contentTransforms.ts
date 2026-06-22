import { EditableItem, GrammarItem, Lesson, LessonVersion, QuizItem, VocabItem } from "./types";

const safeString = (value: unknown): string =>
  typeof value === "string" ? value : value == null ? "" : String(value);
const parseIdList = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value.map((item) => Number(item)).filter((item) => Number.isFinite(item));
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
};

const parseOptions = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => safeString(item));
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => safeString(item)) : [];
  } catch {
    return [];
  }
};

const resolveCorrectAnswerKey = (
  options: string[],
  correctAnswer: string
): QuizItem["correctAnswer"] => {
  const optionKeys: QuizItem["correctAnswer"][] = ["A", "B", "C", "D"];
  const normalizedAnswer = correctAnswer.trim();

  if (optionKeys.includes(normalizedAnswer as QuizItem["correctAnswer"])) {
    return normalizedAnswer as QuizItem["correctAnswer"];
  }

  const matchIndex = options.findIndex((option) => option === normalizedAnswer);
  return optionKeys[matchIndex >= 0 ? matchIndex : 0];
};

export const normalizeLesson = (row: Record<string, unknown>): Lesson => ({
  id: Number(row.id),
  title: safeString(row.title),
  description: safeString(row.description),
  jlptLevel: safeString(row.jlptLevel) || "N5",
  category: safeString(row.category),
  content: safeString(row.content),
  status: (safeString(row.status) || "DRAFT") as Lesson["status"],
  orderIndex: Number(row.orderIndex ?? 0),
  audioUrl: safeString(row.audioUrl),
  videoUrl: safeString(row.videoUrl),
  imageUrl: safeString(row.imageUrl),
  relatedVocabularyIds: parseIdList(row.relatedVocabularyIds),
  relatedGrammarIds: parseIdList(row.relatedGrammarIds),
  relatedQuizIds: parseIdList(row.relatedQuizIds),
  createdAt: safeString(row.createdAt),
});

export const normalizeLessonVersion = (row: Record<string, unknown>): LessonVersion => ({
  id: Number(row.id),
  lessonId: Number(row.lessonId),
  versionNumber: Number(row.versionNumber ?? 0),
  changeAction: safeString(row.changeAction),
  title: safeString(row.title),
  description: safeString(row.description),
  content: safeString(row.content),
  jlptLevel: safeString(row.jlptLevel) || "N5",
  category: safeString(row.category),
  status: safeString(row.status) || "DRAFT",
  orderIndex: Number(row.orderIndex ?? 0),
  audioUrl: safeString(row.audioUrl),
  videoUrl: safeString(row.videoUrl),
  imageUrl: safeString(row.imageUrl),
  relatedVocabularyIds: parseIdList(row.relatedVocabularyIds),
  relatedGrammarIds: parseIdList(row.relatedGrammarIds),
  relatedQuizIds: parseIdList(row.relatedQuizIds),
  createdAt: safeString(row.createdAt),
});

export const normalizeVocabulary = (row: Record<string, unknown>): VocabItem => ({
  id: Number(row.id),
  kanji: safeString(row.kanji),
  hiragana: safeString(row.hiragana),
  romaji: safeString(row.romaji),
  meaning: safeString(row.meaning),
  jlptLevel: safeString(row.jlptLevel) || "N5",
  wordType: safeString(row.wordType) || "noun",
  exampleSentenceJP: safeString(row.exampleSentenceJP),
  exampleSentenceEN: safeString(row.exampleSentenceEN),
  additionalNotes: safeString(row.additionalNotes),
});

export const normalizeGrammar = (row: Record<string, unknown>): GrammarItem => ({
  id: Number(row.id),
  title: safeString(row.title),
  pattern: safeString(row.pattern),
  jlptLevel: safeString(row.jlptLevel) || "N5",
  explanation: safeString(row.explanation),
  usage: safeString(row.usage),
  exampleJP: safeString(row.exampleJP),
  exampleEN: safeString(row.exampleEN),
  relatedPatterns: safeString(row.relatedPatterns),
  notes: safeString(row.notes),
});

export const normalizeQuiz = (row: Record<string, unknown>): QuizItem => {
  const options = parseOptions(row.options);
  const [optionA = "", optionB = "", optionC = "", optionD = ""] = options;
  const correctAnswer = resolveCorrectAnswerKey(options, safeString(row.correctAnswer));

  return {
    id: Number(row.id),
    title: safeString(row.title),
    description: safeString(row.description),
    quizType: safeString(row.quizType) || "MULTIPLE_CHOICE",
    difficultyLevel: safeString(row.difficultyLevel) || "BEGINNER",
    jlptLevel: safeString(row.jlptLevel) || "N5",
    lessonId: row.lessonId != null && row.lessonId !== "" ? Number(row.lessonId) : undefined,
    question: safeString(row.question),
    optionA,
    optionB,
    optionC,
    optionD,
    correctAnswer,
    explanation: safeString(row.explanation),
    audioUrl: safeString(row.audioUrl),
    imageUrl: safeString(row.imageUrl),
  };
};

export const toLessonPayload = (item: Lesson): Record<string, unknown> => ({
  title: item.title,
  description: item.description,
  jlptLevel: item.jlptLevel,
  category: item.category,
  content: item.content,
  status: item.status,
  orderIndex: item.orderIndex,
  audioUrl: item.audioUrl || null,
  videoUrl: item.videoUrl || null,
  imageUrl: item.imageUrl || null,
  relatedVocabularyIds: item.relatedVocabularyIds,
  relatedGrammarIds: item.relatedGrammarIds,
  relatedQuizIds: item.relatedQuizIds,
});

export const toVocabularyPayload = (item: VocabItem): Record<string, unknown> => ({
  kanji: item.kanji,
  hiragana: item.hiragana,
  romaji: item.romaji,
  meaning: item.meaning,
  exampleSentenceJP: item.exampleSentenceJP || null,
  exampleSentenceEN: item.exampleSentenceEN || null,
  wordType: item.wordType || null,
  jlptLevel: item.jlptLevel,
  additionalNotes: item.additionalNotes || null,
});

export const toGrammarPayload = (item: GrammarItem): Record<string, unknown> => ({
  title: item.title,
  pattern: item.pattern,
  explanation: item.explanation || null,
  usage: item.usage || null,
  exampleJP: item.exampleJP || null,
  exampleEN: item.exampleEN || null,
  jlptLevel: item.jlptLevel,
  relatedPatterns: item.relatedPatterns || null,
  notes: item.notes || null,
});

export const toQuizPayload = (item: QuizItem): Record<string, unknown> => {
  const optionMap = {
    A: item.optionA,
    B: item.optionB,
    C: item.optionC,
    D: item.optionD,
  };

  const options = [item.optionA, item.optionB, item.optionC, item.optionD];
  const selectedCorrectAnswer = optionMap[item.correctAnswer] || item.optionA;

  return {
    title: item.title,
    description: item.description || null,
    quizType: item.quizType,
    difficultyLevel: item.difficultyLevel,
    jlptLevel: item.jlptLevel,
    lessonId: item.lessonId || null,
    question: item.question,
    options: JSON.stringify(options),
    correctAnswer: selectedCorrectAnswer,
    explanation: item.explanation || null,
    audioUrl: item.audioUrl || null,
    imageUrl: item.imageUrl || null,
  };
};

export const toApiPayload = (tab: string, item: EditableItem): Record<string, unknown> => {
  switch (tab) {
    case "lessons":
      return toLessonPayload(item as Lesson);
    case "vocabulary":
      return toVocabularyPayload(item as VocabItem);
    case "grammar":
      return toGrammarPayload(item as GrammarItem);
    case "quizzes":
      return toQuizPayload(item as QuizItem);
    default:
      return item as unknown as Record<string, unknown>;
  }
};
