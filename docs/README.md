# Documentation index

This folder holds **domain-driven** documentation for **tronsave-mcp-server**. Use this file as the table of contents; update links when you add or move documents.

## Entry points

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | High-level system design, source layout, and pointers to other domains |
| [project-init-requirements.md](./project-init-requirements.md) | Minimum required repo structure and operating rules (docs, tasks, changelog) |
| This file (`README.md`) | Navigation only |

## Domains

### [api/](./api/) — MCP tool surface and backend mapping

| Document | Purpose |
|----------|---------|
| [api/overview.md](./api/overview.md) | What “API” means here (MCP tools + TronSave HTTP), and how internal docs are organized |
| [api/internal/account-tools.md](./api/internal/account-tools.md) | Account and deposit-related internal tools |
| [api/internal/market-tools.md](./api/internal/market-tools.md) | Orders, market data, estimates, and buy flows |
| [api/internal/delegation-extension.md](./api/internal/delegation-extension.md) | Two-step delegation extension tools |
| [api/public/README.md](./api/public/README.md) | Placeholder for future non-internal tool groups |

### [protocols/](./protocols/) — Protocols and integration contracts

| Document | Purpose |
|----------|---------|
| [protocols/mcp-implementation.md](./protocols/mcp-implementation.md) | How the server implements MCP (naming, registration, request flow) |
| [protocols/auth-protocol.md](./protocols/auth-protocol.md) | API key, headers, base URL, and environment variables |

### [guides/](./guides/) — Developer workflows

| Document | Purpose |
|----------|---------|
| [guides/setup-guide.md](./guides/setup-guide.md) | Local development setup |
| [guides/deployment-guide.md](./guides/deployment-guide.md) | Build, run modes, and production-oriented notes |
| [guides/adding-new-tool.md](./guides/adding-new-tool.md) | Checklist and conventions for adding a tool |

### [testing/](./testing/) — Test strategy and plans

| Document | Purpose |
|----------|---------|
| [testing/strategy/unit-testing.md](./testing/strategy/unit-testing.md) | Unit test scope and how to run them (Vitest) |
| [testing/strategy/integration-testing.md](./testing/strategy/integration-testing.md) | Integration test scope and how to run them (Vitest) |
| [testing/strategy/e2e-testing.md](./testing/strategy/e2e-testing.md) | End-to-end test scope and how to run them (Vitest + stdio spawn) |
| [testing/test-plans/README.md](./testing/test-plans/README.md) | Where feature-specific plans live |

## Principles

- **Single responsibility**: One narrow topic per file when possible.
- **README as map**: Prefer updating this index when the tree changes so humans and agents do not rely on guessing paths.
- **English only** for instructional text (see `.cursor/rules/docs-standard.mdc`).
