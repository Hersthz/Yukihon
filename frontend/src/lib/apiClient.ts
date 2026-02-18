// API Configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  roles: string[];
}

export const apiClient = {
  baseURL: API_BASE_URL,

  // Get authorization header
  getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem("yukihon_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  // Generic fetch wrapper
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.getAuthHeader(),
      ...((options.headers as Record<string, string>) || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("yukihon_token");
        localStorage.removeItem("yukihon_user");
        window.location.href = "/auth";
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  },

  // Auth endpoints
  auth: {
    register(data: { email: string; password: string; displayName: string }) {
      return apiClient.request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    login(data: { email: string; password: string }) {
      return apiClient.request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    googleAuth(code: string, redirectUri: string) {
      return apiClient.request("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ code, redirectUri }),
      });
    },

    getCurrentUser() {
      return apiClient.request("/api/auth/me");
    },
  },

  // Helper to store auth data
  setAuthData(token: string, user: AuthUser) {
    localStorage.setItem("yukihon_token", token);
    localStorage.setItem("yukihon_user", JSON.stringify(user));
  },

  // Helper to clear auth data
  clearAuthData() {
    localStorage.removeItem("yukihon_token");
    localStorage.removeItem("yukihon_user");
  },

  // Get stored user
  getStoredUser() {
    const user = localStorage.getItem("yukihon_user");
    return user ? JSON.parse(user) : null;
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem("yukihon_token");
  },

  // Admin endpoints
  admin: {
    // Get all users with pagination
    getUsers(page = 0, size = 20) {
      return apiClient.request(`/api/admin/users?page=${page}&size=${size}`);
    },

    // Get user by ID
    getUserById(userId: number) {
      return apiClient.request(`/api/admin/users/${userId}`);
    },

    // Search users
    searchUsers(query: string) {
      return apiClient.request(`/api/admin/users/search?query=${encodeURIComponent(query)}`);
    },

    // Update user roles
    updateUserRoles(userId: number, roles: string[]) {
      return apiClient.request(`/api/admin/users/${userId}/roles`, {
        method: "PUT",
        body: JSON.stringify({ roles }),
      });
    },

    // Update user status (enable/disable)
    updateUserStatus(userId: number, enabled: boolean) {
      return apiClient.request(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        body: JSON.stringify({ enabled }),
      });
    },

    // Promote user to admin
    promoteToAdmin(userId: number) {
      return apiClient.request(`/api/admin/users/${userId}/promote`, {
        method: "POST",
      });
    },

    // Demote admin to user
    demoteFromAdmin(userId: number) {
      return apiClient.request(`/api/admin/users/${userId}/demote`, {
        method: "POST",
      });
    },

    // Delete user
    deleteUser(userId: number) {
      return apiClient.request(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
    },

    // Get system statistics
    getSystemStats() {
      return apiClient.request("/api/admin/stats");
    },
  },

  // Dictionary endpoints
  dictionary: {
    search(query: string) {
      return apiClient.request(`/api/dictionary/search?q=${encodeURIComponent(query)}`);
    },
    getDetail(id: number) {
      return apiClient.request(`/api/dictionary/${id}`);
    },
  },

  // Community endpoints
  community: {
    getPosts(page = 0, size = 20, category?: string) {
      const params = `page=${page}&size=${size}${category ? `&category=${category}` : ""}`;
      return apiClient.request(`/api/community/posts?${params}`);
    },
    getPost(postId: number) {
      return apiClient.request(`/api/community/posts/${postId}`);
    },
    getUserPosts(userId: number, page = 0) {
      return apiClient.request(`/api/community/posts/user/${userId}?page=${page}`);
    },
    createPost(data: { content: string; category?: string; jlptLevel?: string; imageUrl?: string }) {
      return apiClient.request("/api/community/posts", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    deletePost(postId: number) {
      return apiClient.request(`/api/community/posts/${postId}`, { method: "DELETE" });
    },
    toggleLike(postId: number) {
      return apiClient.request(`/api/community/posts/${postId}/like`, { method: "POST" });
    },
    getComments(postId: number, page = 0) {
      return apiClient.request(`/api/community/posts/${postId}/comments?page=${page}`);
    },
    addComment(postId: number, content: string) {
      return apiClient.request(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
    },
    deleteComment(commentId: number) {
      return apiClient.request(`/api/community/comments/${commentId}`, { method: "DELETE" });
    },
  },

  // My Words (Saved Vocabulary) endpoints
  myWords: {
    getAll(folder?: string) {
      const params = folder ? `?folder=${encodeURIComponent(folder)}` : "";
      return apiClient.request(`/api/my-words${params}`);
    },
    getMastered(mastered = true) {
      return apiClient.request(`/api/my-words/mastered?mastered=${mastered}`);
    },
    saveWord(data: { vocabularyId: number; folderName?: string; personalNote?: string }) {
      return apiClient.request("/api/my-words", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    toggleMastered(id: number) {
      return apiClient.request(`/api/my-words/${id}/toggle-mastered`, { method: "POST" });
    },
    updateNote(id: number, note: string) {
      return apiClient.request(`/api/my-words/${id}/note`, {
        method: "PUT",
        body: JSON.stringify({ note }),
      });
    },
    removeWord(id: number) {
      return apiClient.request(`/api/my-words/${id}`, { method: "DELETE" });
    },
    isWordSaved(vocabularyId: number) {
      return apiClient.request(`/api/my-words/check/${vocabularyId}`);
    },
    getStats() {
      return apiClient.request("/api/my-words/stats");
    },
  },

  // Settings endpoints
  settings: {
    get() {
      return apiClient.request("/api/settings");
    },
    update(data: Record<string, unknown>) {
      return apiClient.request("/api/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  },

  // Vocabulary endpoints (for admin CRUD)
  vocabulary: {
    getAll() {
      return apiClient.request("/api/vocabulary");
    },
    getByLevel(level: string) {
      return apiClient.request(`/api/vocabulary/level/${level}`);
    },
    getLevels() {
      return apiClient.request("/api/vocabulary/levels");
    },
    create(data: Record<string, unknown>) {
      return apiClient.request("/api/vocabulary", { method: "POST", body: JSON.stringify(data) });
    },
    update(id: number, data: Record<string, unknown>) {
      return apiClient.request(`/api/vocabulary/${id}`, { method: "PUT", body: JSON.stringify(data) });
    },
    delete(id: number) {
      return apiClient.request(`/api/vocabulary/${id}`, { method: "DELETE" });
    },
  },

  // Lessons endpoints (for admin CRUD)
  lessons: {
    getAll() {
      return apiClient.request("/api/lessons");
    },
    getPublished() {
      return apiClient.request("/api/lessons/published");
    },
    getPublishedByLevel(level: string) {
      return apiClient.request(`/api/lessons/published/level/${level}`);
    },
    create(data: Record<string, unknown>) {
      return apiClient.request("/api/lessons", { method: "POST", body: JSON.stringify(data) });
    },
    update(id: number, data: Record<string, unknown>) {
      return apiClient.request(`/api/lessons/${id}`, { method: "PUT", body: JSON.stringify(data) });
    },
    delete(id: number) {
      return apiClient.request(`/api/lessons/${id}`, { method: "DELETE" });
    },
  },

  // Grammar endpoints (for admin CRUD)
  grammar: {
    getAll() {
      return apiClient.request("/api/grammar");
    },
    getByLevel(level: string) {
      return apiClient.request(`/api/grammar/level/${level}`);
    },
    create(data: Record<string, unknown>) {
      return apiClient.request("/api/grammar", { method: "POST", body: JSON.stringify(data) });
    },
    update(id: number, data: Record<string, unknown>) {
      return apiClient.request(`/api/grammar/${id}`, { method: "PUT", body: JSON.stringify(data) });
    },
    delete(id: number) {
      return apiClient.request(`/api/grammar/${id}`, { method: "DELETE" });
    },
  },

  // Quiz endpoints (for admin CRUD)
  quizzes: {
    getAll() {
      return apiClient.request("/api/quizzes");
    },
    getByLevel(level: string) {
      return apiClient.request(`/api/quizzes/level/${level}`);
    },
    create(data: Record<string, unknown>) {
      return apiClient.request("/api/quizzes", { method: "POST", body: JSON.stringify(data) });
    },
    update(id: number, data: Record<string, unknown>) {
      return apiClient.request(`/api/quizzes/${id}`, { method: "PUT", body: JSON.stringify(data) });
    },
    delete(id: number) {
      return apiClient.request(`/api/quizzes/${id}`, { method: "DELETE" });
    },
  },
};

export default apiClient;
