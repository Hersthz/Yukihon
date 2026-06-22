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
  list: (params: ListParams = {}) =>
    apiClient.get<Page<AutoCrudRow>>(`/api/auto/${path}`, { ...params }),
  get: (id: number | string) => apiClient.get<AutoCrudRow>(`/api/auto/${path}/${id}`),
  create: (body: Record<string, unknown>) => apiClient.post<AutoCrudRow>(`/api/auto/${path}`, body),
  update: (id: number | string, body: Record<string, unknown>) =>
    apiClient.put<AutoCrudRow>(`/api/auto/${path}/${id}`, body),
  remove: (id: number | string) => apiClient.del<void>(`/api/auto/${path}/${id}`),
});

export default createAutoCrudApi;
