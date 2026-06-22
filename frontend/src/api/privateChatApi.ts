import apiClient from "@/lib/apiClient";
import { AuthUser } from "@/api/authApi";

export interface PrivateMessage {
  id: number;
  sender: AuthUser;
  receiver: AuthUser;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface MessagePage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const privateChatApi = {
  getHistory: (otherUserId: number, page = 0, size = 50) =>
    apiClient.get<MessagePage<PrivateMessage>>(`/api/v1/private-chat/history/${otherUserId}`, {
      page,
      size,
    }),
};

export default privateChatApi;
