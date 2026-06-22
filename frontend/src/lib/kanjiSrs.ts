export type KanjiReviewRating = "AGAIN" | "HARD" | "GOOD" | "EASY";

export interface KanjiSrsRecord {
  character: string;
  intervalDays: number;
  easeFactor: number;
  repetitionCount: number;
  reviewCount: number;
  lastReviewedAt?: string;
  nextReviewAt: string;
}

const STORAGE_KEY = "yukihon_kanji_srs_v1";

const canUseStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readRecords = (): KanjiSrsRecord[] => {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeRecords = (records: KanjiSrsRecord[]) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const getKanjiSrsRecords = () => readRecords();

export const syncKanjiSrsRecords = (records: KanjiSrsRecord[]) => {
  writeRecords(records);
  return records;
};

export const saveKanjiToSrs = (character: string) => {
  const records = readRecords();
  const existing = records.find((item) => item.character === character);
  if (existing) return records;

  const next = [
    {
      character,
      intervalDays: 0,
      easeFactor: 2.5,
      repetitionCount: 0,
      reviewCount: 0,
      nextReviewAt: new Date().toISOString(),
    },
    ...records,
  ];
  writeRecords(next);
  return next;
};

export const removeKanjiFromSrs = (character: string) => {
  const next = readRecords().filter((item) => item.character !== character);
  writeRecords(next);
  return next;
};

export const reviewKanji = (character: string, rating: KanjiReviewRating) => {
  const now = new Date();
  const next = readRecords().map((item) => {
    if (item.character !== character) return item;

    let easeFactor = item.easeFactor ?? 2.5;
    let intervalDays = item.intervalDays ?? 0;
    let repetitionCount = item.repetitionCount ?? 0;

    switch (rating) {
      case "AGAIN":
        repetitionCount = 0;
        intervalDays = 1;
        easeFactor = Math.max(1.3, easeFactor - 0.2);
        break;
      case "HARD":
        repetitionCount = Math.max(1, repetitionCount);
        intervalDays = Math.max(1, intervalDays <= 1 ? 2 : Math.round(intervalDays * 1.2));
        easeFactor = Math.max(1.3, easeFactor - 0.15);
        break;
      case "GOOD":
        repetitionCount += 1;
        intervalDays =
          repetitionCount <= 1
            ? 1
            : repetitionCount === 2
              ? 3
              : Math.max(4, Math.round(intervalDays * easeFactor));
        break;
      case "EASY":
        repetitionCount += 1;
        intervalDays =
          repetitionCount <= 1
            ? 2
            : repetitionCount === 2
              ? 5
              : Math.max(6, Math.round(intervalDays * (easeFactor + 0.25)));
        easeFactor += 0.15;
        break;
    }

    const nextReviewAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000).toISOString();

    return {
      ...item,
      easeFactor,
      intervalDays,
      repetitionCount,
      reviewCount: (item.reviewCount ?? 0) + 1,
      lastReviewedAt: now.toISOString(),
      nextReviewAt,
    };
  });

  writeRecords(next);
  return next;
};

export const isKanjiDue = (record: KanjiSrsRecord) =>
  new Date(record.nextReviewAt).getTime() <= Date.now();

export const isKanjiMastered = (record: KanjiSrsRecord) =>
  record.intervalDays >= 21 || record.repetitionCount >= 5;
