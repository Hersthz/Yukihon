import { useCallback, useEffect, useMemo, useState } from "react";
import { kanjiSrsApi } from "@/api/kanjiSrsApi";
import type { KanjiEntry } from "@/data/kanji";
import {
  getKanjiSrsRecords,
  isKanjiDue,
  isKanjiMastered,
  removeKanjiFromSrs,
  reviewKanji,
  saveKanjiToSrs,
  syncKanjiSrsRecords,
  type KanjiReviewRating,
  type KanjiSrsRecord,
} from "@/lib/kanjiSrs";
import { useAuth } from "@/hooks/use-auth";

export const useKanjiSrs = (catalog: KanjiEntry[]) => {
  const { isAuthenticated } = useAuth();
  const [records, setRecords] = useState<KanjiSrsRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setRecords(getKanjiSrsRecords());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const localRecords = getKanjiSrsRecords();
      const remoteRecords = await kanjiSrsApi.getAll();
      const nextRecords =
        remoteRecords.length === 0 && localRecords.length > 0
          ? await kanjiSrsApi.importRecords(localRecords)
          : remoteRecords;

      setRecords(syncKanjiSrsRecords(nextRecords));
      setSyncError(null);
    } catch (error) {
      setRecords(getKanjiSrsRecords());
      setSyncError(error instanceof Error ? error.message : "Không đồng bộ được Kanji SRS");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refresh();
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

  const addToSrs = useCallback(async (character: string) => {
    const optimisticRecords = saveKanjiToSrs(character);
    setRecords(optimisticRecords);

    if (!isAuthenticated) return;

    try {
      const saved = await kanjiSrsApi.add(character);
      setRecords((current) => syncKanjiSrsRecords([saved, ...current.filter((record) => record.character !== character)]));
      setSyncError(null);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Không thêm được kanji vào SRS");
      void refresh();
    }
  }, [isAuthenticated, refresh]);

  const removeFromSrs = useCallback(async (character: string) => {
    const nextRecords = removeKanjiFromSrs(character);
    setRecords(nextRecords);

    if (!isAuthenticated) return;

    try {
      await kanjiSrsApi.remove(character);
      setSyncError(null);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Không xóa được kanji khỏi SRS");
      void refresh();
    }
  }, [isAuthenticated, refresh]);

  const review = useCallback(async (character: string, rating: KanjiReviewRating) => {
    const optimisticRecords = reviewKanji(character, rating);
    setRecords(optimisticRecords);

    if (!isAuthenticated) return;

    try {
      const reviewed = await kanjiSrsApi.review(character, rating);
      setRecords((current) => syncKanjiSrsRecords(current.map((record) => (record.character === character ? reviewed : record))));
      setSyncError(null);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Không lưu được kết quả review");
      void refresh();
    }
  }, [isAuthenticated, refresh]);

  return {
    records,
    isLoading,
    syncError,
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
