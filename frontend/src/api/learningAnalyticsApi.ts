import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type LearningEventType =
  | "START_LEARNING"
  | "COMPLETE_LESSON"
  | "ABANDON_LESSON"
  | "QUIZ_WRONG"
  | "QUIZ_CORRECT_AFTER_REVIEW";

export type LearningContentType = "LESSON" | "QUIZ" | "STORY" | "COURSE";

export type LearningAnalyticsEventPayload = Schema<"LearningAnalyticsEventRequest">;

export type LearningFunnelItem = Schema<"LearningFunnelItemDto">;

export type LearningFunnelDailyPoint = Schema<"LearningFunnelDailyPointDto">;

export type LearningFunnelResponse = Schema<"LearningFunnelDto">;

export type StudyCalendarDay = Schema<"StudyCalendarDayDto">;

export type StudyCalendarResponse = Schema<"StudyCalendarDto">;

interface LearningFunnelQuery {
  days?: number;
  limit?: number;
  contentType?: LearningContentType;
  jlptLevel?: string;
  startDate?: string;
  endDate?: string;
}

interface StudyCalendarQuery {
  startDate?: string;
  endDate?: string;
}

const buildQuery = (query: LearningFunnelQuery) => {
  const params = new URLSearchParams();

  if (query.days != null) params.set("days", String(query.days));
  if (query.limit != null) params.set("limit", String(query.limit));
  if (query.contentType) params.set("contentType", query.contentType);
  if (query.jlptLevel) params.set("jlptLevel", query.jlptLevel);
  if (query.startDate) params.set("startDate", query.startDate);
  if (query.endDate) params.set("endDate", query.endDate);

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
};

export const learningAnalyticsApi = {
  trackEvent: (payload: LearningAnalyticsEventPayload) =>
    apiClient.post<void>("/api/analytics/events", payload),

  getFunnel: (query: LearningFunnelQuery = {}) =>
    apiClient.get<LearningFunnelResponse>(
      `/api/admin/analytics/learning-funnel${buildQuery(query)}`
    ),

  getStudyCalendar: (query: StudyCalendarQuery = {}) =>
    apiClient.get<StudyCalendarResponse>(`/api/analytics/study-calendar${buildQuery(query)}`),
};
