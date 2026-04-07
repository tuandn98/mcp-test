import { AsyncLocalStorage } from "node:async_hooks";
import type { ServerNotification, ServerRequest } from "@modelcontextprotocol/sdk/types.js";
import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type { SessionData, SessionStore } from "./types";

/** Key used when the transport does not provide `extra.sessionId` (typical for stdio). */
export const DEFAULT_STDIO_SESSION_KEY = "__stdio__";

/**
 * Per-request context: which session this tool call belongs to and the snapshot of DB at request entry.
 * Handlers that mutate the store (e.g. `session_configure`) update persistence; the ALS snapshot updates on the next request.
 */
export interface SessionRuntimeContext {
  sessionId: string;
  data: SessionData;
}

const sessionAls = new AsyncLocalStorage<SessionRuntimeContext>();

export function getSessionRuntime(): SessionRuntimeContext | undefined {
  return sessionAls.getStore();
}

/**
 * Loads persisted session for this MCP request and runs `fn` with ALS populated.
 * Must wrap every tool invocation from {@link server.ts} so `fetchApiInternal` can resolve API key/network.
 */
export function runWithSession<R>(
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>,
  store: SessionStore,
  fn: () => R | Promise<R>,
): Promise<R> {
  const sessionId = extra.sessionId?.trim() || DEFAULT_STDIO_SESSION_KEY;
  const data = store.get(sessionId);
  return Promise.resolve(sessionAls.run({ sessionId, data }, fn));
}
