# Internal tools — orders and market

Tools for **order history**, **order book**, **cost estimates**, and **placing buy orders** for ENERGY or BANDWIDTH. The **Registered MCP name** column is what the host or model must invoke.

| Registered MCP name | Summary | TronSave HTTP (main path) | Kind |
|----------------------|---------|---------------------------|------|
| `tronsave_internal_order_history` | Paginated order history | `GET /v2/orders` | Read |
| `tronsave_internal_order_details` | Single order by `orderId` | `GET /v2/order/{orderId}` | Read |
| `tronsave_internal_order_book` | Market order book (depth) for ENERGY or BANDWIDTH | `GET /v2/order-book` | Read |
| `tronsave_internal_order_estimate` | Estimate TRX cost before placing an order | `POST /v2/estimate-buy-resource` | Read |
| `tronsave_internal_order_create` | Place ENERGY/BANDWIDTH buy order | `POST /v2/buy-resource` | Write (may lock/spend TRX per API rules) |

## Implementation notes

- Model-facing text (when to call, read-only versus mutating) is standardized via `withTronSaveAuth` in `src/tools/definitions/internal/schema.ts`.
- Handlers are in `src/tools/handlers/internal.ts`; HTTP access goes through `fetchApiInternal` (`src/tools/handlers/helper.ts`).

## See also

- [account-tools.md](./account-tools.md) — Account and deposit
- [delegation-extension.md](./delegation-extension.md) — Extend existing delegations (separate two-step flow)
- [protocols/auth-protocol.md](../../protocols/auth-protocol.md) — API key and base URL
