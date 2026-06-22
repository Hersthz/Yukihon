import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { createResourceHooks } from "./createResourceHooks";
import type { RestResource } from "@/api/createResource";

interface Thing {
  id: number;
  name: string;
}

const makeApi = (): RestResource<Thing> => ({
  list: vi.fn(async () => [{ id: 1, name: "a" }]),
  get: vi.fn(async (id) => ({ id: Number(id), name: "a" })),
  create: vi.fn(async (payload) => ({ id: 2, name: "", ...payload })),
  update: vi.fn(async (id, payload) => ({ id: Number(id), name: "", ...payload })),
  remove: vi.fn(async () => undefined),
});

const makeWrapper = (client: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

const freshClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe("createResourceHooks", () => {
  it("useList fetches through api.list and exposes data", async () => {
    const api = makeApi();
    const hooks = createResourceHooks("things", api);
    const { result } = renderHook(() => hooks.useList(), { wrapper: makeWrapper(freshClient()) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 1, name: "a" }]);
    expect(api.list).toHaveBeenCalledTimes(1);
  });

  it("useGet is disabled for empty id and enabled for a real id", async () => {
    const api = makeApi();
    const hooks = createResourceHooks("things", api);

    const disabled = renderHook(() => hooks.useGet(""), { wrapper: makeWrapper(freshClient()) });
    expect(disabled.result.current.fetchStatus).toBe("idle");
    expect(api.get).not.toHaveBeenCalled();

    const enabled = renderHook(() => hooks.useGet(5), { wrapper: makeWrapper(freshClient()) });
    await waitFor(() => expect(enabled.result.current.isSuccess).toBe(true));
    expect(api.get).toHaveBeenCalledWith(5);
  });

  it("useCreate calls api.create and invalidates the resource key", async () => {
    const api = makeApi();
    const hooks = createResourceHooks("things", api);
    const client = freshClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");

    const { result } = renderHook(() => hooks.useCreate(), { wrapper: makeWrapper(client) });
    await result.current.mutateAsync({ name: "new" });

    expect(api.create).toHaveBeenCalledWith({ name: "new" });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["things"] });
  });

  it("useUpdate passes id + payload and runs a caller-supplied onSuccess", async () => {
    const api = makeApi();
    const hooks = createResourceHooks("things", api);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => hooks.useUpdate({ onSuccess }), {
      wrapper: makeWrapper(freshClient()),
    });
    await result.current.mutateAsync({ id: 7, payload: { name: "edit" } });

    expect(api.update).toHaveBeenCalledWith(7, { name: "edit" });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
