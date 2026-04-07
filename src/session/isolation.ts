import { createHmac } from "node:crypto";
import type { ServerNotification, ServerRequest } from "@modelcontextprotocol/sdk/types.js";
import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { DEFAULT_STDIO_SESSION_KEY } from "./types";

/**
 * How we chose the storage bucket for SessionStore — used for observability, not for authorization by itself.
 */
export type IsolationSource = "validated_oauth_token" | "tenant_header" | "mcp_transport_session" | "stdio_default";

export interface ResolvedIsolation {
  /** Opaque key into SessionStore; never log or return raw tenant material. */
  storageKey: string;
  source: IsolationSource;
}

function normalizeHeaderName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Read one header from MCP `requestInfo` (HTTP transports); supports string | string[].
 */
export function getRequestHeader(
  headers: Record<string, string | string[] | undefined> | undefined,
  name: string,
): string | undefined {
  if (!headers) {
    return undefined;
  }
  const want = normalizeHeaderName(name);
  for (const [k, v] of Object.entries(headers)) {
    if (normalizeHeaderName(k) === want) {
      if (Array.isArray(v)) {
        return v[0]?.trim();
      }
      return typeof v === "string" ? v.trim() : undefined;
    }
  }
  return undefined;
}

/**
 * Derive a stable, non-reversible storage key from a secret string (Bearer token, tenant id, etc.).
 * **Requires** `MCP_SESSION_KEY_SALT` in production so rainbow tables across deployments are useless.
 */
export function deriveStorageKey(secretMaterial: string): string {
  const salt = process.env.MCP_SESSION_KEY_SALT?.trim();
  if (!salt) {
    // Dev fallback — do not use in production without MCP_SESSION_KEY_SALT.
    return createHmac("sha256", "mcp-dev-only-salt-set-MCP_SESSION_KEY_SALT").update(secretMaterial).digest("hex");
  }
  return createHmac("sha256", salt).update(secretMaterial).digest("hex");
}

/**
 * Decide which isolated bucket this MCP request uses.
 *
 * Priority (strong identity first):
 * 1. `extra.authInfo.token` — OAuth/resource-server flow wired in MCP SDK (per access token).
 * 2. Header named by `MCP_TENANT_HEADER` — opaque tenant id **you** issue (UUID per customer); client sends it on every HTTP call (OpenClaw `headers`).
 * 3. `extra.sessionId` — transport session from Streamable HTTP (isolates concurrent clients if the id is unguessable; **not** proof of user identity).
 * 4. `DEFAULT_STDIO_SESSION_KEY` — single shared bucket for stdio (one trusted operator per process).
 */
export function resolveIsolation(extra: RequestHandlerExtra<ServerRequest, ServerNotification>): ResolvedIsolation {
  const token = extra.authInfo?.token?.trim();
  if (token) {
    return { storageKey: `a:${deriveStorageKey(token)}`, source: "validated_oauth_token" };
  }

  const tenantHeaderName = process.env.MCP_TENANT_HEADER?.trim();
  if (tenantHeaderName && extra.requestInfo?.headers) {
    const raw = getRequestHeader(
      extra.requestInfo.headers as Record<string, string | string[] | undefined>,
      tenantHeaderName,
    );
    if (raw) {
      return { storageKey: `t:${deriveStorageKey(raw)}`, source: "tenant_header" };
    }
  }

  const sid = extra.sessionId?.trim();
  if (sid) {
    return { storageKey: `mcp:${sid}`, source: "mcp_transport_session" };
  }

  return { storageKey: DEFAULT_STDIO_SESSION_KEY, source: "stdio_default" };
}

/**
 * When `MCP_REQUIRE_ISOLATION=true`, HTTP requests must carry **strong** tenant binding:
 * validated OAuth token **or** the configured tenant header. Plain `mcp-session-id` alone is rejected,
 * because anyone who obtains that id could otherwise reuse another user's in-memory bucket.
 */
export function enforceIsolationIfConfigured(
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
): { ok: true; isolation: ResolvedIsolation } | { ok: false; error: string } {
  const required =
    process.env.MCP_REQUIRE_ISOLATION === "1" ||
    process.env.MCP_REQUIRE_ISOLATION === "true" ||
    process.env.MCP_REQUIRE_ISOLATION === "yes";

  const isolation = resolveIsolation(extra);
  if (!required) {
    return { ok: true, isolation };
  }

  const looksLikeHttp = extra.requestInfo !== undefined;
  if (!looksLikeHttp) {
    return { ok: true, isolation };
  }

  const strong = isolation.source === "validated_oauth_token" || isolation.source === "tenant_header";
  if (strong) {
    return { ok: true, isolation };
  }

  return {
    ok: false,
    error:
      "Multi-tenant isolation is required for HTTP (MCP_REQUIRE_ISOLATION). " +
      "Configure MCP OAuth so authInfo is set, or set MCP_TENANT_HEADER and send a unique opaque value per user in that header (e.g. from OpenClaw mcp.servers headers). " +
      "Relying only on mcp-session-id is not accepted in this mode.",
  };
}

/**
 * Safe preview for tool output / logs — never expose full storage keys.
 */
export function maskStorageKeyForDisplay(storageKey: string): string {
  if (storageKey === DEFAULT_STDIO_SESSION_KEY) {
    return "stdio-shared";
  }
  if (storageKey.startsWith("mcp:")) {
    const id = storageKey.slice(4);
    if (id.length <= 8) {
      return "mcp:****";
    }
    return `mcp:…${id.slice(-6)}`;
  }
  if (storageKey.length <= 12) {
    return "****";
  }
  return `${storageKey.slice(0, 8)}…${storageKey.slice(-4)}`;
}
