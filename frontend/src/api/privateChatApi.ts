import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type PrivateMessage = Schema<"PrivateMessageDto">;

export type MessagePage<T> = Schema<"PagePrivateMessageDto">;

export type UnreadSummary = Schema<"UnreadSummaryDto">;

export const privateChatApi = {
  getHistory: (otherUserId: number, page = 0, size = 50) =>
    apiClient.get<MessagePage<PrivateMessage>>(`/api/private-chat/history/${otherUserId}`, {
      page,
      size,
    }),
  markRead: (otherUserId: number) =>
    apiClient.post<void>(`/api/private-chat/read/${otherUserId}`, {}),
  getUnread: () => apiClient.get<UnreadSummary>("/api/private-chat/unread"),
};

export default privateChatApi;
