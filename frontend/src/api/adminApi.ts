import apiClient from "@/lib/apiClient";

export const adminApi = {
  getUsers: (page = 0, size = 20) => apiClient.request(`/api/admin/users?page=${page}&size=${size}`),
  getUserById: (userId: number) => apiClient.request(`/api/admin/users/${userId}`),
  searchUsers: (query: string) => apiClient.request(`/api/admin/users/search?query=${encodeURIComponent(query)}`),
  updateUserRoles: (userId: number, roles: string[]) =>
    apiClient.request(`/api/admin/users/${userId}/roles`, {
      method: "PUT",
      body: JSON.stringify({ roles }),
    }),
  updateUserStatus: (userId: number, enabled: boolean) =>
    apiClient.request(`/api/admin/users/${userId}/status`, {
      method: "PUT",
      body: JSON.stringify({ enabled }),
    }),
  promoteToAdmin: (userId: number) =>
    apiClient.request(`/api/admin/users/${userId}/promote`, {
      method: "POST",
    }),
  demoteFromAdmin: (userId: number) =>
    apiClient.request(`/api/admin/users/${userId}/demote`, {
      method: "POST",
    }),
  deleteUser: (userId: number) =>
    apiClient.request(`/api/admin/users/${userId}`, {
      method: "DELETE",
    }),
  getSystemStats: () => apiClient.request("/api/admin/stats"),
};
