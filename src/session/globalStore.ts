import { MemorySessionStore } from "./memoryStore";
import type { SessionStore } from "./types";

/**
 * Shared store for the MCP server process. Replace with a Mongo-backed implementation
 * if you need persistence across restarts or multiple workers.
 */
let singleton: SessionStore = new MemorySessionStore();

/** For tests or future DI (e.g. MongoSessionStore). */
export function setSessionStore(store: SessionStore): void {
  singleton = store;
}

export function getSessionStore(): SessionStore {
  return singleton;
}
