
import type { ToolDefinition } from "./definition_type.js";
import { internalTools } from "./internal/index.js";
import { sessionTools } from "./session/index.js";

export const allTools: ToolDefinition[] = [
  ...sessionTools,
  ...internalTools,
];
