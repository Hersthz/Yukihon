import apiClient from '@/lib/apiClient';
import { AuthUser } from '@/api/authApi';

export enum ConnectionType {
  FRIEND = 'FRIEND',
  FOLLOW = 'FOLLOW'
}

export enum ConnectionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED'
}

export interface UserConnection {
  id: number;
  requester: AuthUser;
  receiver: AuthUser;
  type: ConnectionType;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
}

export const friendApi = {
  getFriends: async (): Promise<UserConnection[]> => {
    const response = await apiClient.get('/api/v1/connections/friends');
    return response.data;
  },

  getFollowing: async (): Promise<UserConnection[]> => {
    const response = await apiClient.get('/api/v1/connections/following');
    return response.data;
  },

  getPendingRequests: async (type: ConnectionType = ConnectionType.FRIEND): Promise<UserConnection[]> => {
    const response = await apiClient.get('/api/v1/connections/pending', { params: { type } });
    return response.data;
  },

  sendRequest: async (receiverId: number, type: ConnectionType = ConnectionType.FRIEND): Promise<UserConnection> => {
    const response = await apiClient.post(`/api/v1/connections/request/${receiverId}?type=${type}`);
    return response.data;
  },

  acceptRequest: async (connectionId: number): Promise<UserConnection> => {
    const response = await apiClient.post(`/api/v1/connections/accept/${connectionId}`);
    return response.data;
  },

  removeConnection: async (connectionId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/connections/${connectionId}`);
  }
};
