
import { walletTools } from "./wallet.js";
import type { ToolDefinition } from "../types/index.js";
import { orderTools } from "./order.js";

export const allTools: ToolDefinition[] = [
  ...walletTools,
  ...orderTools
];

// Re-export types for convenience
export type { ToolDefinition };
