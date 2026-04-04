import apiClient from "@/lib/apiClient";

export type AiChatMode = "coach" | "grammar" | "conversation";
export type AiChatRole = "assistant" | "user";

export interface AiChatMessagePayload {
  role: AiChatRole;
  text: string;
}

export interface AiChatRequestPayload {
  mode: AiChatMode;
  messages: AiChatMessagePayload[];
}

export interface AiChatResponse {
  reply: string;
  model: string;
  mode: AiChatMode;
}

export interface AiChatHistoryItem {
  id: number;
  role: AiChatRole;
  text: string;
  mode: AiChatMode;
  model?: string | null;
  createdAt: string;
}

export const aiChatApi = {
  respond: (data: AiChatRequestPayload) =>
    apiClient.request<AiChatResponse>("/api/ai-chat/respond", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getHistory: () => apiClient.request<AiChatHistoryItem[]>("/api/ai-chat/history"),
  clearHistory: () => apiClient.request("/api/ai-chat/history", { method: "DELETE" }),
};
