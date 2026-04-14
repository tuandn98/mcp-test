# Authentication and environment

This document describes how **TronSave API authentication** and **runtime environment** affect internal tool handlers.

## Environment variables

| Variable | Meaning in current code |
|----------|-------------------------|
| `TRONSAVE_API_KEY` | **Required** for every internal API call. If missing, handlers return a clear error before HTTP. Sent as the `apikey` header. |
| `NETWORK` | If set to `mainnet`, base URL is `https://api.tronsave.io`. Otherwise (default) `https://api-dev.tronsave.io`. Logic in `src/tools/handlers/helper.ts`. |
| `MONGODB_URI` | Optional. When set, MCP observability events are written to MongoDB collections `mcp_events` and `mcp_buy_events`. |
| `MONGODB_DB_NAME` | Optional MongoDB database name for MCP observability collections. Defaults to `tronsave_mcp`. |

## Scripts and `TL_MODE`

`npm run start:e2e` and `start:prod` in `package.json` set `TL_MODE`. **TypeScript source does not read `TL_MODE` today** — API behavior is driven mainly by `TRONSAVE_API_KEY` and `NETWORK`.

## Schema-level behavior

Detailed model-facing text (when to call, read-only versus mutating) is standardized via `withTronSaveAuth` in `src/tools/definitions/internal/schema.ts`, including the `TRONSAVE_API_KEY` requirement.

## Request source classification metadata

- The streamable HTTP layer reads `x-client-source` to classify incoming requests as `mcp` or `user`.
- This header is used only for observability metadata (logging and analytics).
- Authorization does not trust `x-client-source` alone, and current `apikey` authorization remains unchanged.
- Recommended MCP metadata headers for analytics are `x-mcp-tool-name` and `x-mcp-client`.

## MCP observability collections

- `mcp_events`: one document per MCP HTTP request, including `mcpCorrelationId`, route metadata, status, and latency.
- `mcp_buy_events`: buy-funnel document for order creation flow, linked to HTTP log rows by the same `mcpCorrelationId`.
- Both writes are best-effort; failures do not fail tool execution.

## Related documents

- [mcp-implementation.md](./mcp-implementation.md) — End-to-end request flow
- [guides/deployment-guide.md](../guides/deployment-guide.md) — Run modes and operations
