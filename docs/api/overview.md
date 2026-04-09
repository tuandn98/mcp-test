# API and tool surface overview

In this repository, **API documentation** means the **MCP tool surface** (names the model must call) and how each tool maps to **TronSave HTTP** endpoints. It does not describe a separate public REST API owned by this server.

## Naming convention

- Tools are implemented with a short `name` in code (for example `internal_account_get`).
- The name exposed to MCP clients is **`${TOOL_PREFIX}_${name}`** with `TOOL_PREFIX` = `tronsave` (see `src/utils/constants.ts`).
- Example: call **`tronsave_internal_account_get`**, not `internal_account_get` alone.

Details: [protocols/mcp-implementation.md](../protocols/mcp-implementation.md).

## Current tool groups

| Group | Code location | Documentation |
|-------|----------------|---------------|
| **internal** | `src/tools/definitions/internal/` | [internal/account-tools.md](./internal/account-tools.md), [internal/market-tools.md](./internal/market-tools.md), [internal/delegation-extension.md](./internal/delegation-extension.md) |
| **public** (future) | Not present yet | [public/README.md](./public/README.md) |

## Authentication

All current internal tools require a TronSave API key and use a shared auth pattern in schema helpers. See [protocols/auth-protocol.md](../protocols/auth-protocol.md).

## Related documents

- [ARCHITECTURE.md](../ARCHITECTURE.md) — System overview and repository layout
- [guides/adding-new-tool.md](../guides/adding-new-tool.md) — How to add a tool
