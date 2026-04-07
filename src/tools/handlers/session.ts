import type { SessionData } from "../../session";
import {
  getEffectiveApiKey,
  getEffectiveNetworkPreference,
  getSessionRuntime,
  getSessionStore,
} from "../../session";
import { err, ok, safe } from "../../utils/response";
import type { SessionConfigureInput } from "../definitions/session/schema";

/**
 * Masks API keys for tool output — never return full secrets in MCP responses.
 */
function maskApiKey(key: string | undefined): string | null {
  if (!key?.trim()) {
    return null;
  }
  const t = key.trim();
  if (t.length <= 8) {
    return "****";
  }
  return `${t.slice(0, 4)}…${t.slice(-4)}`;
}

/**
 * Read resolved MCP session id and where TronSave credentials come from (session vs env).
 * Does not require an API key — useful for debugging client setup.
 */
export const sessionGetHandler = safe(async () => {
  const rt = getSessionRuntime();
  if (!rt) {
    return err("Internal error: session context missing (server must wrap tools with runWithSession).");
  }
  const stored = getSessionStore().get(rt.sessionId);
  const effective = getEffectiveApiKey();
  const hasEnv = Boolean(process.env.TRONSAVE_API_KEY?.trim());
  const hasSessionKey = Boolean(stored.apiKey?.trim());

  let apiKeySource: "session" | "environment" | "none";
  if (hasSessionKey) {
    apiKeySource = "session";
  } else if (hasEnv) {
    apiKeySource = "environment";
  } else {
    apiKeySource = "none";
  }

  const networkSource = stored.network ? "session" : "environment";

  return ok({
    sessionId: rt.sessionId,
    apiKeySource,
    apiKeyConfigured: Boolean(effective),
    apiKeyPreview: maskApiKey(effective),
    effectiveNetwork: getEffectiveNetworkPreference(),
    networkSource,
  });
});

/**
 * Patch in-memory session: API key and/or API cluster. Values persist until process exit unless cleared.
 * With HTTP MCP transport, each `mcp-session-id` gets an isolated row in the store; stdio shares one default id.
 */
export const sessionConfigureHandler = safe(async (input: SessionConfigureInput) => {
  const rt = getSessionRuntime();
  if (!rt) {
    return err("Internal error: session context missing (server must wrap tools with runWithSession).");
  }

  const applied = {
    apiKey: false,
    clearApiKey: false,
    network: false,
  };

  const patch: Partial<SessionData> = {};

  if (input.clearApiKey) {
    patch.apiKey = undefined;
    applied.clearApiKey = true;
  } else if (input.apiKey !== undefined) {
    patch.apiKey = input.apiKey.trim();
    applied.apiKey = true;
  }

  if (input.network !== undefined) {
    applied.network = true;
    if (input.network === null) {
      patch.network = undefined;
    } else {
      patch.network = input.network;
    }
  }

  if (!applied.apiKey && !applied.clearApiKey && !applied.network) {
    return ok({
      sessionId: rt.sessionId,
      message: "No changes supplied.",
      applied,
    });
  }

  getSessionStore().patch(rt.sessionId, patch);

  return ok({
    sessionId: rt.sessionId,
    message: "Session updated. Credentials apply to subsequent TronSave tool calls in this MCP session.",
    applied,
  });
});
