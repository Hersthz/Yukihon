import { storyModeStories, type StoryDifficultyLevel, type StoryModeStory } from "@/data/storyMode";

export interface StoryPerformanceState {
  answeredCount: number;
  correctCount: number;
  streak: number;
  incorrectStreak: number;
  currentDifficulty: StoryDifficultyLevel;
}

export interface StoryModeSnapshot {
  activeStoryId: string;
  activeSegmentId?: string;
  activeSegmentIndex?: number;
  unlockedSegmentIdsByStory?: Record<string, string[]>;
  unlockedCounts?: Record<string, number>;
  selectedAnswers: Record<string, string>;
  submittedSegments: Record<string, boolean>;
  performanceByStory?: Record<string, StoryPerformanceState>;
}

export interface StoryModeHydratedState {
  activeStoryId: string;
  activeSegmentId: string;
  unlockedSegmentIdsByStory: Record<string, string[]>;
  selectedAnswers: Record<string, string>;
  submittedSegments: Record<string, boolean>;
  performanceByStory: Record<string, StoryPerformanceState>;
  revealedHardTranslation: Record<string, boolean>;
}

export const storyDifficultyOrder: StoryDifficultyLevel[] = ["EASY", "STANDARD", "HARD"];

export const createDefaultStoryPerformance = (): StoryPerformanceState => ({
  answeredCount: 0,
  correctCount: 0,
  streak: 0,
  incorrectStreak: 0,
  currentDifficulty: "STANDARD",
});

export const buildInitialPerformanceByStory = (stories: StoryModeStory[] = storyModeStories) =>
  Object.fromEntries(stories.map((story) => [story.id, createDefaultStoryPerformance()])) as Record<string, StoryPerformanceState>;

export const buildInitialUnlockedSegmentIds = (stories: StoryModeStory[] = storyModeStories) =>
  Object.fromEntries(stories.map((story) => [story.id, [story.entrySegmentId]]));

export const dedupe = (values: string[]) => Array.from(new Set(values));

export const parseStoryModeSnapshot = (raw: string | null): Partial<StoryModeSnapshot> | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoryModeSnapshot>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export const getSegmentById = (story: StoryModeStory, segmentId?: string | null) =>
  story.segments.find((segment) => segment.id === segmentId) ??
  story.segments.find((segment) => segment.id === story.entrySegmentId) ??
  story.segments[0];

const migrateUnlockedSegments = (snapshot: Partial<StoryModeSnapshot>, stories: StoryModeStory[]) => {
  const initial = buildInitialUnlockedSegmentIds(stories);
  const nextMap: Record<string, string[]> = { ...initial };

  if (snapshot.unlockedSegmentIdsByStory) {
    stories.forEach((story) => {
      const allowedIds = new Set(story.segments.map((segment) => segment.id));
      const restored = snapshot.unlockedSegmentIdsByStory?.[story.id]?.filter((segmentId) => allowedIds.has(segmentId)) ?? [];
      nextMap[story.id] = dedupe([story.entrySegmentId, ...restored]);
    });
    return nextMap;
  }

  if (snapshot.unlockedCounts) {
    stories.forEach((story) => {
      const count = Math.max(1, Math.min(story.segments.length, snapshot.unlockedCounts?.[story.id] ?? 1));
      nextMap[story.id] = story.segments.slice(0, count).map((segment) => segment.id);
    });
  }

  return nextMap;
};

const normalizePerformanceByStory = (
  snapshotPerformance: Record<string, StoryPerformanceState> | undefined,
  stories: StoryModeStory[]
) => {
  const initial = buildInitialPerformanceByStory(stories);
  if (!snapshotPerformance) {
    return initial;
  }

  const next = { ...initial };
  stories.forEach((story) => {
    const raw = snapshotPerformance[story.id];
    if (!raw) {
      return;
    }

    const safeAnswered = Math.max(0, raw.answeredCount ?? 0);
    const safeCorrect = Math.max(0, Math.min(raw.correctCount ?? 0, safeAnswered));
    const safeStreak = Math.max(0, raw.streak ?? 0);
    const safeIncorrectStreak = Math.max(0, raw.incorrectStreak ?? 0);
    const safeDifficulty = storyDifficultyOrder.includes(raw.currentDifficulty) ? raw.currentDifficulty : "STANDARD";

    next[story.id] = {
      answeredCount: safeAnswered,
      correctCount: safeCorrect,
      streak: safeStreak,
      incorrectStreak: safeIncorrectStreak,
      currentDifficulty: safeDifficulty,
    };
  });

  return next;
};

export const buildHydratedStoryModeState = (
  snapshot: Partial<StoryModeSnapshot> | null,
  stories: StoryModeStory[] = storyModeStories
): StoryModeHydratedState => {
  const firstStory = stories[0];
  const initialUnlocked = buildInitialUnlockedSegmentIds(stories);

  if (!firstStory) {
    return {
      activeStoryId: "",
      activeSegmentId: "",
      unlockedSegmentIdsByStory: {},
      selectedAnswers: {},
      submittedSegments: {},
      performanceByStory: {},
      revealedHardTranslation: {},
    };
  }

  if (!snapshot) {
    return {
      activeStoryId: firstStory.id,
      activeSegmentId: firstStory.entrySegmentId,
      unlockedSegmentIdsByStory: initialUnlocked,
      selectedAnswers: {},
      submittedSegments: {},
      performanceByStory: buildInitialPerformanceByStory(stories),
      revealedHardTranslation: {},
    };
  }

  const nextStory = stories.find((story) => story.id === snapshot.activeStoryId) ?? firstStory;
  const nextUnlockedSegmentIdsByStory = migrateUnlockedSegments(snapshot, stories);
  const nextPerformanceByStory = normalizePerformanceByStory(snapshot.performanceByStory, stories);
  const storyUnlockedIds = nextUnlockedSegmentIdsByStory[nextStory.id] ?? [nextStory.entrySegmentId];
  const fallbackActiveSegmentId =
    snapshot.activeSegmentId ??
    nextStory.segments[Math.max(0, Math.min(storyUnlockedIds.length - 1, snapshot.activeSegmentIndex ?? 0))]?.id ??
    nextStory.entrySegmentId;

  return {
    activeStoryId: nextStory.id,
    activeSegmentId: getSegmentById(nextStory, fallbackActiveSegmentId).id,
    unlockedSegmentIdsByStory: nextUnlockedSegmentIdsByStory,
    selectedAnswers: snapshot.selectedAnswers ?? {},
    submittedSegments: snapshot.submittedSegments ?? {},
    performanceByStory: nextPerformanceByStory,
    revealedHardTranslation: {},
  };
};

export const buildStoryModeSnapshot = (params: {
  activeStoryId: string;
  activeSegmentId: string;
  unlockedSegmentIdsByStory: Record<string, string[]>;
  selectedAnswers: Record<string, string>;
  submittedSegments: Record<string, boolean>;
  performanceByStory: Record<string, StoryPerformanceState>;
}): StoryModeSnapshot => ({
  activeStoryId: params.activeStoryId,
  activeSegmentId: params.activeSegmentId,
  unlockedSegmentIdsByStory: params.unlockedSegmentIdsByStory,
  selectedAnswers: params.selectedAnswers,
  submittedSegments: params.submittedSegments,
  performanceByStory: params.performanceByStory,
});
