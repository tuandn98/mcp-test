
import type { ToolDefinition } from "./definition_type.js";
import { internalTools } from "./internal/index.js";

export const allTools: ToolDefinition[] = [
  ...internalTools,
];
