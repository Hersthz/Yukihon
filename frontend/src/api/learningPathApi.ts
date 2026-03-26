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

export interface LearningPathResponse {
  targetJlptLevel: string;
  dailyGoalMinutes: number;
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
