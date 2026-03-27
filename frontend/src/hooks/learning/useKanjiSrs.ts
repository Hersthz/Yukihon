import { useCallback, useEffect, useMemo, useState } from "react";
import type { KanjiEntry } from "@/data/kanji";
import {
  getKanjiSrsRecords,
  isKanjiDue,
  isKanjiMastered,
  removeKanjiFromSrs,
  reviewKanji,
  saveKanjiToSrs,
  type KanjiReviewRating,
  type KanjiSrsRecord,
} from "@/lib/kanjiSrs";

export const useKanjiSrs = (catalog: KanjiEntry[]) => {
  const [records, setRecords] = useState<KanjiSrsRecord[]>([]);

  const refresh = useCallback(() => {
    setRecords(getKanjiSrsRecords());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const recordMap = useMemo(
    () => new Map(records.map((record) => [record.character, record])),
    [records]
  );

  const dueToday = useMemo(
    () => records.filter(isKanjiDue),
    [records]
  );

  const masteredCount = useMemo(
    () => records.filter(isKanjiMastered).length,
    [records]
  );

  const deck = useMemo(
    () =>
      records
        .map((record) => {
          const kanji = catalog.find((item) => item.character === record.character);
          return kanji ? { ...kanji, srs: record } : null;
        })
        .filter((item): item is KanjiEntry & { srs: KanjiSrsRecord } => Boolean(item))
        .sort((left, right) => new Date(left.srs.nextReviewAt).getTime() - new Date(right.srs.nextReviewAt).getTime()),
    [catalog, records]
  );

  const addToSrs = useCallback((character: string) => {
    setRecords(saveKanjiToSrs(character));
  }, []);

  const removeFromSrs = useCallback((character: string) => {
    setRecords(removeKanjiFromSrs(character));
  }, []);

  const review = useCallback((character: string, rating: KanjiReviewRating) => {
    setRecords(reviewKanji(character, rating));
  }, []);

  return {
    records,
    recordMap,
    dueToday,
    masteredCount,
    deck,
    addToSrs,
    removeFromSrs,
    review,
    refresh,
  };
};
