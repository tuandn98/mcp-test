import z from "zod";

import { safe } from "../../utils/response";
import { fetchApi } from "./helper";
import { internalApiPaths } from "./internalPaths";

// ---------------------------------------------------------------------------
// Shared response fragments (aligned with former mocks in definitions)
// ---------------------------------------------------------------------------

const DelegateSchema = z
  .object({
    delegator: z.string(),
    amount: z.number(),
    txid: z.string(),
  })

const OrderRowSchema = z
  .object({
    id: z.string(),
    requester: z.string(),
    receiver: z.string(),
    resourceAmount: z.number(),
    resourceType: z.enum(["ENERGY", "BANDWIDTH"]),
    remainAmount: z.number(),
    price: z.number(),
    durationSec: z.number(),
    orderType: z.string(),
    allowPartialFill: z.boolean(),
    payoutAmount: z.number(),
    fulfilledPercent: z.number(),
    delegates: z.array(DelegateSchema),
  })

/** Only the `data` part of the response is returned by `fetchApi(...)`. */
const OrderHistoryDataSchema = z.array(OrderRowSchema);

const OrderDetailDataSchema = z
  .object({
    id: z.string(),
    requester: z.string(),
    receiver: z.string(),
    resourceAmount: z.number(),
    resourceType: z.enum(["ENERGY", "BANDWIDTH"]),
    remainAmount: z.number(),
    price: z.number(),
    durationSec: z.number(),
    orderType: z.string(),
    allowPartialFill: z.boolean(),
    payoutAmount: z.number(),
    fulfilledPercent: z.number(),
    delegates: z.array(DelegateSchema),
  })

const OrderBookEntrySchema = z
  .object({
    price: z.number(),
    availableResourceAmount: z.number(),
  })

const EstimateTrxDataSchema = z
  .object({
    unitPrice: z.number(),
    durationSec: z.number(),
    estimateTrx: z.number(),
    availableResource: z.number(),
  })

const OrderIdDataSchema = z.object({ orderId: z.string() }).passthrough();

const ExtendOrderBookEntrySchema = z.object({ price: z.number(), value: z.number() }).passthrough();

const ExtendDataItemSchema = z
  .object({
    delegator: z.string(),
    isExtend: z.boolean(),
    extraAmount: z.number(),
    extendTo: z.number(),
  })

const ExtendableDelegatesDataSchema = z
  .object({
    extendOrderBook: z.array(ExtendOrderBookEntrySchema),
    totalDelegateAmount: z.number(),
    totalAvailableExtendAmount: z.number(),
    totalEstimateTrx: z.number(),
    isAbleToExtend: z.boolean(),
    yourBalance: z.number(),
    extendData: z.array(ExtendDataItemSchema),
  })


// ---------------------------------------------------------------------------
// Input schemas (mirror `definitions/internal.ts` tool inputSchema)
// ---------------------------------------------------------------------------

const EmptyInputSchema = z.object({});

const GetOrderHistoryInputSchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
});

const GetOrderDetailsInputSchema = z.object({
  orderId: z.string(),
});

const GetOrderBookInputSchema = z.object({
  address: z.string().optional(),
  resourceType: z.enum(["ENERGY", "BANDWIDTH"]).optional(),
  minDelegateAmount: z.number().optional(),
  durationSec: z.number().optional(),
});

const EstimateTrxInputSchema = z.object({
  resourceType: z.enum(["ENERGY", "BANDWIDTH"]).optional(),
  resourceAmount: z.number(),
  receiver: z.string().optional(),
  requester: z.string().optional(),
  durationSec: z.number().optional(),
  unitPrice: z.union([z.enum(["FAST", "MEDIUM", "SLOW"]), z.number()]).optional(),
  options: z
    .object({
      allowPartialFill: z.boolean().optional(),
    })
    .optional(),
});

