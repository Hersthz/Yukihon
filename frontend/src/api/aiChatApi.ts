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

export const aiChatApi = {
  respond: (data: AiChatRequestPayload) =>
    apiClient.request<AiChatResponse>("/api/ai-chat/respond", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
