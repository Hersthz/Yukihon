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

/**
 * Typed client for any @AutoCrud resource served at /api/auto/{path}.
 * The wire spec is generic (rows are `object`), so pass a row type when you know it:
 *   createAutoCrudApi<Schema<"DeckDto">>("decks")
 * Defaults to the loose `AutoCrudRow` for the metadata-driven generic admin page.
 */
export interface AutoCrudClient<T> {
  list: (params?: ListParams) => Promise<Page<T>>;
  get: (id: number | string) => Promise<T>;
  create: (body: Record<string, unknown>) => Promise<T>;
  update: (id: number | string, body: Record<string, unknown>) => Promise<T>;
  remove: (id: number | string) => Promise<void>;
}

export const createAutoCrudApi = <T = AutoCrudRow>(path: string): AutoCrudClient<T> => ({
  list: (params: ListParams = {}) => apiClient.get<Page<T>>(`/api/auto/${path}`, { ...params }),
  get: (id: number | string) => apiClient.get<T>(`/api/auto/${path}/${id}`),
  create: (body: Record<string, unknown>) => apiClient.post<T>(`/api/auto/${path}`, body),
  update: (id: number | string, body: Record<string, unknown>) =>
    apiClient.put<T>(`/api/auto/${path}/${id}`, body),
  remove: (id: number | string) => apiClient.del<void>(`/api/auto/${path}/${id}`),
});

export default createAutoCrudApi;
