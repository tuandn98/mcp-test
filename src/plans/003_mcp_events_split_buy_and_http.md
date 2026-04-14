# Decision 003: Split `mcp_buy_events` and hook-level `mcp_events`, link with `mcpCorrelationId`

- **Date:** 2026-04-13
- **Scope:** `api-service` MCP logging / analytics
- **Status:** Accepted
- **Related:** Extends and refines [002_mcp_events_logging_strategy.md](./002_mcp_events_logging_strategy.md).

## Context

- Decision 002 introduced an MCP log collection without changing `Order`, with an MVP tied to create-order (`buyResource`).
- The schema in 002 effectively models the **buy / order funnel** (`address` = receiver, `outputRef.orderId`, buy body).
- New need: **every MCP HTTP request** should produce a row collectable at **hook** level (HTTP status, full-request latency, route), while keeping **full business fields** on buy events (no slimming buy documents down to only a foreign key).

## Decision

- Move the funnel-specific shape to collection **`mcp_buy_events`**, model **`McpBuyEvent`** (`shares/src/models/McpBuyEvent.ts`).
- Use collection **`mcp_events`** for **one document per MCP HTTP request**, model **`McpEvent`** (`shares/src/models/McpEvent.ts`), written from hooks (`registerMcpHttpEventHooks`: `onError` + `onResponse`).
- Each MCP request gets **`mcpCorrelationId`** (UUID) in `preHandler` when `clientSource === "mcp"`; the **same value** is stored on both `mcp_events` and `mcp_buy_events` when buy logging runs — **double write** (two documents for one buy call) is accepted.
- **No migration:** not in production; any prior local `mcp_events` funnel data is superseded by this pair of collections.

## Schema (summary)

**`McpBuyEvent`** (buy funnel — same fields as MVP002 plus link):

- `mcpCorrelationId`, `address`, `toolName`, `clientHint`, `apiPath`, `apiMethod`, `result`, `errorCode?`, `latencyMs`, `createdAt`, `outputRef?`, `inputParamsSanitized?`

**`McpEvent`** (HTTP — hook data):

- `mcpCorrelationId`, `toolName`, `clientHint`, `apiPath`, `apiMethod`, `httpStatus`, `result`, `errorCode?`, `latencyMs`, `createdAt`, `inputParamsSanitized?`

## Implementation (current)

- **Models:** `shares/src/models/McpBuyEvent.ts`, `shares/src/models/McpEvent.ts`; exported from `shares/src/models/index.ts`.
- **Mongo:** `mcp_buy_events`, `mcp_events` in `api-service/src/infra/database/mongo/mongo.ts`; indexes `McpBuyEventIndexes`, `McpEventIndexes` in `api-service/src/infra/database/mongo/indexes/index.ts`.
- **Persistence:** `api-service/src/infra/database/mongo/methods/mcp_buy_events.ts`, `api-service/src/infra/database/mongo/methods/mcp_events.ts`.
- **Fastify:** `mcpCorrelationId` + `registerMcpHttpEventHooks` in `api-service/src/server/fastify/mcp_event_logging.ts`; hook registration and correlation assignment in `api-service/src/server/fastify/index.ts`.
- **Buy:** `logMcpBuyResourceEvent` writes to `mcp_buy_events` from `api-service/src/server/fastify/handler/v2/buyResource.ts` (call site unchanged).
- **Tests:** `api-service/src/server/fastify/mcp_event_logging.test.ts`.

**Collection workflow:** `docs/conventions/collection_creation_rule.md`.

## Rationale

- Separates HTTP observability from order-funnel analytics instead of one overloaded document.
- Hooks capture `httpStatus` and latency from `requestStartedAtMs` for all MCP routes.
- `mcpCorrelationId` joins HTTP rows to detailed buy rows without removing fields from `mcp_buy_events`.

## Consequences

- Buy path performs **two** best-effort inserts (logging failures do not fail the HTTP request).
- `latencyMs` may differ slightly between documents (buy log still uses handler `startedAtMs` as in 002; HTTP log uses the full pipeline from `preHandler`).
