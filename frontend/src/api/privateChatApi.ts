import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type PrivateMessage = Schema<"PrivateMessageDto">;

export type MessagePage<T> = Schema<"PagePrivateMessageDto">;

export const privateChatApi = {
  getHistory: (otherUserId: number, page = 0, size = 50) =>
    apiClient.get<MessagePage<PrivateMessage>>(`/api/v1/private-chat/history/${otherUserId}`, {
      page,
      size,
    }),
};

export default privateChatApi;
