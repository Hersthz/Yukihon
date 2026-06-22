import apiClient from "@/lib/apiClient";

export interface MistakePattern {
  key: string;
  title: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  metricLabel: string;
  metricValue: number;
  insight: string;
  recommendedAction: string;
  evidence: string[];
}

export interface MistakeDnaResponse {
  summary: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  overallRiskScore: number;
  averageQuizAccuracy: number;
  dueReviews: number;
  inProgressLessons: number;
  dominantPatternTitle: string;
  dominantPatternDescription: string;
  nextMoves: string[];
  studySignals: string[];
  patterns: MistakePattern[];
}

export const mistakeDnaApi = {
  getCurrent: () => apiClient.get<MistakeDnaResponse>("/api/mistake-dna"),
};
