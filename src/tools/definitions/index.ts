
import type { ToolDefinition } from "./definition_type.js";
import { internalTools } from "./internal/index.js";
import { providerTools } from "./provider/index.js";

export const allTools: ToolDefinition[] = [
  ...internalTools,
  ...providerTools,
];
