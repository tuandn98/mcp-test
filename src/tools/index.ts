
import { walletTools } from "./wallet.js";
import type { ToolDefinition } from "../types/index.js";
import { orderTools } from "./order.js";
import { userTools } from "./user.js";

export const allTools: ToolDefinition[] = [
  ...walletTools,
  ...orderTools,
  ...userTools
];

// Re-export types for convenience
export type { ToolDefinition };
