import { ToolResponse } from "../types"

export function ok(data: any): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
    structuredContent: data,
    isError: false
  }
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