import z from "zod";

/** Shared enum for configure + output display. */
export const networkPreferenceSchema = z
  .enum(["mainnet", "dev"])
  .describe("TronSave API cluster: mainnet production or dev (api-dev.tronsave.io).");

/** Optional null clears session override and falls back to NETWORK env. */
export const sessionConfigureInputSchema = z.object({
  /**
   * Set TronSave API key for this MCP session only (in-memory). Overrides TRONSAVE_API_KEY until cleared.
   */
  apiKey: z.string().min(1).optional().describe("Non-empty API key to store for this session."),
  /**
   * When true, removes the session-stored key so subsequent calls use env again.
   */
  clearApiKey: z
    .boolean()
    .optional()
    .describe("If true, drop session apiKey; env TRONSAVE_API_KEY applies on the next tool call."),
  /**
   * Pin API host for this session. Pass `null` via JSON to clear and use NETWORK env again.
   */
  network: networkPreferenceSchema
    .nullable()
    .optional()
    .describe("mainnet | dev; null clears session override."),
});

export type SessionConfigureInput = z.infer<typeof sessionConfigureInputSchema>;

export const isolationSourceSchema = z.enum([
  "validated_oauth_token",
  "tenant_header",
  "mcp_transport_session",
  "stdio_default",
]);

export const sessionGetOutputSchema = z.object({
  sessionBucketPreview: z
    .string()
    .describe("Masked storage bucket id — safe to show; never exposes raw tenant token or full session key."),
  isolationSource: isolationSourceSchema.describe(
    "How the server chose the bucket: OAuth token, tenant header, MCP transport session id, or stdio shared process bucket.",
  ),
  apiKeySource: z.enum(["session", "environment", "none"]).describe("Where the effective API key comes from."),
  apiKeyConfigured: z.boolean().describe("Whether any effective API key is available for TronSave calls."),
  apiKeyPreview: z.string().nullable().describe("Masked preview of effective key, or null."),
  effectiveNetwork: z.enum(["mainnet", "dev"]),
  networkSource: z.enum(["session", "environment"]).describe("Whether network came from session patch or NETWORK env."),
});

export const sessionConfigureOutputSchema = z.object({
  sessionBucketPreview: z.string().describe("Masked bucket affected by this configure call."),
  message: z.string(),
  /** Which logical fields were applied (not necessarily changed). */
  applied: z.object({
    apiKey: z.boolean(),
    clearApiKey: z.boolean(),
    network: z.boolean(),
  }),
});
