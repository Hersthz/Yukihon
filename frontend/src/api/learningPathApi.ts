import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type LearningPathLesson = Schema<"LearningPathLessonDto">;

export type LearningDeadlinePlan = Schema<"LearningDeadlinePlanDto">;

export type LearningPathResponse = Schema<"LearningPathDto">;

export const learningPathApi = {
  getCurrent: () => apiClient.get<LearningPathResponse>("/api/learning-path"),
};
