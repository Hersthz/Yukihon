import apiClient from "@/lib/apiClient";

export type CreatorContentType = "MINI_LESSON" | "QUIZ" | "STORY_BRANCH";
export type CreatorTemplateStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED";

export interface CreatorTemplate {
  id: number;
  title: string;
  summary: string | null;
  contentType: CreatorContentType;
  status: CreatorTemplateStatus;
  jlptLevel: string;
  tags: string | null;
  estimatedMinutes: number;
  builderJson: string;
  createdByUserId: number;
  createdByDisplayName: string | null;
  reviewedByUserId: number | null;
  reviewedByDisplayName: string | null;
  reviewNote: string | null;
  adminReviewedByUserId: number | null;
  adminReviewedByDisplayName: string | null;
  adminReviewNote: string | null;
  usageCount: number;
  completionCount: number;
  averageScore: number;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  adminReviewedAt: string | null;
  lastPublishedAt: string | null;
}

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

export interface CreatorTemplateAuditEvent {
  id: number;
  templateId: number;
  actorUserId: number | null;
  actorDisplayName: string | null;
  stage: CreatorAuditStage;
  action: CreatorAuditAction;
  decision: string | null;
  note: string | null;
  createdAt: string;
}

export interface CreatorTemplateUpsertPayload {
  title: string;
  summary?: string;
  contentType: CreatorContentType;
  jlptLevel: string;
  tags?: string;
  estimatedMinutes: number;
  builderJson: string;
}

export interface CreatorTemplateReviewPayload {
  decision: "PUBLISHED" | "REJECTED";
  reviewNote?: string;
}

export interface CreatorTemplateMetricPayload {
  attempts: number;
  completions: number;
  averageScore?: number;
}

export interface CreatorAnalyticsItem {
  id: number;
  title: string;
  contentType: CreatorContentType;
  usageCount: number;
  completionCount: number;
  completionRate: number;
  averageScore: number;
}

export interface CreatorAnalytics {
  totalTemplates: number;
  drafts: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  published: number;
  miniLessons: number;
  quizzes: number;
  storyBranches: number;
  totalUsage: number;
  totalCompletions: number;
  completionRate: number;
  averageScore: number;
  topTemplates: CreatorAnalyticsItem[];
}

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
