import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type BlogPostDto = Schema<"BlogPostDto">;

export type BlogPostRequest = Schema<"BlogPostRequest">;

export const blogApi = {
  getPublished: () => apiClient.get<BlogPostDto[]>("/api/posts/published"),
  getPublishedBySlug: (slug: string) => apiClient.get<BlogPostDto>(`/api/posts/published/${slug}`),
  getAll: () => apiClient.get<BlogPostDto[]>("/api/posts"),
  getById: (id: number) => apiClient.get<BlogPostDto>(`/api/posts/${id}`),
  create: (data: BlogPostRequest) => apiClient.post<BlogPostDto>("/api/posts", data),
  update: (id: number, data: BlogPostRequest) =>
    apiClient.put<BlogPostDto>(`/api/posts/${id}`, data),
  delete: (id: number) => apiClient.del<void>(`/api/posts/${id}`),
};
