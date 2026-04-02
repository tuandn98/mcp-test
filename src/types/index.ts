import { z } from "zod";

/**
 * Tool definition interface
 * Each tool must have a name, description, input schema, and handler
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodObject<Record<string, z.ZodType>>;
  handler: (input: Record<string, unknown>) => Promise<any>;
}
export type ToolResponse ={
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

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
