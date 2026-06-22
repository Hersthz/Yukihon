import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { createAutoCrudHooks } from "./createAutoCrudHooks";
import type { AutoCrudClient, AutoCrudRow, Page } from "@/api/autoCrudApi";

const pageOf = (rows: AutoCrudRow[]): Page<AutoCrudRow> => ({
  content: rows,
  totalElements: rows.length,
  totalPages: 1,
  number: 0,
  size: 10,
});

const makeApi = (): AutoCrudClient<AutoCrudRow> => ({
  list: vi.fn(async () => pageOf([{ id: 1, title: "a" }])),
  get: vi.fn(async (id) => ({ id: Number(id), title: "a" })),
  create: vi.fn(async (body) => ({ id: 2, ...body })),
  update: vi.fn(async (id, body) => ({ id: Number(id), ...body })),
  remove: vi.fn(async () => undefined),
});

const makeWrapper = (client: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

const freshClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe("createAutoCrudHooks", () => {
  it("useList returns the paged payload from api.list", async () => {
    const api = makeApi();
    const hooks = createAutoCrudHooks("things", api);
    const { result } = renderHook(() => hooks.useList({ page: 0, size: 10 }), {
      wrapper: makeWrapper(freshClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.content).toEqual([{ id: 1, title: "a" }]);
    expect(result.current.data?.totalPages).toBe(1);
    expect(api.list).toHaveBeenCalledWith({ page: 0, size: 10 });
  });

  it("useUpdate sends id + body and invalidates the resource key", async () => {
    const api = makeApi();
    const hooks = createAutoCrudHooks("things", api);
    const client = freshClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => hooks.useUpdate(), { wrapper: makeWrapper(client) });
    await result.current.mutateAsync({ id: 3, body: { title: "edit" } });

    expect(api.update).toHaveBeenCalledWith(3, { title: "edit" });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["things"] });
  });

  it("useRemove deletes and invalidates", async () => {
    const api = makeApi();
    const hooks = createAutoCrudHooks("things", api);
    const client = freshClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => hooks.useRemove(), { wrapper: makeWrapper(client) });
    await result.current.mutateAsync(9);

    expect(api.remove).toHaveBeenCalledWith(9);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["things"] });
  });
});
