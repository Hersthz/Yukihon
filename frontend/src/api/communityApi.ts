import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

type CreatePostPayload = Schema<"CreatePostRequest">;

export const communityApi = {
  getPosts: (
    page = 0,
    size = 20,
    filters?: { category?: string; jlptLevel?: string; search?: string; bookmarkedOnly?: boolean }
  ) => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    if (filters?.category) params.set("category", filters.category);
    if (filters?.jlptLevel) params.set("jlptLevel", filters.jlptLevel);
    if (filters?.search) params.set("search", filters.search);
    if (filters?.bookmarkedOnly) params.set("bookmarkedOnly", "true");

    return apiClient.get(`/api/community/posts?${params}`);
  },
  getPost: (postId: number) => apiClient.get(`/api/community/posts/${postId}`),
  getUserPosts: (userId: number, page = 0) =>
    apiClient.get(`/api/community/posts/user/${userId}`, { page }),
  createPost: (data: CreatePostPayload) => apiClient.post("/api/community/posts", data),
  deletePost: (postId: number) => apiClient.del(`/api/community/posts/${postId}`),
  toggleLike: (postId: number) => apiClient.post(`/api/community/posts/${postId}/like`),
  toggleBookmark: (postId: number) => apiClient.post(`/api/community/posts/${postId}/bookmark`),
  getComments: (postId: number, page = 0) =>
    apiClient.get(`/api/community/posts/${postId}/comments`, { page }),
  addComment: (postId: number, content: string) =>
    apiClient.post(`/api/community/posts/${postId}/comments`, { content }),
  deleteComment: (commentId: number) => apiClient.del(`/api/community/comments/${commentId}`),
  getChatRooms: () => apiClient.get("/api/community/chat/rooms"),
  getChatMessages: (roomId = "general", limit = 50) =>
    apiClient.get(`/api/community/chat/messages`, { roomId, limit }),
  getStats: () => apiClient.get("/api/community/stats"),
  getLeaderboard: () => apiClient.get("/api/community/leaderboard"),
};
