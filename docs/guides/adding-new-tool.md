# Adding a new tool

## `ToolDefinition` contract

Each tool has `name`, `title`, `description`, `inputSchema` (Zod **object**), `outputSchema` (Zod **object**), and an async `handler` returning `ToolResponse`. Handlers should follow `safe` + `fetchApiInternal` for consistency with existing internal tools.

## Steps

1. Define schemas (often in `definitions/<group>/schema.ts` or `definitions/shares/`).
2. Implement the handler under `src/tools/handlers/` (or extend an existing module such as `internal.ts`).
3. Add an entry in `definitions/<group>/index.ts`.
4. Spread the group into `allTools` in `src/tools/definitions/index.ts` if not already wired.

## Naming

Exposed MCP names use **`${TOOL_PREFIX}_${name}`** — see [protocols/mcp-implementation.md](../protocols/mcp-implementation.md).

## Project standards

For detailed conventions (descriptions, safety notes, schema style), see the repository standards:

- `.standards/mcp_tool_standards.md`
- `.standards/mcp_tool.html` (reference layout, if used by your process)

## Documentation

After adding a tool, update:

- The appropriate file under [docs/api/](../api/) (for example [api/internal/](../api/internal/)).
- [docs/README.md](../README.md) if you add a new document or domain.

## See also

- [ARCHITECTURE.md](../ARCHITECTURE.md) — Source tree overview
