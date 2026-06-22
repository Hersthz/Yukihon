import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { AutoCrudClient, AutoCrudRow, ListParams, Page } from "@/api/autoCrudApi";

type QueryOpts<T> = Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">;
type MutationOpts<TData, TVars> = Omit<UseMutationOptions<TData, Error, TVars>, "mutationFn">;

/**
 * TanStack Query hooks for a paged @AutoCrud resource (/api/auto/{path}).
 * Twin of `createResourceHooks`, but list is paged (`Page<T>` + `ListParams`).
 * Mutations invalidate the resource key so the current page refetches.
 *
 *   const api = createAutoCrudApi<Schema<"DeckDto">>("decks");
 *   const deckHooks = createAutoCrudHooks("decks", api);
 *   const { data } = deckHooks.useList({ page, size, search });   // data.content, data.totalPages
 */
export function createAutoCrudHooks<T extends { id: number | string } = AutoCrudRow>(
  resourceKey: string,
  api: AutoCrudClient<T>
) {
  const keys = {
    all: [resourceKey] as const,
    list: (params?: ListParams) => [resourceKey, "list", params ?? null] as const,
    detail: (id: number | string) => [resourceKey, "detail", id] as const,
  };

  const useList = (params?: ListParams, options?: QueryOpts<Page<T>>) =>
    useQuery({ queryKey: keys.list(params), queryFn: () => api.list(params), ...options });

  const useGet = (id: number | string, options?: QueryOpts<T>) =>
    useQuery({
      queryKey: keys.detail(id),
      queryFn: () => api.get(id),
      enabled: id !== undefined && id !== null && id !== "",
      ...options,
    });

  const useCreate = (options?: MutationOpts<T, Record<string, unknown>>) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (body: Record<string, unknown>) => api.create(body),
      ...options,
      onSuccess: (...args) => {
        queryClient.invalidateQueries({ queryKey: keys.all });
        return options?.onSuccess?.(...args);
      },
    });
  };

  const useUpdate = (
    options?: MutationOpts<T, { id: number | string; body: Record<string, unknown> }>
  ) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, body }: { id: number | string; body: Record<string, unknown> }) =>
        api.update(id, body),
      ...options,
      onSuccess: (...args) => {
        queryClient.invalidateQueries({ queryKey: keys.all });
        return options?.onSuccess?.(...args);
      },
    });
  };

  const useRemove = (options?: MutationOpts<void, number | string>) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: number | string) => api.remove(id),
      ...options,
      onSuccess: (...args) => {
        queryClient.invalidateQueries({ queryKey: keys.all });
        return options?.onSuccess?.(...args);
      },
    });
  };

  return { keys, useList, useGet, useCreate, useUpdate, useRemove };
}

export default createAutoCrudHooks;
