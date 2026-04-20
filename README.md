# tronsave-mcp-server

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](./package.json)
[![TRON / TronSave](https://img.shields.io/badge/Service-TronSave-EF0027)](https://tronsave.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-@modelcontextprotocol%2Fsdk-1.28+-000000)](https://modelcontextprotocol.io/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-3.x-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

**tronsave-mcp-server** is an MCP (Model Context Protocol) server that exposes **TronSave** HTTP APIs as typed MCP tools over **stdio**. AI agents and hosts (Cursor, Claude Desktop, Claude Code, etc.) can query account data, market depth, place resource orders, and run the delegation-extension flow without implementing TronSave wire formats themselves.

- **Transport**: stdio (`StdioServerTransport` in `src/index.ts`)
- **Server id**: `tronsave-mcp-server` (`src/server.ts`)
- **Tool prefix**: `tronsave_` (`src/utils/constants.ts`)
- **Validation**: Zod input/output schemas per tool (`src/tools/definitions/`)

---

## Architecture

```
┌──────────────────────────────────────────────┐
│   AI Agent / MCP host (Cursor, Claude, …)    │
└──────────────────┬───────────────────────────┘
                   │ MCP (stdio): tools/list, tools/call
┌──────────────────▼───────────────────────────┐
│  tronsave-mcp-server                         │
│                                              │
│  ┌── MCP layer ───────────────────────────┐  │
│  │  McpServer (registerTool × N)          │  │
│  │  Prefix: tronsave_${shortName}         │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌── Handlers ────────────────────────────┐  │
│  │  internal.ts → TronSave REST (apikey)  │  │
│  │  provider.ts → Dashboard GraphQL       │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌── HTTP utilities ──────────────────────┐  │
│  │  apiFetch.ts (retries, JSON + Zod)      │  │
│  │  helper.ts (base URL, apikey, GraphQL)  │  │
│  └────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────┘
                   │ HTTPS
┌──────────────────▼───────────────────────────┐
│  TronSave APIs                               │
│  ├── api.tronsave.io / api-dev… (REST)     │
│  └── api-dashboard… / graphql (provider)   │
└──────────────────────────────────────────────┘
```

Deeper detail: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md), [`docs/api/overview.md`](./docs/api/overview.md), [`docs/protocols/mcp-implementation.md`](./docs/protocols/mcp-implementation.md).

---

## Quick start

Prerequisites: **Node.js ≥ 20**, npm.

```bash
npm install
npm run build
npm start
```

The process is an MCP server on **stdio** only (no inbound HTTP port). Point your MCP host at `dist/index.js` and set environment variables (see below).

> **Windows note:** `npm run build` uses `rm -rf dist` (Unix-style). Run builds from **Git Bash**, **WSL**, or another shell where `rm` is available, or adjust the script locally if needed.

---

## Configuration

### Environment variables

| Variable | Description | Default / behavior |
|----------|-------------|-------------------|
| `TRONSAVE_API_KEY` | TronSave API key; sent as `apikey` on **internal** REST calls | **Required** for all `tronsave_internal_*` and `tronsave_get_*` tools that use `fetchApiInternal` |
| `NETWORK` | API target | If `mainnet` → `https://api.tronsave.io` and dashboard GraphQL on production hosts; else **`https://api-dev.tronsave.io`** (dev) |
| `PRIVATE_KEY` | Hex private key used only by **`tronsave_user_info_get`** to sign a timestamp for dashboard GraphQL | Required for that tool; **high sensitivity** — prefer locked-down hosts and never commit |
| `TL_MODE` | Set by `npm run start:e2e` / `start:prod` | **Not read by application TypeScript today** (see [`docs/protocols/auth-protocol.md`](./docs/protocols/auth-protocol.md)) |

Auth and behavior: [`docs/protocols/auth-protocol.md`](./docs/protocols/auth-protocol.md).

---

## MCP host integration

### Example: `mcpServers` (stdio via Node)

```json
{
  "mcpServers": {
    "tronsave": {
      "command": "node",
      "args": ["/absolute/path/to/this/repo/dist/index.js"],
      "env": {
        "TRONSAVE_API_KEY": "YOUR_API_KEY",
        "NETWORK": "mainnet"
      }
    }
  }
}
```

- Build first: `npm run build` → `dist/`.
- If the host cannot pass `env`, export the same variables in the parent process.

---

## Tool groups

### Internal (TronSave REST — `apikey`)

Use when the user works with **internal account**, **ENERGY / BANDWIDTH** market, **orders**, or **delegation extension**.

| MCP tool name | Role |
|---------------|------|
| `tronsave_internal_account_get` | Profile / wallet / balance linked to API key |
| `tronsave_get_deposit_address` | Deposit address for TRX (input includes amount; minimum **10 TRX**) |
| `tronsave_internal_order_history` | Paginated order history |
| `tronsave_internal_order_details` | Single order by id |
| `tronsave_internal_order_book` | Market depth (ENERGY or BANDWIDTH) |
| `tronsave_internal_order_estimate` | Quote TRX cost before buying |
| `tronsave_internal_order_create` | Place buy order (mutating) |
| `tronsave_internal_extend_delegates` | Step 1: list extendable delegations + `extendData` |
| `tronsave_internal_extend_request` | Step 2: submit extension using `extendData` from step 1 |

HTTP mapping: [`docs/api/internal/account-tools.md`](./docs/api/internal/account-tools.md), [`docs/api/internal/market-tools.md`](./docs/api/internal/market-tools.md), [`docs/api/internal/delegation-extension.md`](./docs/api/internal/delegation-extension.md).

### Provider (Dashboard GraphQL)

| MCP tool name | Role |
|---------------|------|
| `tronsave_user_info_get` | User GraphQL payload via signed dashboard API; requires **`PRIVATE_KEY`** in the server environment |

---

## Usage examples (conceptual)

### Example 1 — Account and deposit

1. `tronsave_internal_account_get` → linked address, balance, context.  
2. `tronsave_get_deposit_address` with `amountTrx` (≥ 10) → deposit address for topping up TRX.

### Example 2 — Quote and buy resources

1. `tronsave_internal_order_book` → live depth.  
2. `tronsave_internal_order_estimate` → TRX quote.  
3. `tronsave_internal_order_create` → submit order (mutating).

### Example 3 — Extend delegation

1. `tronsave_internal_extend_delegates` with `receiver`, `extendTo`, etc. → `extendData`.  
2. `tronsave_internal_extend_request` with the same `receiver` and **`extendData` unchanged** → extension order.

---

## Project structure

```
mcp-test/   (repository root; npm package name: mcp-server)
├── src/
│   ├── index.ts                 # stdio entry
│   ├── server.ts                # McpServer + tool registration
│   ├── tools/
│   │   ├── index.ts             # allTools export
│   │   ├── definitions/
│   │   │   ├── definition_type.ts
│   │   │   ├── internal/        # internal tool schemas + wiring
│   │   │   ├── provider/        # provider tool schemas
│   │   │   └── shares/          # shared Zod fragments
│   │   └── handlers/
│   │       ├── internal.ts      # TronSave REST handlers
│   │       ├── provider.ts      # GraphQL / user info
│   │       └── helper.ts        # base URL, apikey, fetchApiInternal, GraphQL
│   └── utils/
│       ├── constants.ts         # TOOL_PREFIX
│       ├── apiFetch.ts
│       ├── response.ts
│       └── logger.ts
├── tests/                       # unit, integration, e2e (Vitest)
├── docs/                        # architecture, API, protocols, guides, testing
├── CHANGELOG.md
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

## Development

```bash
npm run build
npm run dev          # tsc --watch
npm test
npm run test:watch
npm run test:coverage
```

Testing strategy: [`docs/testing/strategy/unit-testing.md`](./docs/testing/strategy/unit-testing.md), [`docs/testing/strategy/integration-testing.md`](./docs/testing/strategy/integration-testing.md), [`docs/testing/strategy/e2e-testing.md`](./docs/testing/strategy/e2e-testing.md).

---

## Documentation index

| Topic | Link |
|-------|------|
| Docs home | [`docs/README.md`](./docs/README.md) |
| API / tool surface | [`docs/api/overview.md`](./docs/api/overview.md) |
| Architecture | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) |
| MCP implementation | [`docs/protocols/mcp-implementation.md`](./docs/protocols/mcp-implementation.md) |
| Setup | [`docs/guides/setup-guide.md`](./docs/guides/setup-guide.md) |
| Deployment | [`docs/guides/deployment-guide.md`](./docs/guides/deployment-guide.md) |
| Adding a tool | [`docs/guides/adding-new-tool.md`](./docs/guides/adding-new-tool.md) |

---

## Current limitations

- **stdio only** — no first-class HTTP server in this package.
- **TronSave scope** — tools map to TronSave APIs; there is no on-chain wallet signing layer in this repo (unlike extension-driven wallets).
- **`TL_MODE` scripts** — present in `package.json` for optional external pipelines; **not consumed** by current TypeScript (documented in auth protocol).
- **Provider tool** — `tronsave_user_info_get` expects **`PRIVATE_KEY`** in the environment; treat as highly sensitive.

---

## License and contributing

- **License**: **ISC** (see `package.json`). A dedicated `LICENSE` file is not present in the repository yet.
- **Contributing**: no `CONTRIBUTING.md` yet; follow [`docs/guides/adding-new-tool.md`](./docs/guides/adding-new-tool.md) for extending the tool surface.
