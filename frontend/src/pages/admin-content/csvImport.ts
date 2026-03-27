import { createEmptyGrammar, createEmptyLesson, createEmptyQuiz, createEmptyVocab } from "./constants";
import { AdminTab, EditableItem, Lesson } from "./types";

interface BulkImportContext {
  lessons?: Lesson[];
}

const normalizeHeader = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const parseCsvRows = (text: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === "\"") {
      if (inQuotes && nextChar === "\"") {
        currentCell += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += char;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows.filter((row) => row.some((cell) => cell.trim().length > 0));
};

const csvToRecords = (text: string): Record<string, string>[] => {
  const rows = parseCsvRows(text);
  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map((header) => normalizeHeader(header));

  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = (row[index] ?? "").trim();
    });
    return record;
  });
};

const readField = (record: Record<string, string>, keys: string[]) => {
  const matchedKey = keys.find((key) => record[normalizeHeader(key)] != null);
  return matchedKey ? record[normalizeHeader(matchedKey)] : "";
};

const parseNumber = (value: string, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseIdList = (value: string) =>
  value
    .split(/[|,]/)
    .map((part) => Number(part.trim()))
    .filter((part) => Number.isFinite(part));

const parseCorrectAnswer = (value: string) => {
  const normalized = value.trim().toUpperCase();
  return (["A", "B", "C", "D"] as const).includes(normalized as "A" | "B" | "C" | "D")
    ? (normalized as "A" | "B" | "C" | "D")
    : "A";
};

const resolveLessonId = (record: Record<string, string>, context?: BulkImportContext) => {
  const directId = readField(record, ["lessonId", "linkedLessonId"]);
  if (directId) {
    return parseNumber(directId, 0) || undefined;
  }

  const lessonTitle = readField(record, ["lessonTitle", "linkedLessonTitle"]);
  if (!lessonTitle || !context?.lessons?.length) {
    return undefined;
  }

  return context.lessons.find((lesson) => lesson.title.toLowerCase() === lessonTitle.toLowerCase())?.id;
};

const parseLessons = (records: Record<string, string>[]) =>
  records.map((record) => ({
    ...createEmptyLesson(),
    title: readField(record, ["title"]),
    description: readField(record, ["description"]),
    jlptLevel: readField(record, ["jlptLevel", "level"]) || "N5",
    category: readField(record, ["category"]),
    content: readField(record, ["content"]),
    status: (readField(record, ["status"]) || "DRAFT") as Lesson["status"],
    orderIndex: parseNumber(readField(record, ["orderIndex", "order"]), 0),
    audioUrl: readField(record, ["audioUrl", "audio"]),
    videoUrl: readField(record, ["videoUrl", "video"]),
    imageUrl: readField(record, ["imageUrl", "image"]),
    relatedVocabularyIds: parseIdList(readField(record, ["relatedVocabularyIds", "vocabularyIds"])),
    relatedGrammarIds: parseIdList(readField(record, ["relatedGrammarIds", "grammarIds"])),
    relatedQuizIds: parseIdList(readField(record, ["relatedQuizIds", "quizIds"])),
  }));

const parseVocabulary = (records: Record<string, string>[]) =>
  records.map((record) => ({
    ...createEmptyVocab(),
    kanji: readField(record, ["kanji"]),
    hiragana: readField(record, ["hiragana"]),
    romaji: readField(record, ["romaji"]),
    meaning: readField(record, ["meaning"]),
    jlptLevel: readField(record, ["jlptLevel", "level"]) || "N5",
    wordType: readField(record, ["wordType", "type"]) || "noun",
    exampleSentenceJP: readField(record, ["exampleSentenceJP", "exampleJP"]),
    exampleSentenceEN: readField(record, ["exampleSentenceEN", "exampleEN"]),
    additionalNotes: readField(record, ["additionalNotes", "notes"]),
  }));

const parseGrammar = (records: Record<string, string>[]) =>
  records.map((record) => ({
    ...createEmptyGrammar(),
    title: readField(record, ["title"]),
    pattern: readField(record, ["pattern"]),
    jlptLevel: readField(record, ["jlptLevel", "level"]) || "N5",
    explanation: readField(record, ["explanation"]),
    usage: readField(record, ["usage"]),
    exampleJP: readField(record, ["exampleJP"]),
    exampleEN: readField(record, ["exampleEN"]),
    relatedPatterns: readField(record, ["relatedPatterns"]),
    notes: readField(record, ["notes"]),
  }));

const parseQuizzes = (records: Record<string, string>[], context?: BulkImportContext) =>
  records.map((record) => ({
    ...createEmptyQuiz(),
    title: readField(record, ["title"]),
    description: readField(record, ["description"]),
    quizType: readField(record, ["quizType", "type"]) || "MULTIPLE_CHOICE",
    difficultyLevel: readField(record, ["difficultyLevel", "difficulty"]) || "BEGINNER",
    jlptLevel: readField(record, ["jlptLevel", "level"]) || "N5",
    lessonId: resolveLessonId(record, context),
    question: readField(record, ["question"]),
    optionA: readField(record, ["optionA"]),
    optionB: readField(record, ["optionB"]),
    optionC: readField(record, ["optionC"]),
    optionD: readField(record, ["optionD"]),
    correctAnswer: parseCorrectAnswer(readField(record, ["correctAnswer", "answer"])),
    explanation: readField(record, ["explanation"]),
    audioUrl: readField(record, ["audioUrl", "audio"]),
    imageUrl: readField(record, ["imageUrl", "image"]),
  }));

export const parseBulkImportCsv = (tab: AdminTab, text: string, context?: BulkImportContext): EditableItem[] => {
  const records = csvToRecords(text);

  switch (tab) {
    case "lessons":
      return parseLessons(records);
    case "vocabulary":
      return parseVocabulary(records);
    case "grammar":
      return parseGrammar(records);
    case "quizzes":
      return parseQuizzes(records, context);
    default:
      return [];
  }
};

export const getCsvTemplate = (tab: AdminTab) => {
  switch (tab) {
    case "lessons":
      return [
        "title,description,jlptLevel,category,status,orderIndex,content,audioUrl,videoUrl,imageUrl,relatedVocabularyIds,relatedGrammarIds,relatedQuizIds",
        "\"Lesson 1\",\"Greetings and introductions\",N5,conversation,DRAFT,1,\"Lesson markdown or long text\",,,,\"1|2\",\"5\",\"10\"",
      ].join("\n");
    case "vocabulary":
      return [
        "kanji,hiragana,romaji,meaning,jlptLevel,wordType,exampleSentenceJP,exampleSentenceEN,additionalNotes",
        "\"学校\",\"がっこう\",\"gakkou\",\"school\",N5,noun,\"学校へ行きます。\",\"I go to school.\",\"Common beginner word\"",
      ].join("\n");
    case "grammar":
      return [
        "title,pattern,jlptLevel,explanation,usage,exampleJP,exampleEN,relatedPatterns,notes",
        "\"Desu form\",\"です\",N5,\"Polite copula\",\"Sentence ending\",\"学生です。\",\"I am a student.\",,",
      ].join("\n");
    case "quizzes":
      return [
        "title,description,quizType,difficultyLevel,jlptLevel,lessonTitle,question,optionA,optionB,optionC,optionD,correctAnswer,explanation,audioUrl,imageUrl",
        "\"Lesson 1 Checkpoint\",\"Greetings checkpoint\",MULTIPLE_CHOICE,BEGINNER,N5,\"Lesson 1\",\"How do you say hello?\",\"こんにちは\",\"ありがとう\",\"さようなら\",\"おはよう\",A,\"Basic greeting\",,",
      ].join("\n");
    default:
      return "";
  }
};
