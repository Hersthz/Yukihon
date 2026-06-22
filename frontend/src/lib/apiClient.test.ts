import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "./apiClient";

/** Capture the args the global fetch was called with, returning a canned JSON response. */
const stubFetch = (body: unknown = {}, init: { status?: number; contentType?: string } = {}) => {
  const status = init.status ?? 200;
  const headers = new Headers({ "content-type": init.contentType ?? "application/json" });
  const fetchMock = vi.fn(
    async () => new Response(status === 204 ? null : JSON.stringify(body), { status, headers })
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const lastCall = (fetchMock: ReturnType<typeof vi.fn>) => {
  const [url, options] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
  return { url, options };
};

describe("apiClient.buildQuery", () => {
  it("returns empty string for no/empty params", () => {
    expect(apiClient.buildQuery()).toBe("");
    expect(apiClient.buildQuery({})).toBe("");
  });

  it("skips null and undefined values", () => {
    expect(apiClient.buildQuery({ a: 1, b: null, c: undefined, d: "x" })).toBe("?a=1&d=x");
  });

  it("serializes booleans and numbers", () => {
    expect(apiClient.buildQuery({ page: 0, active: true })).toBe("?page=0&active=true");
  });

  it("repeats array values under the same key", () => {
    expect(apiClient.buildQuery({ tag: ["a", "b"] })).toBe("?tag=a&tag=b");
  });
});

describe("apiClient verb helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("get appends the query string and uses GET", async () => {
    const fetchMock = stubFetch({ ok: true });
    await apiClient.get("/api/decks", { page: 2 });
    const { url, options } = lastCall(fetchMock);
    expect(url).toBe("http://localhost:8080/api/decks?page=2");
    expect(options.method).toBe("GET");
  });

  it("post JSON-stringifies the body and sets POST", async () => {
    const fetchMock = stubFetch({ id: 1 });
    await apiClient.post("/api/decks", { title: "N5" });
    const { options } = lastCall(fetchMock);
    expect(options.method).toBe("POST");
    expect(options.body).toBe(JSON.stringify({ title: "N5" }));
  });

  it("post leaves FormData untouched", async () => {
    const fetchMock = stubFetch({});
    const fd = new FormData();
    fd.append("f", "v");
    await apiClient.post("/api/upload", fd);
    const { options } = lastCall(fetchMock);
    expect(options.body).toBeInstanceOf(FormData);
  });

  it("del issues a DELETE with no body", async () => {
    const fetchMock = stubFetch(null, { status: 204 });
    await apiClient.del("/api/decks/1/cards/9");
    const { options } = lastCall(fetchMock);
    expect(options.method).toBe("DELETE");
    expect(options.body).toBeUndefined();
  });

  it("attaches the bearer token when present", async () => {
    localStorage.setItem("yukihon_token", "tok123");
    const fetchMock = stubFetch({});
    await apiClient.get("/api/decks/mine");
    const { options } = lastCall(fetchMock);
    expect((options.headers as Record<string, string>).Authorization).toBe("Bearer tok123");
  });
});
