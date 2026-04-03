
import type { ToolDefinition } from "./definition_type.js";
import { internalTools } from "./internal/internal.js";

export const allTools: ToolDefinition[] = [
  ...internalTools,
];
