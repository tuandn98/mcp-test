import { AsyncLocalStorage } from "node:async_hooks"
import { randomUUID } from "node:crypto"
import { logger } from "../utils/logger"
import { insertMcpBuyEvent, insertMcpEvent } from "../storage/mcpEventStore"

export type ClientSource = "mcp" | "user"

export interface McpRequestContext {
  clientSource: ClientSource
  mcpCorrelationId?: string
  toolName: string
  clientHint: string
  apiPath: string
  apiMethod: string
  requestStartedAtMs: number
  inputParamsSanitized?: Record<string, unknown>
}

export interface McpHttpEvent {
  mcpCorrelationId: string
  toolName: string
  clientHint: string
  apiPath: string
  apiMethod: string
  httpStatus: number
  result: "success" | "error"
  errorCode?: string
  latencyMs: number
  createdAt: number
  inputParamsSanitized?: Record<string, unknown>
}

export interface McpBuyEvent {
  mcpCorrelationId: string
  address: string
  toolName: string
  clientHint: string
  apiPath: string
  apiMethod: string
  result: "success" | "error"
  errorCode?: string
  latencyMs: number
  createdAt: number
  outputRef?: {
    orderId?: string
  }
  inputParamsSanitized?: Record<string, unknown>
}

const SENSITIVE_KEYS = new Set([
  "apikey",
  "apiKey",
  "authorization",
  "token",
  "accessToken",
  "refreshToken",
  "privateKey",
  "private_key",
  "seed",
  "seedPhrase",
  "mnemonic",
  "signature",
  "rawSignature",
  "password",
  "secret",
])

const mcpRequestStore = new AsyncLocalStorage<McpRequestContext>()

export function runWithMcpRequestContext<T>(context: McpRequestContext, callback: () => Promise<T>): Promise<T> {
  return mcpRequestStore.run(context, callback)
}

export function getMcpRequestContext(): McpRequestContext | undefined {
  return mcpRequestStore.getStore()
}

export function buildMcpRequestContext(input: {
  clientSource: ClientSource
  toolName: string
  clientHint: string
  apiPath: string
  apiMethod: string
  requestStartedAtMs: number
  inputParamsRaw?: unknown
}): McpRequestContext {
  const { clientSource, toolName, clientHint, apiPath, apiMethod, requestStartedAtMs, inputParamsRaw } = input
  return {
    clientSource,
    mcpCorrelationId: clientSource === "mcp" ? randomUUID() : undefined,
    toolName,
    clientHint,
    apiPath,
    apiMethod,
    requestStartedAtMs,
    inputParamsSanitized: sanitizeForLog(inputParamsRaw),
  }
}

export function sanitizeForLog(value: unknown): Record<string, unknown> | undefined {
  const sanitized = sanitizeNode(value)
  if (sanitized !== null && typeof sanitized === "object" && !Array.isArray(sanitized)) {
    return sanitized as Record<string, unknown>
  }
  return undefined
}

function sanitizeNode(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeNode(item))
  }
  if (value !== null && typeof value === "object") {
    const source = value as Record<string, unknown>
    const result: Record<string, unknown> = {}
    for (const [key, node] of Object.entries(source)) {
      if (SENSITIVE_KEYS.has(key)) {
        result[key] = "[REDACTED]"
        continue
      }
      result[key] = sanitizeNode(node)
    }
    return result
  }
  return value
}

export async function logMcpHttpEvent(input: { statusCode: number; latencyMs: number }): Promise<void> {
  const context = getMcpRequestContext()
  if (!context || context.clientSource !== "mcp" || !context.mcpCorrelationId) {
    return
  }

  const event: McpHttpEvent = {
    mcpCorrelationId: context.mcpCorrelationId,
    toolName: context.toolName,
    clientHint: context.clientHint,
    apiPath: context.apiPath,
    apiMethod: context.apiMethod,
    httpStatus: input.statusCode,
    result: input.statusCode >= 400 ? "error" : "success",
    errorCode: input.statusCode >= 400 ? `HTTP_${input.statusCode}` : undefined,
    latencyMs: input.latencyMs,
    createdAt: Math.floor(Date.now() / 1000),
    inputParamsSanitized: context.inputParamsSanitized,
  }

  try {
    await insertMcpEvent(event)
  } catch (error) {
    logger.warn("Failed to insert MCP HTTP event", {
      reason: error instanceof Error ? error.message : String(error),
      mcpCorrelationId: context.mcpCorrelationId,
    })
  }
}

export async function logMcpBuyEvent(input: {
  address: string
  latencyMs: number
  result: "success" | "error"
  errorCode?: string
  orderId?: string
  inputParamsRaw?: unknown
}): Promise<void> {
  const context = getMcpRequestContext()
  if (!context || context.clientSource !== "mcp" || !context.mcpCorrelationId) {
    return
  }

  const event: McpBuyEvent = {
    mcpCorrelationId: context.mcpCorrelationId,
    address: input.address,
    toolName: context.toolName,
    clientHint: context.clientHint,
    apiPath: "/v2/buy-resource",
    apiMethod: "POST",
    result: input.result,
    errorCode: input.errorCode,
    latencyMs: input.latencyMs,
    createdAt: Math.floor(Date.now() / 1000),
    outputRef: input.orderId ? { orderId: input.orderId } : undefined,
    inputParamsSanitized: sanitizeForLog(input.inputParamsRaw),
  }

  try {
    await insertMcpBuyEvent(event)
  } catch (error) {
    logger.warn("Failed to insert MCP buy event", {
      reason: error instanceof Error ? error.message : String(error),
      mcpCorrelationId: context.mcpCorrelationId,
    })
  }
}
