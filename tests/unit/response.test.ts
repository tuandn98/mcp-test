import { describe, expect, it } from "vitest";

import { err, ok, safe } from "../../src/utils/response";

describe("utils/response", () => {
  it("ok() wraps primitive structuredContent into { data } record", () => {
    const res = ok("hello");
    expect(res.isError).toBe(false);
    expect(res.structuredContent).toEqual({ data: "hello" });
    expect(res.content[0]?.type).toBe("text");
  });

  it("ok() keeps object structuredContent as-is", () => {
    const res = ok({ a: 1, b: "x" });
    expect(res.structuredContent).toEqual({ a: 1, b: "x" });
  });

  it("ok() transforms unix seconds timestamps to ISO strings recursively", () => {
    const res = ok({
      createdAt: 1,
      nested: [{ updatedAt: 2 }],
    });
    expect(res.structuredContent).toEqual({
      createdAt: new Date(1_000).toISOString(),
      nested: [{ updatedAt: new Date(2_000).toISOString() }],
    });
  });

  it("err() returns isError and serializes message", () => {
    const res = err("boom", { code: "X" });
    expect(res.isError).toBe(true);
    expect(res.content[0]?.type).toBe("text");
    expect(res.content[0]?.text).toContain('"message": "boom"');
    expect(res.content[0]?.text).toContain('"details"');
  });

  it("safe() wraps thrown errors into ToolResponse err()", async () => {
    const handler = safe(async () => {
      throw new Error("nope");
    });
    const res = await handler({} as never, {} as never);
    expect(res.isError).toBe(true);
    expect(res.content[0]?.text).toContain("nope");
  });
});

