import type { CallToolResult, ServerNotification, ServerRequest } from "@modelcontextprotocol/sdk/types.js";
import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { z } from "zod";

/**
 * Tool definition interface
 * Each tool must have a name, description, input schema, and handler
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodObject<Record<string, z.ZodTypeAny>>;
  /**
   * When `inputSchema` is provided, MCP will call tools with:
   * `(args, extra) => result`.
   *
   * We type this explicitly to avoid MCP's `ToolCallback<any>` union,
   * which also includes the zero-argument form.
   */
  
  handler: (
    args: Record<string, unknown>,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
  ) => ToolResponse | Promise<ToolResponse>;
}
export type ToolResponse = CallToolResult;

/**
 * Shared schemas for common patterns
 */
export const NameSchema = z.object({
  name: z.string().min(1).describe("Name identifier"),
});

export const IdSchema = z.object({
  id: z.string().min(1).describe("Resource ID"),
});

export const EmptySchema = z.object({});
