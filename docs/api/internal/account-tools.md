# Internal tools — account and deposit

Tools in this document cover **profile / account** and **deposit address** flows. The **Registered MCP name** column is what the host or model must invoke.

| Registered MCP name | Summary | TronSave HTTP (main path) | Kind |
|----------------------|---------|---------------------------|------|
| `tronsave_internal_account_get` | Profile / internal account linked to the API key | `GET /v2/user-info` | Read |
| `tronsave_get_deposit_address` | Deposit address for TRX (with intended amount, min 10 TRX) | `GET /v2/user-info` + query | Read |

## Implementation notes

- Model-facing descriptions and the **`TRONSAVE_API_KEY`** requirement are standardized via `withTronSaveAuth` in `src/tools/definitions/internal/schema.ts`.
- Handlers live in `src/tools/handlers/internal.ts` and call `fetchApiInternal` in `src/tools/handlers/helper.ts`.

## See also

- [market-tools.md](./market-tools.md) — Orders and market operations
- [delegation-extension.md](./delegation-extension.md) — Delegation extension (two steps)
- [protocols/auth-protocol.md](../../protocols/auth-protocol.md) — Environment and headers
