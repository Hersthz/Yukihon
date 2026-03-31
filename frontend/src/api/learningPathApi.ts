import apiClient from "@/lib/apiClient";

export interface LearningPathLesson {
  id: number;
  title: string;
  description: string | null;
  jlptLevel: string;
  category: string | null;
  orderIndex: number | null;
  progressStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progressPercent: number;
  estimatedMinutes: number;
  recommendationReason: string;
}

export interface LearningDeadlinePlan {
  hasDeadline: boolean;
  planStatus: "NO_DEADLINE" | "ON_TRACK" | "AT_RISK" | "OFF_TRACK" | "COMPLETED";
  deadlineDate: string | null;
  projectedCompletionDate: string | null;
  daysRemaining: number;
  remainingLessons: number;
  remainingEstimatedMinutes: number;
  requiredMinutesPerDay: number;
  requiredLessonsPerWeek: number;
  insight: string;
}

export interface LearningPathResponse {
  targetJlptLevel: string;
  dailyGoalMinutes: number;
  deadlinePlan: LearningDeadlinePlan;
  totalLessonsInTrack: number;
  completedLessonsInTrack: number;
  inProgressLessons: number;
  completionRate: number;
  currentStreak: number;
  totalXP: number;
  nextLesson: LearningPathLesson | null;
  recommendedLessons: LearningPathLesson[];
  todayGoals: string[];
  recommendationSummary: string;
}

export const learningPathApi = {
  getCurrent: () => apiClient.request<LearningPathResponse>("/api/learning-path"),
};
