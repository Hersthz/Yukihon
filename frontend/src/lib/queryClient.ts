import { QueryClient } from "@tanstack/react-query";

/**
 * Shared TanStack Query client with project-wide defaults.
 * - staleTime 30s: avoid refetch storms on quick remounts/navigation.
 * - one retry: transient network blips recover; real 4xx/5xx surface fast.
 * - no refetch on window focus: learning UI shouldn't flicker when tabbing back.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default queryClient;
