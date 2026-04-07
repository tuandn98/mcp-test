import { getEffectiveApiKey, getEffectiveBaseUrl } from "../../session/credentials";
import { createApiFetch } from "../../utils/apiFetch";
import { err } from "../../utils/response";

/**
 * Builds a fresh client each call so `session_configure` overrides (API key, base URL) apply immediately.
 * Relies on {@link runWithSession} in server.ts populating AsyncLocalStorage for the request.
 */
export const fetchApiInternal = async <T>(path: string, options: Record<string, unknown> = {}) => {
  const apiKey = getEffectiveApiKey();
  if (!apiKey || apiKey.trim().length === 0) {
    return err(
      "Missing TronSave API key: set TRONSAVE_API_KEY or call session_configure with apiKey.",
      { path },
    );
  }

  const fetchApiBase = createApiFetch({
    baseUrl: getEffectiveBaseUrl(),
    defaults: {
      headers: {
        apikey: apiKey,
      },
    },
  });

  return fetchApiBase<T>(path, options);
};