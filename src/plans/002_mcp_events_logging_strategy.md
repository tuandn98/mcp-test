# Quyết định 002: Chiến lược ghi log sự kiện MCP mà không thay đổi schema Order

- **Ngày:** 2026-04-13
- **Phạm vi:** Ghi log và phân tích cho luồng MCP trong `api-service`
- **Trạng thái:** Đã chấp nhận (đã triển khai phần MVP trong `api-service`)
- **Cập nhật:** Tách collection và model HTTP vs buy — xem [003_mcp_events_split_buy_and_http.md](./003_mcp_events_split_buy_and_http.md).

## Bối cảnh

- Hệ thống đã phân loại nguồn request bằng `x-client-source` tại Fastify.
- Nhóm cần đo lường và truy vết hành vi MCP để phân tích funnel và hiệu năng.
- Yêu cầu hiện tại: **không thay đổi schema `Order`**.
- Dữ liệu định danh nghiệp vụ ưu tiên theo `address`; có thể lưu full address theo nhu cầu vận hành nội bộ.

## Quyết định

- Tạo collection log riêng `mcp_events`, không thêm field mới vào `Order`.
- Dùng metadata header tối thiểu từ MCP server:
  - `x-client-source: mcp` (bắt buộc để phân loại)
  - `x-mcp-tool-name` (khuyến nghị)
  - `x-mcp-client` (khuyến nghị)
- Không dùng `x-mcp-session-id` trong phạm vi hiện tại.
- Lưu thêm ngữ cảnh API tại `mcp_events`:
  - `apiPath`
  - `apiMethod`
- Để xác định chắc chắn order do MCP tạo, lưu `outputRef.orderId` khi tool tạo order thành công.

## Schema đề xuất cho `mcp_events` (MVP)

- `address`: string (full address)
- `toolName`: string
- `clientHint`: string (từ `x-mcp-client`)
- `apiPath`: string
- `apiMethod`: string
- `result`: `"success"` | `"error"`
- `errorCode`: string (tùy chọn)
- `latencyMs`: number
- `createdAt`: number (giây)
- `requestId`: string (tùy chọn, correlation nội bộ)
- `outputRef`: object (tùy chọn), gồm `orderId` khi có
- `inputParamsSanitized`: object (đã sanitize, không chứa dữ liệu bí mật)

## Triển khai hiện tại

Bố cục code khớp [003](./003_mcp_events_split_buy_and_http.md) (tách collection; cùng quy tắc sanitize và chỉ ghi khi MCP).

- **Model funnel buy:** `shares/src/models/McpBuyEvent.ts` (các field MVP bên dưới cộng thêm `mcpCorrelationId`).
- **Mongo buy:** collection `mcp_buy_events`, index `McpBuyEventIndexes`, `api-service/src/infra/database/mongo/methods/mcp_buy_events.ts`.
- **Model hook HTTP:** `shares/src/models/McpEvent.ts`, collection `mcp_events`, index `McpEventIndexes`, `api-service/src/infra/database/mongo/methods/mcp_events.ts`.
- **Ghi log:** `api-service/src/server/fastify/mcp_event_logging.ts` — `logMcpBuyResourceEvent` → `mcp_buy_events`; `registerMcpHttpEventHooks` → `mcp_events`. Vẫn chỉ khi `req.clientSource === "mcp"`; header và sanitize không đổi; insert kiểu best-effort.
- **Correlation:** `mcpCorrelationId` trong `preHandler` cho request MCP (`api-service/src/server/fastify/index.ts`).

- **Luồng tạo order (v2):** `api-service/src/server/fastify/handler/v2/buyResource.ts` gọi `logMcpBuyResourceEvent` khi success hoặc error; `address` = `receiver` trong body; success có `outputRef.orderId`.
- **Kiểm thử:** `api-service/src/server/fastify/mcp_event_logging.test.ts` (Vitest).

**Ghi chú:** `mcpCorrelationId` thay cho ý tưởng `requestId` tùy chọn trong schema MVP (cùng vai trò).

**Quy trình tạo collection:** `docs/conventions/collection_creation_rule.md`.

## Lý do lựa chọn

- Đáp ứng nhu cầu theo dõi MCP nhanh, ít rủi ro khi rollout.
- Tránh chạm domain model `Order`, giảm tác động tới các service phụ thuộc.
- Tách mối quan tâm logging sang collection riêng giúp truy vấn analytics linh hoạt hơn.
- Vẫn đảm bảo gán order từ MCP ở mức chắc chắn nhờ `outputRef.orderId`.

## Tác động và nguyên tắc an toàn

- Header `x-mcp-*` chỉ là metadata phục vụ observability, không dùng cho quyết định xác thực hoặc bảo mật.
- Nếu thiếu `x-mcp-tool-name` hoặc `x-mcp-client`, hệ thống vẫn ghi event với giá trị fallback (`unknown`).
- Không log private key, seed phrase, raw auth token, raw signature.
- `inputParamsSanitized` phải được làm sạch trước khi ghi DB.

## Index khuyến nghị

Trùng với field thời gian trong document: **`createdAt`** (Unix giây), không dùng tên `timestamp` trong schema.

- `{ toolName: 1, createdAt: -1 }`
- `{ address: 1, createdAt: -1 }`
- `{ result: 1, createdAt: -1 }`
- `{ clientHint: 1, createdAt: -1 }`
- `{ "outputRef.orderId": 1, createdAt: -1 }`, `sparse: true` (phục vụ truy vết gán order; một phần document không có `outputRef.orderId`)

## Chỉ số đánh giá MCP (tránh chỉ số sai ngữ cảnh)

- Không dùng:
  - số user đăng ký mới
  - phiên website / lượt xem trang
  - số lần gọi MCP tool thô (raw count)
- Ưu tiên:
  - tỷ lệ `create_order` thành công theo `toolName` / `clientHint`
  - số order có `outputRef.orderId` trên tổng lần thử tạo order
  - độ trễ / tỷ lệ lỗi theo tool
