import type { ToolDefinition } from "../definition_type";
import { EmptyInputSchema } from "../shares";
import { sessionConfigureHandler, sessionGetHandler } from "../../handlers/session";
import {
  sessionConfigureInputSchema,
  sessionConfigureOutputSchema,
  sessionGetOutputSchema,
} from "./schema";

/**
 * Tools to inspect and mutate per-MCP-session state (API key + network override).
 * Independent of TronSave API — no `apikey` header required for `session_get`.
 */
export const sessionTools: ToolDefinition[] = [
  {
    name: "session_get",
    title: "Session — read MCP session and credential source",
    description:
      "Shows the active MCP session id (from transport or stdio default), whether a TronSave API key is available, masked key preview, and effective API cluster (mainnet vs dev). Read-only; safe to call without TRONSAVE_API_KEY. Use to verify client configuration before calling internal tools.",
    inputSchema: EmptyInputSchema,
    outputSchema: sessionGetOutputSchema,
    handler: sessionGetHandler,
  },
  {
    name: "session_configure",
    title: "Session — set API key or network for this MCP session",
    description:
      "Stores TronSave API key and/or network (mainnet vs dev) in memory for the current MCP session. Overrides process env for subsequent internal TronSave tools until cleared. session scope: HTTP transports use mcp-session-id; stdio uses a single process-wide default id. Keys are never echoed back in full. Clearing apiKey falls back to TRONSAVE_API_KEY.",
    inputSchema: sessionConfigureInputSchema,
    outputSchema: sessionConfigureOutputSchema,
    handler: sessionConfigureHandler,
  },
];
