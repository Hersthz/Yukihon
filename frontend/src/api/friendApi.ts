import apiClient from "@/lib/apiClient";
import { AuthUser } from "@/api/authApi";

export enum ConnectionType {
  FRIEND = "FRIEND",
  FOLLOW = "FOLLOW",
}

export enum ConnectionStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
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
  getFriends: () => apiClient.get<UserConnection[]>("/api/v1/connections/friends"),

  getFollowing: () => apiClient.get<UserConnection[]>("/api/v1/connections/following"),

  getPendingRequests: (type: ConnectionType = ConnectionType.FRIEND) =>
    apiClient.get<UserConnection[]>("/api/v1/connections/pending", { type }),

  sendRequest: (receiverId: number, type: ConnectionType = ConnectionType.FRIEND) =>
    apiClient.post<UserConnection>(`/api/v1/connections/request/${receiverId}?type=${type}`),

  acceptRequest: (connectionId: number) =>
    apiClient.post<UserConnection>(`/api/v1/connections/accept/${connectionId}`),

  removeConnection: (connectionId: number) =>
    apiClient.del<void>(`/api/v1/connections/${connectionId}`),
};

export default friendApi;
