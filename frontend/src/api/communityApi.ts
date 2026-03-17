import { request } from "@/api/httpClient";

export const communityApi = {
  getPosts(page = 0, size = 20, category?: string) {
    const params = `page=${page}&size=${size}${category ? `&category=${category}` : ""}`;
    return request(`/api/community/posts?${params}`);
  },

  getPost(postId: number) {
    return request(`/api/community/posts/${postId}`);
  },

  getUserPosts(userId: number, page = 0) {
    return request(`/api/community/posts/user/${userId}?page=${page}`);
  },

  createPost(data: { content: string; category?: string; jlptLevel?: string; imageUrl?: string }) {
    return request("/api/community/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  deletePost(postId: number) {
    return request(`/api/community/posts/${postId}`, { method: "DELETE" });
  },

  toggleLike(postId: number) {
    return request(`/api/community/posts/${postId}/like`, { method: "POST" });
  },

  getComments(postId: number, page = 0) {
    return request(`/api/community/posts/${postId}/comments?page=${page}`);
  },

  addComment(postId: number, content: string) {
    return request(`/api/community/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  deleteComment(commentId: number) {
    return request(`/api/community/comments/${commentId}`, { method: "DELETE" });
  },
};
