import { describe, expect, it, vi } from "vitest"

import {
  buildMcpRequestContext,
  logMcpBuyEvent,
  logMcpHttpEvent,
  runWithMcpRequestContext,
  sanitizeForLog,
} from "../../src/observability/mcpEvents"

const { insertMcpEventMock, insertMcpBuyEventMock } = vi.hoisted(() => {
  return {
    insertMcpEventMock: vi.fn(),
    insertMcpBuyEventMock: vi.fn(),
  }
})

vi.mock("../../src/storage/mcpEventStore", () => {
  return {
    insertMcpEvent: insertMcpEventMock,
    insertMcpBuyEvent: insertMcpBuyEventMock,
  }
})

describe("mcp events observability", () => {
  it("sanitizes sensitive fields recursively", () => {
    const sanitized = sanitizeForLog({
      apikey: "raw-key",
      nested: {
        privateKey: "abc",
        keep: "safe",
      },
    })

    expect(sanitized).toEqual({
      apikey: "[REDACTED]",
      nested: {
        privateKey: "[REDACTED]",
        keep: "safe",
      },
    })
  })

  it("logs http event when client source is mcp", async () => {
    insertMcpEventMock.mockResolvedValue(undefined)
    const context = buildMcpRequestContext({
      clientSource: "mcp",
      toolName: "tronsave_internal_order_create",
      clientHint: "cursor",
      apiPath: "/mcp",
      apiMethod: "POST",
      requestStartedAtMs: Date.now(),
      inputParamsRaw: { receiver: "Txyz" },
    })

    await runWithMcpRequestContext(context, async () => {
      await logMcpHttpEvent({ statusCode: 200, latencyMs: 12 })
    })

    expect(insertMcpEventMock).toHaveBeenCalledTimes(1)
    expect(insertMcpEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mcpCorrelationId: context.mcpCorrelationId,
        result: "success",
        apiPath: "/mcp",
      }),
    )
  })

  it("logs buy event with order id link", async () => {
    insertMcpBuyEventMock.mockResolvedValue(undefined)
    const context = buildMcpRequestContext({
      clientSource: "mcp",
      toolName: "tronsave_internal_order_create",
      clientHint: "cursor",
      apiPath: "/mcp",
      apiMethod: "POST",
      requestStartedAtMs: Date.now(),
      inputParamsRaw: { receiver: "Txyz" },
    })

    await runWithMcpRequestContext(context, async () => {
      await logMcpBuyEvent({
        address: "Txyz",
        latencyMs: 25,
        result: "success",
        orderId: "order-1",
        inputParamsRaw: { receiver: "Txyz", privateKey: "hidden" },
      })
    })

    expect(insertMcpBuyEventMock).toHaveBeenCalledTimes(1)
    expect(insertMcpBuyEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mcpCorrelationId: context.mcpCorrelationId,
        address: "Txyz",
        outputRef: { orderId: "order-1" },
      }),
    )
  })
})
