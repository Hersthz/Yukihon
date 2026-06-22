import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { RestResource } from "@/api/createResource";
import type { QueryParams } from "@/lib/apiClient";

type QueryOpts<T> = Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">;
type MutationOpts<TData, TVars> = Omit<UseMutationOptions<TData, Error, TVars>, "mutationFn">;

/**
 * Generate TanStack Query hooks for a `createResource` REST client — the frontend twin of the
 * backend `base/` auto-CRUD: one line wires list/get/create/update/remove with caching and
 * automatic invalidation. Mutations invalidate the whole resource key so lists/details refetch.
 *
 *   const deckApi = createResource<Deck>("/api/decks");
 *   const deckHooks = createResourceHooks("decks", deckApi);
 *   const { data, isLoading } = deckHooks.useList();
 *   const create = deckHooks.useCreate();           // create.mutate(payload)
 */
export function createResourceHooks<T, C = Partial<T>, U = C>(
  resourceKey: string,
  api: RestResource<T, C, U>
) {
  const keys = {
    all: [resourceKey] as const,
    list: (params?: QueryParams) => [resourceKey, "list", params ?? null] as const,
    detail: (id: number | string) => [resourceKey, "detail", id] as const,
  };

  const useList = (params?: QueryParams, options?: QueryOpts<T[]>) =>
    useQuery({ queryKey: keys.list(params), queryFn: () => api.list(params), ...options });

  const useGet = (id: number | string, options?: QueryOpts<T>) =>
    useQuery({
      queryKey: keys.detail(id),
      queryFn: () => api.get(id),
      enabled: id !== undefined && id !== null && id !== "",
      ...options,
    });

  const useCreate = (options?: MutationOpts<T, C>) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: C) => api.create(payload),
      ...options,
      onSuccess: (...args) => {
        queryClient.invalidateQueries({ queryKey: keys.all });
        return options?.onSuccess?.(...args);
      },
    });
  };

  const useUpdate = (options?: MutationOpts<T, { id: number | string; payload: U }>) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, payload }: { id: number | string; payload: U }) => api.update(id, payload),
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

export default createResourceHooks;
