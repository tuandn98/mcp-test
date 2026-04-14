import { createApiFetch } from "../../utils/apiFetch";
import { err } from "../../utils/response";

const getBaseUrl = () => {
  return process.env.NETWORK === "mainnet" ? "https://api.tronsave.io" : "https://api-dev.tronsave.io";
};

// Internal API client. Note that we still set `apikey` header here,
// but we will validate it before every call in the exported proxy below.
const fetchApiBase = createApiFetch({
  baseUrl: getBaseUrl(),
  defaults: {
    headers: {
      apikey: process.env.TRONSAVE_API_KEY || "",
    },
  },
});

/**
 * Proxy wrapper that validates `TRONSAVE_API_KEY` before calling TronSave API.
 * This prevents confusing 401/403 errors later in the request stack.
 */
export const fetchApiInternal: typeof fetchApiBase = async <T>(path: string, options: any = {}) => {
  const apiKey = process.env.TRONSAVE_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return err("Missing required env var: TRONSAVE_API_KEY", { path });
  }

  return fetchApiBase<T>(path, options);
};
export const fetchGraphqlApi = async (query: string, variables: Record<string, any>, headers: Record<string, string> = {}) => {
  const URL = process.env.NETWORK === "mainnet" ? "https://api-dashboard.tronsave.io/graphql" : "https://api-dashboard-dev.tronsave.io/graphql";
  const response = await fetch(URL, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
};