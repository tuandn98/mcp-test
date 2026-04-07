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
      "Shows masked session bucket id, isolation source (OAuth vs tenant header vs transport vs stdio-shared), whether a TronSave API key is available, masked key preview, and effective API cluster. Read-only; safe without TRONSAVE_API_KEY. For multi-tenant HTTP set MCP_REQUIRE_ISOLATION and MCP_TENANT_HEADER or MCP OAuth so users cannot share buckets.",
    inputSchema: EmptyInputSchema,
    outputSchema: sessionGetOutputSchema,
    handler: sessionGetHandler,
  },
  {
    name: "session_configure",
    title: "Session — set API key or network for this MCP session",
    description:
      "Stores TronSave API key and/or network in the **isolated bucket** for this request (OAuth token, MCP_TENANT_HEADER value, mcp-session-id, or stdio-shared). Overrides env for subsequent calls in that bucket only. Keys are never echoed in full. For HTTP multi-tenant, require MCP_REQUIRE_ISOLATION + per-user header or validated OAuth.",
    inputSchema: sessionConfigureInputSchema,
    outputSchema: sessionConfigureOutputSchema,
    handler: sessionConfigureHandler,
  },
];
