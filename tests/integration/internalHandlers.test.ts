import { describe, expect, it, vi } from "vitest";

function parseToolTextJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

describe("internal handlers (mock fetch)", () => {
  it("getInternalAccountHandler calls fetch with baseUrl + path and apikey header", async () => {
    process.env.TRONSAVE_API_KEY = "test-key";
    delete process.env.NETWORK;

    vi.resetModules();

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ error: false, message: "ok", data: { id: "u1", balance: "1" } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

    const { getInternalAccountHandler } = await import("../../src/tools/handlers/internal");
    const res = await getInternalAccountHandler({} as any, {} as any);

    expect(res.isError).toBe(false);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api-dev.tronsave.io/v2/user-info");
    expect(init.method).toBe("GET");

    const headers = init.headers as Record<string, string>;
    // createApiFetch sets accept, helper sets apikey.
    expect(headers.accept).toBe("application/json");
    expect(headers.apikey).toBe("test-key");
  });

  it("getInternalAccountHandler returns clear error when TRONSAVE_API_KEY missing", async () => {
    process.env.TRONSAVE_API_KEY = "";
    delete process.env.NETWORK;

    vi.resetModules();

    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { getInternalAccountHandler } = await import("../../src/tools/handlers/internal");

    const res = await getInternalAccountHandler({} as any, {} as any);
    expect(res.isError).toBe(true);

    const text = res.content[0]?.text ?? "";
    expect(text).toContain("TRONSAVE_API_KEY");

    // Should short-circuit before any HTTP call.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("getDepositAddressHandler returns amountTrx and forwards depositAddress from internal response", async () => {
    process.env.TRONSAVE_API_KEY = "test-key";
    delete process.env.NETWORK;

    vi.resetModules();

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          error: false,
          message: "ok",
          data: { depositAddress: "T123" },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const { getDepositAddressHandler } = await import("../../src/tools/handlers/internal");
    const res = await getDepositAddressHandler({ amountTrx: 10 } as any, {} as any);

    expect(res.isError).toBe(false);
    const json = parseToolTextJson(res.content[0]?.text ?? "");
    expect(json?.amountTrx).toBe(10);
    expect(json?.depositAddress).toBe("T123");
  });
});

