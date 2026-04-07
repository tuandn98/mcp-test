import { getSessionRuntime } from "./context";
import type { TronSaveNetworkPreference } from "./types";

const MAINNET_URL = "https://api.tronsave.io";
const DEV_URL = "https://api-dev.tronsave.io";

/**
 * API key: session override first, then TRONSAVE_API_KEY (env).
 */
export function getEffectiveApiKey(): string | undefined {
  const fromSession = getSessionRuntime()?.data.apiKey?.trim();
  if (fromSession) {
    return fromSession;
  }
  const fromEnv = process.env.TRONSAVE_API_KEY?.trim();
  return fromEnv || undefined;
}

/**
 * Base URL: session.network → env NETWORK (mainnet vs dev) — matches previous helper behavior.
 */
export function getEffectiveBaseUrl(): string {
  const pref = getSessionRuntime()?.data.network;
  if (pref === "mainnet") {
    return MAINNET_URL;
  }
  if (pref === "dev") {
    return DEV_URL;
  }
  return process.env.NETWORK === "mainnet" ? MAINNET_URL : DEV_URL;
}

/** Derive default network from env when the session has no `network` patch. */
export function getEnvNetworkPreference(): TronSaveNetworkPreference {
  return process.env.NETWORK === "mainnet" ? "mainnet" : "dev";
}

/** Resolved network after applying session override, then env — for UX in `session_get`. */
export function getEffectiveNetworkPreference(): TronSaveNetworkPreference {
  const fromSession = getSessionRuntime()?.data.network;
  if (fromSession) {
    return fromSession;
  }
  return getEnvNetworkPreference();
}
