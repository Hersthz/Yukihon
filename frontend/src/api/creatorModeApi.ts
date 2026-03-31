import apiClient from "@/lib/apiClient";

export type CreatorContentType = "MINI_LESSON" | "QUIZ" | "STORY_BRANCH";
export type CreatorTemplateStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "PUBLISHED";

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

export interface CreatorTemplateUpsertPayload {
  title: string;
  summary?: string;
  contentType: CreatorContentType;
  jlptLevel: string;
  tags?: string;
  estimatedMinutes: number;
  builderJson: string;
}

export interface CreatorTemplateReviewerDecisionPayload {
  decision: "APPROVED" | "REJECTED";
  reviewNote?: string;
}

export interface CreatorTemplateAdminDecisionPayload {
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

const buildQuery = (params: { status?: CreatorTemplateStatus; contentType?: CreatorContentType }) => {
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

export const creatorModeApi = {
  getTemplates: (params: { status?: CreatorTemplateStatus; contentType?: CreatorContentType } = {}) =>
    apiClient.request<CreatorTemplate[]>(`/api/admin/creator-mode/templates${buildQuery(params)}`),
  getTemplate: (id: number) => apiClient.request<CreatorTemplate>(`/api/admin/creator-mode/templates/${id}`),
  createTemplate: (payload: CreatorTemplateUpsertPayload) =>
    apiClient.request<CreatorTemplate>("/api/admin/creator-mode/templates", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateTemplate: (id: number, payload: CreatorTemplateUpsertPayload) =>
    apiClient.request<CreatorTemplate>(`/api/admin/creator-mode/templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  submitForReview: (id: number) =>
    apiClient.request<CreatorTemplate>(`/api/admin/creator-mode/templates/${id}/submit`, {
      method: "POST",
    }),
  reviewerDecision: (id: number, payload: CreatorTemplateReviewerDecisionPayload) =>
    apiClient.request<CreatorTemplate>(`/api/admin/creator-mode/templates/${id}/review/reviewer`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  adminDecision: (id: number, payload: CreatorTemplateAdminDecisionPayload) =>
    apiClient.request<CreatorTemplate>(`/api/admin/creator-mode/templates/${id}/review/admin`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  recordMetrics: (id: number, payload: CreatorTemplateMetricPayload) =>
    apiClient.request<CreatorTemplate>(`/api/admin/creator-mode/templates/${id}/metrics`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteTemplate: (id: number) =>
    apiClient.request<void>(`/api/admin/creator-mode/templates/${id}`, {
      method: "DELETE",
    }),
  getReviewerQueue: () => apiClient.request<CreatorTemplate[]>("/api/admin/creator-mode/review-queue/reviewer"),
  getAdminQueue: () => apiClient.request<CreatorTemplate[]>("/api/admin/creator-mode/review-queue/admin"),
  getAnalytics: () => apiClient.request<CreatorAnalytics>("/api/admin/creator-mode/analytics"),
};
