/**
 * TronSave API paths relative to `fetchApi` baseUrl (`helper.ts`).
 * Replace every `__FILL_*__` value with your real route (keep leading `/`).
 */
export const internalApiPaths = {
  /** GET — internal account / user info */
  userInfo: "/v2/user-info",

  /** GET — order list (query: page, pageSize) */
  orderHistory: "__FILL_ORDER_HISTORY__",

  /**
   * GET — single order; handler appends `/${orderId}`.
   * Example base: `/v2/orders` → final `/v2/orders/{orderId}`
   */
  orderDetailsBase: "__FILL_ORDER_DETAILS_BASE__",

  /** GET — order book (query params optional) */
  orderBook: "__FILL_ORDER_BOOK__",

  /** POST — estimate TRX */
  estimateTrx: "__FILL_ESTIMATE_TRX__",

  /** POST — create order */
  createOrder: "__FILL_CREATE_ORDER__",

  /** POST — extendable delegates */
  extendableDelegates: "__FILL_EXTENDABLE_DELEGATES__",

  /** POST — extend request */
  extendRequest: "__FILL_EXTEND_REQUEST__",
} as const;
