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
  getFriends: () => apiClient.request<UserConnection[]>("/api/v1/connections/friends"),

  getFollowing: () => apiClient.request<UserConnection[]>("/api/v1/connections/following"),

  getPendingRequests: (type: ConnectionType = ConnectionType.FRIEND) =>
    apiClient.request<UserConnection[]>(`/api/v1/connections/pending?type=${type}`),

  sendRequest: (receiverId: number, type: ConnectionType = ConnectionType.FRIEND) =>
    apiClient.request<UserConnection>(`/api/v1/connections/request/${receiverId}?type=${type}`, { method: "POST" }),

  acceptRequest: (connectionId: number) =>
    apiClient.request<UserConnection>(`/api/v1/connections/accept/${connectionId}`, { method: "POST" }),

  removeConnection: (connectionId: number) =>
    apiClient.request<void>(`/api/v1/connections/${connectionId}`, { method: "DELETE" }),
};

export default friendApi;
