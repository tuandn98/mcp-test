import type { CallToolResult, ServerNotification, ServerRequest } from "@modelcontextprotocol/sdk/types.js";
import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { z } from "zod";

/**
 * Tool definition interface
 * Each tool must have a name, description, input schema, and handler
 */
export type ToolResponse = CallToolResult;
export interface ToolDefinition {
  name: string;
  title: string;
  description: string;
  inputSchema: z.ZodObject<Record<string, z.ZodTypeAny>>;
  outputSchema: z.ZodObject<Record<string, z.ZodTypeAny>>;
  handler: (
    args: Record<string, unknown>,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
  ) => ToolResponse | Promise<ToolResponse>;
}
