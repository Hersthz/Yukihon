import apiClient from '@/lib/apiClient';
import { AuthUser } from '@/api/authApi';

export interface PrivateMessage {
  id: number;
  sender: AuthUser;
  receiver: AuthUser;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const privateChatApi = {
  getHistory: async (otherUserId: number, page = 0, size = 50): Promise<Page<PrivateMessage>> => {
    const response = await apiClient.get(`/api/v1/private-chat/history/${otherUserId}`, {
      params: { page, size }
    });
    return response.data;
  }
};
