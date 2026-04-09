# tronsave-mcp-server — Architecture

This document is the **high-level architecture** view: what the system is, how it is structured in the repository, and where to find deeper detail. For tool lists and HTTP mapping, see [api/overview.md](./api/overview.md). For MCP naming and request flow, see [protocols/mcp-implementation.md](./protocols/mcp-implementation.md).

---

## 1. What this project is

- **Role**: An MCP (Model Context Protocol) server named `tronsave-mcp-server` that speaks **`stdio`** transport (typical for embedded MCP clients).
- **Value**: Exposes **tools** so a model or host can call the **TronSave** API on the user’s behalf: internal account, **ENERGY / BANDWIDTH** markets, placing buy orders, price estimates, and **delegation extension** (two steps: list extendable delegations → submit extension request).
- **Current scope**: All registered tools are in the **internal** group (`src/tools/definitions/internal/`). There is no separate public tool group in the repo yet.

---

## 2. Technology stack

- **Runtime**: Node.js, **TypeScript**.
- **MCP**: `@modelcontextprotocol/sdk` with **stdio** transport.
- **Validation**: **Zod** for tool input and output schemas.
- **HTTP**: Custom fetch helper with retries (`src/utils/apiFetch.ts`).

---

## 3. Documentation map

| Topic | Location |
|-------|-----------|
| MCP tool catalog and TronSave mapping | [api/overview.md](./api/overview.md) and [api/internal/](./api/internal/) |
| Tool naming and call flow | [protocols/mcp-implementation.md](./protocols/mcp-implementation.md) |
| API key and environment | [protocols/auth-protocol.md](./protocols/auth-protocol.md) |
| Setup and deployment | [guides/setup-guide.md](./guides/setup-guide.md), [guides/deployment-guide.md](./guides/deployment-guide.md) |
| Adding tools | [guides/adding-new-tool.md](./guides/adding-new-tool.md) |
| Testing direction | [testing/strategy/](./testing/strategy/) |
| Full doc index | [README.md](./README.md) |

---

## 4. Source layout (what matters)

```text
src/
  index.ts                 # Boot stdio + connect server
  server.ts                # Register tools with prefix
  tools/
    index.ts               # Re-export allTools
    definitions/
      definition_type.ts   # ToolDefinition, ToolResponse
      index.ts             # allTools = [...]
      internal/
        index.ts           # Internal tool list + handler wiring
        schema.ts          # Zod + withTronSaveAuth
      shares/              # Shared schemas (e.g. empty input)
    handlers/
      internal.ts          # All internal handlers (API paths)
      helper.ts            # Base URL, apikey header, fetchApiInternal
  utils/
    constants.ts           # TOOL_PREFIX
    apiFetch.ts            # HTTP client, retry, JSON + Zod parse
    response.ts            # ok / err / safe, structuredContent
    logger.ts              # stderr JSON logs
```

---

## 5. Build and run (summary)

- **Build**: `npm run build` → `dist/`.
- **Run**: `npm start` (see [guides/deployment-guide.md](./guides/deployment-guide.md) for `start:e2e` / `start:prod`).
- **Secrets**: set **`TRONSAVE_API_KEY`**; optionally **`NETWORK=mainnet`** ([protocols/auth-protocol.md](./protocols/auth-protocol.md)).

For step-by-step local setup, see [guides/setup-guide.md](./guides/setup-guide.md).
