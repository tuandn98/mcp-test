
import type { ToolDefinition } from "./definition_type";
import { internalTools } from "./internal/index";

export const allTools: ToolDefinition[] = [
  ...internalTools,
];
