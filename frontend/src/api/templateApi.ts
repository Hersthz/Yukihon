import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type FlashcardTemplate = Schema<"FlashcardTemplateDto">;
export type TemplateUpsertPayload = Schema<"TemplateUpsertRequest">;

export const templateApi = {
  list: () => apiClient.get<FlashcardTemplate[]>("/api/flashcard-templates"),
  get: (id: number) => apiClient.get<FlashcardTemplate>(`/api/flashcard-templates/${id}`),
  getDefault: (cardType = "BASIC") =>
    apiClient.get<FlashcardTemplate>(`/api/flashcard-templates/default`, { cardType }),
  create: (payload: TemplateUpsertPayload) =>
    apiClient.post<FlashcardTemplate>("/api/flashcard-templates", payload),
  update: (id: number, payload: TemplateUpsertPayload) =>
    apiClient.put<FlashcardTemplate>(`/api/flashcard-templates/${id}`, payload),
  delete: (id: number) => apiClient.del<void>(`/api/flashcard-templates/${id}`),
};

export default templateApi;
