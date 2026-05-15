import { useCallback, useEffect, useMemo, useState } from "react";
import { kanjiSrsApi, type KanjiSrsDashboard } from "@/api/kanjiSrsApi";
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

const emptyDashboard: KanjiSrsDashboard = {
  deckCount: 0,
  dueTodayCount: 0,
  overdueCount: 0,
  masteredCount: 0,
  learningCount: 0,
  weakCount: 0,
  reviewStreakDays: 0,
  totalReviews: 0,
  retentionRate: 0,
  weakKanji: [],
  retentionTrend: [],
};

const buildLocalDashboard = (records: KanjiSrsRecord[]): KanjiSrsDashboard => {
  const now = Date.now();
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const masteredCount = records.filter(isKanjiMastered).length;
  const weakKanji = records
    .filter((record) => {
      const reviewCount = record.reviewCount ?? 0;
      const easeFactor = record.easeFactor ?? 2.5;
      const repetitionCount = record.repetitionCount ?? 0;
      const intervalDays = record.intervalDays ?? 0;
      return reviewCount >= 2 && (easeFactor <= 2 || repetitionCount <= 1 || intervalDays <= 1);
    })
    .sort((left, right) => (left.easeFactor ?? 2.5) - (right.easeFactor ?? 2.5))
    .slice(0, 8)
    .map((record) => ({
      character: record.character,
      intervalDays: record.intervalDays ?? 0,
      easeFactor: record.easeFactor ?? 2.5,
      repetitionCount: record.repetitionCount ?? 0,
      reviewCount: record.reviewCount ?? 0,
      nextReviewAt: record.nextReviewAt,
      reason: (record.easeFactor ?? 2.5) <= 2 ? "Ease thấp" : "Cần luyện thêm",
    }));
  const totalReviews = records.reduce((sum, record) => sum + (record.reviewCount ?? 0), 0);
  const stableReviews = records.reduce((sum, record) => {
    const reviewCount = record.reviewCount ?? 0;
    return sum + ((record.easeFactor ?? 2.5) >= 2.3 ? reviewCount : Math.max(0, reviewCount - 1));
  }, 0);

  return {
    ...emptyDashboard,
    deckCount: records.length,
    dueTodayCount: records.filter((record) => !record.nextReviewAt || new Date(record.nextReviewAt).getTime() <= endOfToday.getTime()).length,
    overdueCount: records.filter((record) => !record.nextReviewAt || new Date(record.nextReviewAt).getTime() <= now).length,
    masteredCount,
    learningCount: Math.max(0, records.length - masteredCount),
    weakCount: weakKanji.length,
    reviewStreakDays: records.some((record) => record.lastReviewedAt && now - new Date(record.lastReviewedAt).getTime() < 48 * 60 * 60 * 1000) ? 1 : 0,
    totalReviews,
    retentionRate: totalReviews > 0 ? Math.round((stableReviews * 1000) / totalReviews) / 10 : 0,
    weakKanji,
  };
};

export const useKanjiSrs = (catalog: KanjiEntry[]) => {
  const { isAuthenticated } = useAuth();
  const [records, setRecords] = useState<KanjiSrsRecord[]>([]);
  const [dashboard, setDashboard] = useState<KanjiSrsDashboard>(emptyDashboard);
  const [isLoading, setIsLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      const localRecords = getKanjiSrsRecords();
      setRecords(localRecords);
      setDashboard(buildLocalDashboard(localRecords));
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

      const syncedRecords = syncKanjiSrsRecords(nextRecords);
      setRecords(syncedRecords);
      setDashboard(await kanjiSrsApi.getDashboard());
      setSyncError(null);
    } catch (error) {
      const localRecords = getKanjiSrsRecords();
      setRecords(localRecords);
      setDashboard(buildLocalDashboard(localRecords));
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
    setDashboard(buildLocalDashboard(optimisticRecords));

    if (!isAuthenticated) return;

    try {
      const saved = await kanjiSrsApi.add(character);
      setRecords((current) => syncKanjiSrsRecords([saved, ...current.filter((record) => record.character !== character)]));
      setDashboard(await kanjiSrsApi.getDashboard());
      setSyncError(null);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Không thêm được kanji vào SRS");
      void refresh();
    }
  }, [isAuthenticated, refresh]);

  const removeFromSrs = useCallback(async (character: string) => {
    const nextRecords = removeKanjiFromSrs(character);
    setRecords(nextRecords);
    setDashboard(buildLocalDashboard(nextRecords));

    if (!isAuthenticated) return;

    try {
      await kanjiSrsApi.remove(character);
      setDashboard(await kanjiSrsApi.getDashboard());
      setSyncError(null);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Không xóa được kanji khỏi SRS");
      void refresh();
    }
  }, [isAuthenticated, refresh]);

  const review = useCallback(async (character: string, rating: KanjiReviewRating) => {
    const optimisticRecords = reviewKanji(character, rating);
    setRecords(optimisticRecords);
    setDashboard(buildLocalDashboard(optimisticRecords));

    if (!isAuthenticated) return;

    try {
      const reviewed = await kanjiSrsApi.review(character, rating);
      setRecords((current) => syncKanjiSrsRecords(current.map((record) => (record.character === character ? reviewed : record))));
      setDashboard(await kanjiSrsApi.getDashboard());
      setSyncError(null);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Không lưu được kết quả review");
      void refresh();
    }
  }, [isAuthenticated, refresh]);

  return {
    records,
    dashboard,
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
