import type { SessionData, SessionStore } from "./types";

/**
 * In-process session map. Suitable for single MCP server process.
 * Data is lost on restart — use a persisted SessionStore for HA clusters.
 */
export class MemorySessionStore implements SessionStore {
  private readonly sessions = new Map<string, SessionData>();

  get(sessionId: string): SessionData {
    const row = this.sessions.get(sessionId);
    return row ? { ...row } : {};
  }

  patch(sessionId: string, patch: Partial<SessionData>): SessionData {
    const prev = this.sessions.get(sessionId) ?? {};
    const next: SessionData = { ...prev };
    for (const [key, value] of Object.entries(patch) as [keyof SessionData, SessionData[keyof SessionData]][]) {
      if (value === undefined) {
        delete next[key];
      } else {
        (next as Record<string, unknown>)[key as string] = value;
      }
    }
    const stamped: SessionData = { ...next, updatedAtMs: Date.now() };
    this.sessions.set(sessionId, stamped);
    return { ...stamped };
  }
}
