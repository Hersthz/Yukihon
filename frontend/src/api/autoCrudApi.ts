import apiClient from "@/lib/apiClient";

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export type AutoCrudRow = Record<string, unknown> & { id: number };

export interface ListParams {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
}

/** Generic client for any @AutoCrud resource served at /api/auto/{path}. */
export const createAutoCrudApi = (path: string) => ({
  list: (params: ListParams = {}) => {
    const query = new URLSearchParams();
    if (params.page != null) query.set("page", String(params.page));
    if (params.size != null) query.set("size", String(params.size));
    if (params.search) query.set("search", params.search);
    if (params.sort) query.set("sort", params.sort);
    const qs = query.toString();
    return apiClient.request<Page<AutoCrudRow>>(`/api/auto/${path}${qs ? `?${qs}` : ""}`);
  },
  get: (id: number | string) => apiClient.request<AutoCrudRow>(`/api/auto/${path}/${id}`),
  create: (body: Record<string, unknown>) =>
    apiClient.request<AutoCrudRow>(`/api/auto/${path}`, { method: "POST", body: JSON.stringify(body) }),
  update: (id: number | string, body: Record<string, unknown>) =>
    apiClient.request<AutoCrudRow>(`/api/auto/${path}/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: number | string) =>
    apiClient.request<void>(`/api/auto/${path}/${id}`, { method: "DELETE" }),
});

export default createAutoCrudApi;
