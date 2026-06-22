import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type MistakePattern = Schema<"MistakePatternDto">;

export type MistakeDnaResponse = Schema<"MistakeDnaDto">;

export const mistakeDnaApi = {
  getCurrent: () => apiClient.get<MistakeDnaResponse>("/api/mistake-dna"),
};
