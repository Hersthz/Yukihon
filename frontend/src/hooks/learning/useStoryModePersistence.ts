import { useCallback, useEffect, useState } from "react";
import { progressApi } from "@/api";
import {
  parseStoryModeSnapshot,
  type StoryModeSnapshot,
} from "@/features/story-mode/storyModeSnapshot";

const STORY_MODE_SYNC_DELAY_MS = 1200;

interface UseStoryModePersistenceParams {
  userId?: number;
  storageKey: string;
  snapshot: StoryModeSnapshot;
  onHydrateSnapshot: (snapshot: Partial<StoryModeSnapshot> | null) => void;
}

interface UseStoryModePersistenceResult {
  hasHydratedProgress: boolean;
  clearLocalSnapshot: () => void;
}

export const useStoryModePersistence = ({
  userId,
  storageKey,
  snapshot,
  onHydrateSnapshot,
}: UseStoryModePersistenceParams): UseStoryModePersistenceResult => {
  const [hasHydratedProgress, setHasHydratedProgress] = useState(false);
  const [storyProgressRecordId, setStoryProgressRecordId] = useState<number | null>(null);
  const [isCreatingStoryProgress, setIsCreatingStoryProgress] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHasHydratedProgress(false);

    const hydrateStoryProgress = async () => {
      const localSnapshot = parseStoryModeSnapshot(localStorage.getItem(storageKey));

      if (!userId) {
        if (!cancelled) {
          onHydrateSnapshot(localSnapshot);
          setStoryProgressRecordId(null);
          setHasHydratedProgress(true);
        }
        return;
      }

      try {
        const remoteStoryProgress = await progressApi.getStoryModeProgress();
        if (cancelled) {
          return;
        }

        setStoryProgressRecordId(remoteStoryProgress?.id ?? null);
        const remoteSnapshot = parseStoryModeSnapshot(remoteStoryProgress?.notes ?? null);
        onHydrateSnapshot(remoteSnapshot ?? localSnapshot);
      } catch {
        if (!cancelled) {
          onHydrateSnapshot(localSnapshot);
        }
      } finally {
        if (!cancelled) {
          setHasHydratedProgress(true);
        }
      }
    };

    void hydrateStoryProgress();

    return () => {
      cancelled = true;
    };
  }, [onHydrateSnapshot, storageKey, userId]);

  useEffect(() => {
    if (!hasHydratedProgress) {
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(snapshot));
  }, [hasHydratedProgress, snapshot, storageKey]);

  useEffect(() => {
    if (!hasHydratedProgress || !userId || isCreatingStoryProgress) {
      return;
    }

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          if (!storyProgressRecordId) {
            setIsCreatingStoryProgress(true);
          }

          const saved = await progressApi.upsertStoryModeProgress({
            userId,
            notes: JSON.stringify(snapshot),
            progressId: storyProgressRecordId,
          });
          setStoryProgressRecordId(saved.id);
        } catch {
          // Keep local fallback if cloud sync is temporarily unavailable.
        } finally {
          setIsCreatingStoryProgress(false);
        }
      })();
    }, STORY_MODE_SYNC_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [hasHydratedProgress, isCreatingStoryProgress, snapshot, storyProgressRecordId, userId]);

  const clearLocalSnapshot = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    hasHydratedProgress,
    clearLocalSnapshot,
  };
};
