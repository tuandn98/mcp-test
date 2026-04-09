import { describe, expect, it } from "vitest";

import { internalTools } from "../../src/tools/definitions/internal";

describe("internal tool input schemas (Zod)", () => {
  it("rejects invalid get_deposit_address amountTrx < 10", () => {
    const tool = internalTools.find((t) => t.name === "get_deposit_address");
    expect(tool).toBeTruthy();
    expect(() => tool!.inputSchema.parse({ amountTrx: 1 })).toThrow();
  });

  it("rejects invalid internal_order_details empty orderId", () => {
    const tool = internalTools.find((t) => t.name === "internal_order_details");
    expect(tool).toBeTruthy();
    expect(() => tool!.inputSchema.parse({ orderId: "" })).toThrow();
  });

  it("rejects negative pagination inputs", () => {
    const tool = internalTools.find((t) => t.name === "internal_order_history");
    expect(tool).toBeTruthy();
    expect(() => tool!.inputSchema.parse({ page: -1 })).toThrow();
    expect(() => tool!.inputSchema.parse({ pageSize: 0 })).toThrow();
  });
});

