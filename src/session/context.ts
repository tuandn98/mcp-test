import { AsyncLocalStorage } from "node:async_hooks";
import type { IsolationSource, ResolvedIsolation } from "./isolation";
import type { SessionData, SessionStore } from "./types";

/**
 * Per-request context: isolated storage bucket + snapshot at request entry.
 * `sessionId` is the **storage key** into SessionStore (historical name); prefer `maskStorageKeyForDisplay` for logs/UI.
 */
export interface SessionRuntimeContext {
  sessionId: string;
  isolationSource: IsolationSource;
  data: SessionData;
}

const sessionAls = new AsyncLocalStorage<SessionRuntimeContext>();

export function getSessionRuntime(): SessionRuntimeContext | undefined {
  return sessionAls.getStore();
}

/**
 * Loads persisted session for the resolved isolation bucket and runs `fn` with ALS populated.
 * Call after {@link enforceIsolationIfConfigured} from {@link server.ts}.
 */
export function runWithSession<R>(store: SessionStore, isolation: ResolvedIsolation, fn: () => R | Promise<R>): Promise<R> {
  const data = store.get(isolation.storageKey);
  return Promise.resolve(
    sessionAls.run({ sessionId: isolation.storageKey, isolationSource: isolation.source, data }, fn),
  );
}
