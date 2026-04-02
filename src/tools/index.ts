
import { walletTools } from "./wallet.js";
import type { ToolDefinition } from "../types/index.js";

export const allTools: ToolDefinition[] = [
  ...walletTools,
];

// Re-export types for convenience
export type { ToolDefinition };
