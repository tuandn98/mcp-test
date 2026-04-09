# Build and deployment notes

This MCP server is typically run as a **stdio** process embedded in a host or agent. There is no mandatory container or cloud layout in this repository; this page documents what the **npm scripts** do and which **environment variables** matter at run time.

## Build

```bash
npm run build
```

Produces JavaScript in `dist/` from `src/` via `tsc`.

## Run

```bash
npm start
```

Runs `node dist/index.js`.

### Scripts that set `TL_MODE`

| Script | Command (conceptually) |
|--------|-------------------------|
| `npm run start:e2e` | Sets `TL_MODE=e2e` |
| `npm run start:prod` | Sets `TL_MODE=prod` |

As documented in [protocols/auth-protocol.md](../protocols/auth-protocol.md), **application TypeScript does not read `TL_MODE` today**. Use these scripts only if your external pipeline expects the variable to be present.

## Required and optional environment

- **`TRONSAVE_API_KEY`** — required for internal TronSave calls.
- **`NETWORK`** — optional; use `mainnet` for production API host (see [protocols/auth-protocol.md](../protocols/auth-protocol.md)).

## Related documents

- [setup-guide.md](./setup-guide.md) — Local development
- [mcp-implementation.md](../protocols/mcp-implementation.md) — How the server boots and registers tools
