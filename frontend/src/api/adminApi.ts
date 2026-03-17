import { request } from "@/api/httpClient";

export const adminApi = {
  getUsers(page = 0, size = 20) {
    return request(`/api/admin/users?page=${page}&size=${size}`);
  },

  getUserById(userId: number) {
    return request(`/api/admin/users/${userId}`);
  },

  searchUsers(query: string) {
    return request(`/api/admin/users/search?query=${encodeURIComponent(query)}`);
  },

  updateUserRoles(userId: number, roles: string[]) {
    return request(`/api/admin/users/${userId}/roles`, {
      method: "PUT",
      body: JSON.stringify({ roles }),
    });
  },

  updateUserStatus(userId: number, enabled: boolean) {
    return request(`/api/admin/users/${userId}/status`, {
      method: "PUT",
      body: JSON.stringify({ enabled }),
    });
  },

  promoteToAdmin(userId: number) {
    return request(`/api/admin/users/${userId}/promote`, { method: "POST" });
  },

  demoteFromAdmin(userId: number) {
    return request(`/api/admin/users/${userId}/demote`, { method: "POST" });
  },

  deleteUser(userId: number) {
    return request(`/api/admin/users/${userId}`, { method: "DELETE" });
  },

  getSystemStats() {
    return request("/api/admin/stats");
  },
};
