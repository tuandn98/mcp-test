# tronsave-mcp-server

[![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-stdio-000000)](https://modelcontextprotocol.io/)
[![Vitest](https://img.shields.io/badge/Vitest-3.x-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

An **MCP server** (Model Context Protocol) that exposes **TronSave** functionality as **MCP tools** over **stdio transport**.

- **Transport**: stdio (`src/index.ts` uses `StdioServerTransport`)
- **Server name**: `tronsave-mcp-server` (`src/server.ts`)
- **Tool prefix**: `tronsave_` (see `src/utils/constants.ts`)

## What this repository provides

This server registers a set of tools (Zod input/output schemas + handlers) using `@modelcontextprotocol/sdk`.
MCP hosts (Claude Desktop, Cursor, etc.) can run it as a local process and call tools like:

- `tronsave_internal_account_get`
- `tronsave_internal_order_estimate`
- `tronsave_internal_order_create`

Tool docs live under `docs/` (see [Docs](#docs)).

## Quickstart (repo root)

Prerequisites: a recent Node.js LTS and npm.

```bash
npm install
npm run build
npm start
```

Expected behavior: the process starts an MCP server over **stdio** (it does not open an HTTP port).

## Authentication and environment

Most internal tools require a TronSave API key.

- **`TRONSAVE_API_KEY`**: required for internal API calls (sent as the `apikey` header)
- **`NETWORK`**: set to `mainnet` for `https://api.tronsave.io`; otherwise defaults to `https://api-dev.tronsave.io`

Details: [`docs/protocols/auth-protocol.md`](./docs/protocols/auth-protocol.md).

## MCP host configuration

Your MCP host must run the server as a **stdio** process.

### Example: `mcpServers` JSON (stdio via Node)

Use a config shape similar to the following (adapt to your host’s exact schema and file location):

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

Notes:

- Build first: `npm run build` (it produces `dist/`).
- If your host does not support `env` in config, set env vars in the host process environment instead.

## Tool naming convention

Tools have a short `name` in code (for example `internal_account_get`), but the exposed MCP tool name is:

`tronsave_${name}`

With `TOOL_PREFIX = tronsave`, the model must call **`tronsave_internal_account_get`** (not `internal_account_get`).

Details: [`docs/protocols/mcp-implementation.md`](./docs/protocols/mcp-implementation.md).

## Development

```bash
npm run build
npm run dev
```

Tests:

```bash
npm test
npm run test:watch
npm run test:coverage
```

Testing docs:

- [`docs/testing/strategy/unit-testing.md`](./docs/testing/strategy/unit-testing.md)
- [`docs/testing/strategy/integration-testing.md`](./docs/testing/strategy/integration-testing.md)
- [`docs/testing/strategy/e2e-testing.md`](./docs/testing/strategy/e2e-testing.md)

## Docs

- **Docs index**: [`docs/README.md`](./docs/README.md)
- **API/tool surface overview**: [`docs/api/overview.md`](./docs/api/overview.md)
- **Architecture**: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- **Setup guide**: [`docs/guides/setup-guide.md`](./docs/guides/setup-guide.md)
- **Deployment guide**: [`docs/guides/deployment-guide.md`](./docs/guides/deployment-guide.md)
- **Adding a tool**: [`docs/guides/adding-new-tool.md`](./docs/guides/adding-new-tool.md)

## License

Package metadata currently declares **ISC** (see `package.json`). A dedicated `LICENSE` file is **TBD**.

## Contributing

Contributing guidelines are **TBD** (no `CONTRIBUTING.md` in the repository yet).

