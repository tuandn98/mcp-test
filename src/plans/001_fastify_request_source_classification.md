# Decision 001: Fastify request source classification (MCP vs user)

- **Date:** 2026-04-13
- **Scope:** `api-service` Fastify layer
- **Status:** Accepted (simple-first)

## Bối cảnh (Context)

- Request vào Fastify có thể đến từ luồng MCP server hoặc luồng người dùng thông thường.
- Hệ thống hiện tại yêu cầu `apikey` của user, nên không thể dùng `apikey` để phân biệt tin cậy giữa MCP và user.
- Nhóm cần một hướng xử lý ít thay đổi code, dễ bảo trì, và không phải refactor kiến trúc.

## Quyết định (Decision)

- Sử dụng header `x-client-source` (ví dụ: `x-client-source: mcp`) làm tín hiệu phân loại nguồn request ở thời điểm hiện tại.
- Coi tín hiệu này là **metadata phục vụ quan sát** (logging/analytics), không dùng như ranh giới xác thực hoặc tin cậy bảo mật.

## Lý do lựa chọn (Rationale)

- Chi phí triển khai thấp.
- Dễ bảo trì và rollout theo từng bước.
- Không làm thay đổi mô hình auth API và kiến trúc route hiện có.

## Tác động và nguyên tắc an toàn (Consequences / Guardrails)

- Không dùng riêng `x-client-source` để đưa ra quyết định bảo mật.
- Giữ nguyên logic authorization hiện tại.

## Hướng nâng cấp trong tương lai

- Khi MCP chạy ở mô hình remote self-hosted và cần mức độ tin cậy cao hơn, bổ sung cơ chế xác thực mật mã bằng private key/signature (ví dụ: HMAC hoặc chữ ký bất đối xứng).
- Ở giai đoạn đó, Fastify có thể coi danh tính MCP đã được xác minh là nguồn có độ tin cậy cao và áp dụng policy control chặt hơn khi cần.
