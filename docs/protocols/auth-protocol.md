# Authentication and environment

This document describes how **TronSave API authentication** and **runtime environment** affect internal tool handlers.

## Environment variables

| Variable | Meaning in current code |
|----------|-------------------------|
| `TRONSAVE_API_KEY` | **Required** for every internal API call. If missing, handlers return a clear error before HTTP. Sent as the `apikey` header. |
| `NETWORK` | If set to `mainnet`, base URL is `https://api.tronsave.io`. Otherwise (default) `https://api-dev.tronsave.io`. Logic in `src/tools/handlers/helper.ts`. |

## Scripts and `TL_MODE`

`npm run start:e2e` and `start:prod` in `package.json` set `TL_MODE`. **TypeScript source does not read `TL_MODE` today** — API behavior is driven mainly by `TRONSAVE_API_KEY` and `NETWORK`.

## Schema-level behavior

Detailed model-facing text (when to call, read-only versus mutating) is standardized via `withTronSaveAuth` in `src/tools/definitions/internal/schema.ts`, including the `TRONSAVE_API_KEY` requirement.

## Related documents

- [mcp-implementation.md](./mcp-implementation.md) — End-to-end request flow
- [guides/deployment-guide.md](../guides/deployment-guide.md) — Run modes and operations
