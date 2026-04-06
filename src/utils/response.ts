import { ToolResponse } from "../tools/definitions/definition_type"

/**
 * MCP `CallToolResult.structuredContent` must be a JSON **object** (record of string keys).
 * Zod validates it as `z.record(z.string(), z.unknown())` — a top-level **array** fails with
 * "expected record, received array". Primitives and `null` are also invalid as the root value.
 *
 * We keep the human-readable `content[0].text` as the raw JSON of `data`, and only normalize
 * the machine-readable `structuredContent` shape here.
 */
function toStructuredContentRecord(data: unknown): Record<string, unknown> {
  if (data !== null && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return { data };
}

export function ok(data: unknown): ToolResponse {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
    structuredContent: toStructuredContentRecord(data),
    isError: false,
  };
}

export function err(message: string, details?: unknown): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            error: true,
            message,
            ...(details ? { details } : {}),
          },
          null,
          2
        ),
      },
    ],
    isError: true
  }
}

// Wrap handler trong try/catch — dùng khi đăng ký tool
export function safe<T>(
  handler: (input: T) => Promise<ToolResponse>
): (input: T, extra: unknown) => Promise<ToolResponse> {
  return async (input: T, _extra: unknown) => {
    try {
      return await handler(input)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      return err(message, e)
    }
  }
}