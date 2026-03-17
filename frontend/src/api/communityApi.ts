import apiClient from "@/lib/apiClient";

interface CreatePostPayload {
  content: string;
  category?: string;
  jlptLevel?: string;
  imageUrl?: string;
}

export const communityApi = {
  getPosts: (page = 0, size = 20, category?: string) => {
    const params = `page=${page}&size=${size}${category ? `&category=${category}` : ""}`;
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
  getComments: (postId: number, page = 0) => apiClient.request(`/api/community/posts/${postId}/comments?page=${page}`),
  addComment: (postId: number, content: string) =>
    apiClient.request(`/api/community/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  deleteComment: (commentId: number) => apiClient.request(`/api/community/comments/${commentId}`, { method: "DELETE" }),
};
