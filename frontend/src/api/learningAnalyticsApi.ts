import apiClient from "@/lib/apiClient";

export type LearningEventType =
  | "START_LEARNING"
  | "COMPLETE_LESSON"
  | "ABANDON_LESSON"
  | "QUIZ_WRONG"
  | "QUIZ_CORRECT_AFTER_REVIEW";

export type LearningContentType = "LESSON" | "QUIZ" | "STORY" | "COURSE";

export interface LearningAnalyticsEventPayload {
  eventType: LearningEventType;
  contentType: LearningContentType;
  contentId: number;
  sessionId?: string;
  jlptLevel?: string;
  durationSeconds?: number;
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface LearningFunnelItem {
  contentType: LearningContentType;
  contentId: number;
  contentTitle: string;
  startedCount: number;
  completedCount: number;
  abandonedCount: number;
  quizWrongCount: number;
  quizCorrectedCount: number;
  completionRate: number;
  abandonmentRate: number;
  quizRecoveryRate: number;
  retentionScore: number;
  lastEventAt?: string | null;
}

export interface LearningFunnelResponse {
  windowDays: number;
  contentType: LearningContentType;
  jlptLevel?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  totalStarted: number;
  totalCompleted: number;
  totalAbandoned: number;
  totalQuizWrong: number;
  totalQuizCorrected: number;
  overallCompletionRate: number;
  overallAbandonmentRate: number;
  overallQuizRecoveryRate: number;
  topRetainedContent: LearningFunnelItem[];
  contentBreakdown: LearningFunnelItem[];
}

interface LearningFunnelQuery {
  days?: number;
  limit?: number;
  contentType?: LearningContentType;
  jlptLevel?: string;
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
    apiClient.request<void>("/api/analytics/events", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getFunnel: (query: LearningFunnelQuery = {}) =>
    apiClient.request<LearningFunnelResponse>(`/api/admin/analytics/learning-funnel${buildQuery(query)}`),
};
