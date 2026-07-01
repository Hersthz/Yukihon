import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export enum ConnectionType {
  FRIEND = "FRIEND",
  FOLLOW = "FOLLOW",
}

export enum ConnectionStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
}

export type UserConnection = Schema<"UserConnectionDto">;

export const friendApi = {
  getFriends: () => apiClient.get<UserConnection[]>("/api/connections/friends"),

  getFollowing: () => apiClient.get<UserConnection[]>("/api/connections/following"),

  getPendingRequests: (type: ConnectionType = ConnectionType.FRIEND) =>
    apiClient.get<UserConnection[]>("/api/connections/pending", { type }),

  sendRequest: (receiverId: number, type: ConnectionType = ConnectionType.FRIEND) =>
    apiClient.post<UserConnection>(`/api/connections/request/${receiverId}?type=${type}`),

  acceptRequest: (connectionId: number) =>
    apiClient.post<UserConnection>(`/api/connections/accept/${connectionId}`),

  removeConnection: (connectionId: number) =>
    apiClient.del<void>(`/api/connections/${connectionId}`),
};

export default friendApi;
