import { ok, safe } from "../../utils/response";
import { fetchApiInternal } from "./helper";

export const getInternalAccountHandler = safe(async () => {
    return fetchApiInternal('/v2/user-info', {
        method: "GET",
        toolName: "internal_account_get",
    });
});

export const getDepositAddressHandler = safe(async (input: Record<string, any>) => {
    const response = await fetchApiInternal('/v2/user-info', {
        method: "GET",
        query: { ...input },
        toolName: "get_deposit_address",
    });
    return ok({
        depositAddress: response.structuredContent?.depositAddress,
        amountTrx: input.amountTrx,
    });
});

export const getOrderHistoryHandler = safe(async (input: Record<string, any>) => {
    return fetchApiInternal('/v2/orders', {
        method: "GET",
        query: { ...input },
        toolName: "internal_order_history",
    });;
});

export const getOrderDetailsHandler = safe(async (input: Record<string, any>) => {
    const path = `/v2/order/${encodeURIComponent(input.orderId)}`;
    return fetchApiInternal(path, {
        method: "GET",
        toolName: "internal_order_details",
    });
});

export const getOrderBookHandler = safe(async (input: Record<string, any>) => {
    return fetchApiInternal('/v2/order-book', {
        method: "GET",
        query: { ...input },
        toolName: "internal_order_book",
    });
});

export const estimateBuyResourceHandler = safe(async (input: Record<string, any>) => {
    return fetchApiInternal('/v2/estimate-buy-resource', {
        method: "POST",
        body: { ...input },
        toolName: "internal_order_estimate",
    });
});

export const createOrderHandler = safe(async (input: Record<string, any>) => {
    return fetchApiInternal('/v2/buy-resource', {
        method: "POST",
        body: { ...input },
        toolName: "internal_order_create",
    });
});

export const getExtendableDelegatesHandler = safe(async (input: Record<string, any>) => {
    return fetchApiInternal('/v2/get-extendable-delegates', {
        method: "POST",
        body: { ...input },
        toolName: "internal_extend_delegates",
    });
});

export const extendRequestHandler = safe(async (input: Record<string, any>) => {
    return fetchApiInternal('/v2/extend-request', {
        method: "POST",
        body: { ...input },
        toolName: "internal_extend_request",
    });
});