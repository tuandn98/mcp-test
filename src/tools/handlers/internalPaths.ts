/**
 * TronSave API paths relative to `fetchApi` baseUrl (`helper.ts`).
 * Replace every `__FILL_*__` value with your real route (keep leading `/`).
 */
export const internalApiPaths = {
  /** GET — internal account / user info */
  userInfo: "/v2/user-info",

  /** GET — order list (query: page, pageSize) */
  orderHistory: "/v2/orders",

  /**
   * GET — single order; handler appends `/${orderId}`.
   * Example base: `/v2/orders` → final `/v2/orders/{orderId}`
   */
  orderDetailsBase: "/v2/order",

  /** GET — order book (query params optional) */
  orderBook: "/v2/order-book",

  /** POST — estimate TRX */
  estimateBuyResource: "/v2/estimate-buy-resource",

  /** POST — create order */
  createOrder: "/v2/buy-resource",

  /** POST — extendable delegates */
  extendableDelegates: "/v2/get-extendable-delegates",

  /** POST — extend request */
  extendRequest: "/v2/extend-request",
} as const;
