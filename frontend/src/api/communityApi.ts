import apiClient from "@/lib/apiClient";

interface CreatePostPayload {
  title?: string;
  content: string;
  category?: string;
  jlptLevel?: string;
  imageUrl?: string;
  tags?: string;
}

export const communityApi = {
  getPosts: (page = 0, size = 20, filters?: { category?: string; jlptLevel?: string; search?: string; bookmarkedOnly?: boolean }) => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    if (filters?.category) params.set("category", filters.category);
    if (filters?.jlptLevel) params.set("jlptLevel", filters.jlptLevel);
    if (filters?.search) params.set("search", filters.search);
    if (filters?.bookmarkedOnly) params.set("bookmarkedOnly", "true");

    return apiClient.request(`/api/community/posts?${params}`);
  },
  getPost: (postId: number) => apiClient.request(`/api/community/posts/${postId}`),
  getUserPosts: (userId: number, page = 0) => apiClient.request(`/api/community/posts/user/${userId}?page=${page}`),
  createPost: (data: CreatePostPayload) =>
    apiClient.request("/api/community/posts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deletePost: (postId: number) => apiClient.request(`/api/community/posts/${postId}`, { method: "DELETE" }),
  toggleLike: (postId: number) => apiClient.request(`/api/community/posts/${postId}/like`, { method: "POST" }),
  toggleBookmark: (postId: number) => apiClient.request(`/api/community/posts/${postId}/bookmark`, { method: "POST" }),
  getComments: (postId: number, page = 0) => apiClient.request(`/api/community/posts/${postId}/comments?page=${page}`),
  addComment: (postId: number, content: string) =>
    apiClient.request(`/api/community/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  deleteComment: (commentId: number) => apiClient.request(`/api/community/comments/${commentId}`, { method: "DELETE" }),
  getChatMessages: (roomId = "general", limit = 50) =>
    apiClient.request(`/api/community/chat/messages?roomId=${encodeURIComponent(roomId)}&limit=${limit}`),
  getStats: () => apiClient.request("/api/community/stats"),
  getLeaderboard: () => apiClient.request("/api/community/leaderboard"),
};
