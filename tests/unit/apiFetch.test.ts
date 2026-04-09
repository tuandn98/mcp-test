import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiFetchError, apiFetch } from "../../src/utils/apiFetch";

describe("utils/apiFetch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when relative path is used without baseUrl", async () => {
    await expect(apiFetch("/v1/ping", {})).rejects.toBeInstanceOf(ApiFetchError);
    await expect(apiFetch("/v1/ping", {})).rejects.toThrow('requires a baseUrl');
  });

  it("merges baseUrl + path and appends query params", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

    const res = await apiFetch("orders", {
      baseUrl: "https://api.example.com/v1/",
      query: { page: 1, q: "x", skip: undefined },
    });

    expect(res).toEqual({ ok: true });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const calledUrl = String(fetchSpy.mock.calls[0]?.[0]);
    expect(calledUrl).toContain("https://api.example.com/v1/orders");
    expect(calledUrl).toContain("page=1");
    expect(calledUrl).toContain("q=x");
    expect(calledUrl).not.toContain("skip=");
  });

  it("adds content-type: application/json when body is set (unless overridden)", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

    await apiFetch("https://api.example.com/v1/x", {
      method: "POST",
      body: { a: 1 },
      headers: { "x-test": "1" },
    });

    const init = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.accept).toBe("application/json");
    expect(headers["content-type"]).toBe("application/json");
  });

  it("wraps invalid JSON response in ApiFetchError", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("not-json", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    try {
      await apiFetch("https://api.example.com/v1/x", {});
      throw new Error("Expected apiFetch to throw");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiFetchError);
      const err = e as ApiFetchError;
      expect(err.url).toBe("https://api.example.com/v1/x");
      expect(err.method).toBe("GET");
      // Some runtimes wrap/normalize parse failures; message must remain informative.
      expect(err.message).toMatch(/Invalid JSON response|Failed to call API/);
    }
  });
});

