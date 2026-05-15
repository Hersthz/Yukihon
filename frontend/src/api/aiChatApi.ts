import apiClient from "@/lib/apiClient";

export type AiChatMode = "coach" | "grammar" | "conversation";
export type AiChatRole = "assistant" | "user";

export interface AiChatMessagePayload {
  role: AiChatRole;
  text: string;
}

export interface AiChatRequestPayload {
  conversationId?: number;
  mode: AiChatMode;
  messages: AiChatMessagePayload[];
}

export interface AiChatResponse {
  reply: string;
  model: string;
  mode: AiChatMode;
  conversationId: number;
  conversationTitle: string;
}

export interface AiChatConversation {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiChatHistoryItem {
  id: number;
  conversationId: number;
  role: AiChatRole;
  text: string;
  mode: AiChatMode;
  model?: string | null;
  createdAt: string;
}

interface StreamHandlers {
  onMeta?: (payload: { model?: string; mode?: AiChatMode; conversationId?: number; conversationTitle?: string }) => void;
  onDelta?: (delta: string) => void;
  onDone?: (payload: { model?: string; mode?: AiChatMode; conversationId?: number; conversationTitle?: string }) => void;
  onError?: (message: string) => void;
}

interface StreamOptions {
  signal?: AbortSignal;
}

const parseSseBlock = (block: string) => {
  const lines = block.split(/\r?\n/);
  let event = "message";
  const dataLines: string[] = [];

  lines.forEach((line) => {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
      return;
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  });

  return {
    event,
    data: dataLines.join("\n"),
  };
};

export const aiChatApi = {
  respond: (data: AiChatRequestPayload) =>
    apiClient.request<AiChatResponse>("/api/ai-chat/respond", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  streamRespond: async (data: AiChatRequestPayload, handlers: StreamHandlers = {}, options: StreamOptions = {}) => {
    const response = await apiClient.fetchWithAuth("/api/ai-chat/respond/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: options.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `API Error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Streaming response body is not available.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() || "";

      blocks.forEach((block) => {
        const trimmed = block.trim();
        if (!trimmed) return;

        const parsed = parseSseBlock(trimmed);
        if (!parsed.data) return;

        const payload = JSON.parse(parsed.data) as {
          delta?: string;
          model?: string;
          mode?: AiChatMode;
          message?: string;
          conversationId?: number;
          conversationTitle?: string;
        };

        if (parsed.event === "meta") {
          handlers.onMeta?.({
            model: payload.model,
            mode: payload.mode,
            conversationId: payload.conversationId,
            conversationTitle: payload.conversationTitle,
          });
          return;
        }

        if (parsed.event === "delta" && typeof payload.delta === "string") {
          handlers.onDelta?.(payload.delta);
          return;
        }

        if (parsed.event === "done") {
          handlers.onDone?.({
            model: payload.model,
            mode: payload.mode,
            conversationId: payload.conversationId,
            conversationTitle: payload.conversationTitle,
          });
          return;
        }

        if (parsed.event === "error") {
          handlers.onError?.(payload.message || "AI chat is temporarily unavailable. Please try again.");
        }
      });
    }
  },
  getConversations: () => apiClient.request<AiChatConversation[]>("/api/ai-chat/conversations"),
  createConversation: () => apiClient.request<AiChatConversation>("/api/ai-chat/conversations", { method: "POST" }),
  getConversationMessages: (conversationId: number) =>
    apiClient.request<AiChatHistoryItem[]>(`/api/ai-chat/conversations/${conversationId}/messages`),
  renameConversation: (conversationId: number, title: string) =>
    apiClient.request<AiChatConversation>(`/api/ai-chat/conversations/${conversationId}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    }),
  deleteConversation: (conversationId: number) =>
    apiClient.request(`/api/ai-chat/conversations/${conversationId}`, { method: "DELETE" }),
  getHistory: () => apiClient.request<AiChatHistoryItem[]>("/api/ai-chat/history"),
  clearHistory: () => apiClient.request("/api/ai-chat/history", { method: "DELETE" }),
};
