# Development setup

## Prerequisites

- **Node.js** (compatible with the version your team standardizes on; the repo uses TypeScript 5.x and `@types/node` for Node 20).
- **npm** (or another client compatible with `package.json`).

## Install dependencies

From the repository root:

```bash
npm install
```

## Build

```bash
npm run build
```

Output goes to `dist/`. Use `npm run clean` to remove `dist/` if needed.

## Configuration for local runs

Set at least:

- **`TRONSAVE_API_KEY`** — required for internal tools to call TronSave.

Optionally:

- **`NETWORK=mainnet`** — use production TronSave host (see [protocols/auth-protocol.md](../protocols/auth-protocol.md)).

## Watch mode

```bash
npm run dev
```

This runs the TypeScript compiler in watch mode.

## Next steps

- [deployment-guide.md](./deployment-guide.md) — Running built artifacts
- [adding-new-tool.md](./adding-new-tool.md) — Contributing a new tool
- [ARCHITECTURE.md](../ARCHITECTURE.md) — Source layout