const CreateOrderInputSchema = z.object({
  resourceType: z.enum(["ENERGY", "BANDWIDTH"]).optional(),
  resourceAmount: z.number(),
  receiver: z.string(),
  durationSec: z.number().optional(),
  unitPrice: z.union([z.enum(["FAST", "MEDIUM", "SLOW"]), z.number()]).optional(),
  sponsor: z.string().optional(),
  options: z
    .object({
      allowPartialFill: z.boolean().optional(),
      onlyCreateWhenFulfilled: z.boolean().optional(),
      maxPriceAccepted: z.number().optional(),
      preventDuplicateIncompleteOrders: z.boolean().optional(),
      minResourceDelegateRequiredAmount: z.number().optional(),
    })
    .optional(),
});

const GetExtendableDelegatesInputSchema = z.object({
  receiver: z.string(),
  extendTo: z.number(),
  resourceType: z.enum(["ENERGY", "BANDWIDTH"]).optional(),
  maxPriceAccepted: z.number().optional(),
  requester: z.string().optional(),
});

const ExtendRequestInputSchema = z.object({
  receiver: z.string(),
  extendData: z.array(
    z.object({
      delegator: z.string(),
      isExtend: z.boolean(),
      extraAmount: z.number(),
      extendTo: z.number(),
    }),
  ),
  resourceType: z.enum(["ENERGY", "BANDWIDTH"]).optional(),
});

/** `data` for GET user-info — extend fields when your API exposes more keys. */
const InternalAccountDataSchema = z
  .object({
    id: z.string(),
    balance: z.string(),
    representAddress: z.string(),
    depositAddress: z.string(),
  })
  .passthrough();

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

export const getInternalAccountHandler = safe(async (input: Record<string, unknown>) => {
  EmptyInputSchema.parse(input);
  return fetchApi(internalApiPaths.userInfo, {
    method: "GET",
    dataSchema: InternalAccountDataSchema,
  });
});

export const getOrderHistoryHandler = safe(async (input: Record<string, unknown>) => {
  const { page, pageSize } = GetOrderHistoryInputSchema.parse(input);
  return fetchApi(internalApiPaths.orderHistory, {
    method: "GET",
    query: { page, pageSize },
    dataSchema: OrderHistoryDataSchema,
  });
});

export const getOrderDetailsHandler = safe(async (input: Record<string, unknown>) => {
  const { orderId } = GetOrderDetailsInputSchema.parse(input);
  const path = `${internalApiPaths.orderDetailsBase.replace(/\/$/, "")}/${encodeURIComponent(orderId)}`;
  return fetchApi(path, {
    method: "GET",
    dataSchema: OrderDetailDataSchema,
  });
});

export const getOrderBookHandler = safe(async (input: Record<string, unknown>) => {
  const q = GetOrderBookInputSchema.parse(input);
  return fetchApi(internalApiPaths.orderBook, {
    method: "GET",
    query: {
      address: q.address,
      resourceType: q.resourceType,
      minDelegateAmount: q.minDelegateAmount,
      durationSec: q.durationSec,
    },
    dataSchema: z.array(OrderBookEntrySchema),
  });
});

export const estimateTrxHandler = safe(async (input: Record<string, unknown>) => {
  const body = EstimateTrxInputSchema.parse(input);
  return fetchApi(internalApiPaths.estimateTrx, {
    method: "POST",
    body,
    dataSchema: EstimateTrxDataSchema,
  });
});

export const createOrderHandler = safe(async (input: Record<string, unknown>) => {
  const body = CreateOrderInputSchema.parse(input);
  return fetchApi(internalApiPaths.createOrder, {
    method: "POST",
    body,
    dataSchema: OrderIdDataSchema,
  });
});

export const getExtendableDelegatesHandler = safe(async (input: Record<string, unknown>) => {
  const body = GetExtendableDelegatesInputSchema.parse(input);
  return fetchApi(internalApiPaths.extendableDelegates, {
    method: "POST",
    body,
    dataSchema: ExtendableDelegatesDataSchema,
  });
});

export const extendRequestHandler = safe(async (input: Record<string, unknown>) => {
  const body = ExtendRequestInputSchema.parse(input);
  return fetchApi(internalApiPaths.extendRequest, {
    method: "POST",
    body,
    dataSchema: OrderIdDataSchema,
  });
});
