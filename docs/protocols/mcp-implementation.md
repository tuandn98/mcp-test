# MCP implementation

This document describes how **tronsave-mcp-server** implements the Model Context Protocol (MCP) from the client’s perspective: tool naming, registration, and the path from an MCP tool call to TronSave HTTP.

## Tool naming

- Each tool has a short `name` in code (for example `internal_account_get`).
- When registered with the SDK, the exposed name is **`${TOOL_PREFIX}_${name}`** with `TOOL_PREFIX` = `tronsave` (`src/utils/constants.ts`).
- Example: the model must call **`tronsave_internal_account_get`**, not `internal_account_get` alone.

## Request flow for one tool call

1. Process runs `src/index.ts` → `StdioServerTransport` → `initServer()` (`src/server.ts`).
2. `initServer` creates the SDK `McpServer`, iterates `allTools` (via `src/tools/index.ts` → `src/tools/definitions/index.ts`).
3. Each tool: `registerTool` with Zod schemas + `handler`.
4. Internal handlers (`src/tools/handlers/internal.ts`) call `fetchApiInternal` (`src/tools/handlers/helper.ts`): validate API key → JSON HTTP via `createApiFetch` (`src/utils/apiFetch.ts`).
5. Results go through `ok` / `err` / `safe` (`src/utils/response.ts`): `structuredContent` is a JSON object (record); some timestamp fields are converted to ISO strings.

## Related documents

- [auth-protocol.md](./auth-protocol.md) — API key and environment
- [api/overview.md](../api/overview.md) — Tool surface and group layout
- [ARCHITECTURE.md](../ARCHITECTURE.md) — Repository layout
