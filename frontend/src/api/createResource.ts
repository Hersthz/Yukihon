import apiClient, { type QueryParams } from "@/lib/apiClient";

/**
 * Typed CRUD client for a plain REST collection at `basePath` (e.g. "/api/decks").
 * Mirrors the backend `base/` auto-CRUD ergonomics on the frontend: one line per resource.
 * For `/api/auto/{resource}` (paged, search/sort) use `createAutoCrudApi` instead.
 *
 *   const tagApi = createResource<Tag, CreateTag>("/api/tags");
 *   tagApi.list();  tagApi.get(1);  tagApi.create({...});  tagApi.update(1, {...});  tagApi.remove(1);
 */
export interface RestResource<T, C = Partial<T>, U = C> {
  list: (params?: QueryParams) => Promise<T[]>;
  get: (id: number | string) => Promise<T>;
  create: (payload: C) => Promise<T>;
  update: (id: number | string, payload: U) => Promise<T>;
  remove: (id: number | string) => Promise<void>;
}

export function createResource<T, C = Partial<T>, U = C>(basePath: string): RestResource<T, C, U> {
  const base = basePath.replace(/\/$/, "");
  return {
    list: (params) => apiClient.get<T[]>(base, params),
    get: (id) => apiClient.get<T>(`${base}/${id}`),
    create: (payload) => apiClient.post<T>(base, payload),
    update: (id, payload) => apiClient.put<T>(`${base}/${id}`, payload),
    remove: (id) => apiClient.del<void>(`${base}/${id}`),
  };
}

export default createResource;
