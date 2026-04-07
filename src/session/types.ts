/**
 * TronSave API host selection for this MCP client/session.
 * - `mainnet`: https://api.tronsave.io
 * - `dev`: https://api-dev.tronsave.io
 */
export type TronSaveNetworkPreference = "mainnet" | "dev";

/**
 * Persisted fields for one MCP logical session (HTTP transport may send `mcp-session-id`;
 * stdio uses a single implicit id — see {@link DEFAULT_STDIO_SESSION_KEY}).
 */
export interface SessionData {
  /** Overrides process.env.TRONSAVE_API_KEY for this session when non-empty. */
  apiKey?: string;
  /** When set, overrides NETWORK env for base URL resolution. */
  network?: TronSaveNetworkPreference;
  /** Last successful `session_configure` time (unix ms). */
  updatedAtMs?: number;
}

/**
 * Contract for backing session storage (in-memory today; swap for MongoDB/Redis if you need TTL or multi-node).
 */
export interface SessionStore {
  /** Returns a shallow copy of persisted data for `sessionId` (empty object if new). */
  get(sessionId: string): SessionData;
  /** Deep-merge style patch: `undefined` values remove that key from stored session. */
  patch(sessionId: string, patch: Partial<SessionData>): SessionData;
}
