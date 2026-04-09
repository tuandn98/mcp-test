# Internal tools — delegation extension

Extension is a **two-step** flow: list extendable delegations (and obtain `extendData`), then submit the extension request.

| Registered MCP name | Summary | TronSave HTTP (main path) | Kind |
|----------------------|---------|---------------------------|------|
| `tronsave_internal_extend_delegates` | Step 1: extendable delegations + `extendData` | `POST /v2/get-extendable-delegates` | Read |
| `tronsave_internal_extend_request` | Step 2: send `extendData` from step 1 | `POST /v2/extend-request` | Write |

## Implementation notes

- Same auth and schema patterns as other internal tools (`withTronSaveAuth` in `src/tools/definitions/internal/schema.ts`).
- Handlers: `src/tools/handlers/internal.ts`.

## See also

- [market-tools.md](./market-tools.md) — Primary order and market tools
- [protocols/auth-protocol.md](../../protocols/auth-protocol.md)
