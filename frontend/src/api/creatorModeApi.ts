import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type CreatorContentType = "MINI_LESSON" | "QUIZ" | "STORY_BRANCH";
export type CreatorTemplateStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED";

export type CreatorTemplate = Schema<"CreatorTemplateDto">;

export type CreatorAuditStage =
  | "AUTHORING"
  | "REVIEW_SUBMISSION"
  | "REVIEWER_REVIEW"
  | "ADMIN_APPROVAL";
export type CreatorAuditAction =
  | "CREATED"
  | "UPDATED_DRAFT"
  | "SUBMITTED_FOR_REVIEW"
  | "REVIEW_DECISION"
  | "ADMIN_DECISION";

export interface CreatorTemplateAuditTimelineFilters {
  stage?: CreatorAuditStage;
  actor?: string;
}

export type CreatorTemplateAuditEvent = Schema<"CreatorTemplateAuditEventDto">;

export type CreatorTemplateUpsertPayload = Schema<"CreatorTemplateUpsertRequest">;

export type CreatorTemplateReviewPayload = Schema<"CreatorTemplateReviewRequest">;

export type CreatorTemplateMetricPayload = Schema<"CreatorTemplateMetricsRequest">;

export type CreatorAnalyticsItem = Schema<"CreatorTemplateAnalyticsItemDto">;

export type CreatorAnalytics = Schema<"CreatorTemplateAnalyticsDto">;

const buildQuery = (params: {
  status?: CreatorTemplateStatus;
  contentType?: CreatorContentType;
}) => {
  const query = new URLSearchParams();
  if (params.status) {
    query.set("status", params.status);
  }
  if (params.contentType) {
    query.set("contentType", params.contentType);
  }

  const encoded = query.toString();
  return encoded ? `?${encoded}` : "";
};

const buildAuditTimelineQuery = (filters?: CreatorTemplateAuditTimelineFilters) => {
  if (!filters) {
    return "";
  }

  const query = new URLSearchParams();
  if (filters.stage) {
    query.set("stage", filters.stage);
  }
  if (filters.actor) {
    query.set("actor", filters.actor);
  }

  const encoded = query.toString();
  return encoded ? `?${encoded}` : "";
};

export const creatorModeApi = {
  getTemplates: (
    params: { status?: CreatorTemplateStatus; contentType?: CreatorContentType } = {}
  ) => apiClient.get<CreatorTemplate[]>(`/api/admin/creator-mode/templates${buildQuery(params)}`),
  getTemplate: (id: number) =>
    apiClient.get<CreatorTemplate>(`/api/admin/creator-mode/templates/${id}`),
  createTemplate: (payload: CreatorTemplateUpsertPayload) =>
    apiClient.post<CreatorTemplate>("/api/admin/creator-mode/templates", payload),
  updateTemplate: (id: number, payload: CreatorTemplateUpsertPayload) =>
    apiClient.put<CreatorTemplate>(`/api/admin/creator-mode/templates/${id}`, payload),
  submitForReview: (id: number) =>
    apiClient.post<CreatorTemplate>(`/api/admin/creator-mode/templates/${id}/submit`),
  reviewDecision: (id: number, payload: CreatorTemplateReviewPayload) =>
    apiClient.post<CreatorTemplate>(`/api/admin/creator-mode/templates/${id}/review`, payload),
  recordMetrics: (id: number, payload: CreatorTemplateMetricPayload) =>
    apiClient.post<CreatorTemplate>(`/api/admin/creator-mode/templates/${id}/metrics`, payload),
  deleteTemplate: (id: number) => apiClient.del<void>(`/api/admin/creator-mode/templates/${id}`),
  getTemplateAuditTimeline: (id: number, filters?: CreatorTemplateAuditTimelineFilters) =>
    apiClient.get<CreatorTemplateAuditEvent[]>(
      `/api/admin/creator-mode/templates/${id}/audit-timeline${buildAuditTimelineQuery(filters)}`
    ),
  getReviewQueue: () => apiClient.get<CreatorTemplate[]>("/api/admin/creator-mode/review-queue"),
  getAnalytics: () => apiClient.get<CreatorAnalytics>("/api/admin/creator-mode/analytics"),
};
