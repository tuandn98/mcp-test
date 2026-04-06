import { safe } from "../../utils/response";
import { fetchApiInternal } from "./helper";

export const getInternalAccountHandler = safe(async () => {
    return fetchApiInternal('/v2/user-info', {
        method: "GET",
    });
});

export const getOrderHistoryHandler = safe(async (input: Record<string, any>) => {
    return fetchApiInternal('/v2/orders', {
        method: "GET",
        query: { ...input },
    });;
});

export const getOrderDetailsHandler = safe(async (input: Record<string, any>) => {
    const path = `/v2/order/${encodeURIComponent(input.orderId)}`;
    return fetchApiInternal(path, {
        method: "GET",
    });
});

export const getOrderBookHandler = safe(async (input: Record<string, any>) => {
    return fetchApiInternal('/v2/order-book', {
        method: "GET",
        query: { ...input },
    });
});

export const estimateBuyResourceHandler = safe(async (input: Record<string, any>) => {
    return fetchApiInternal('/v2/estimate-buy-resource', {
        method: "POST",
        body: { ...input },
    });
});

export const createOrderHandler = safe(async (input: Record<string, any>) => {
    return fetchApiInternal('/v2/buy-resource', {
        method: "POST",
        body: { ...input },
    });
});

export const getExtendableDelegatesHandler = safe(async (input: Record<string, any>) => {
    return fetchApiInternal('/v2/get-extendable-delegates', {
        method: "POST",
        body: { ...input },
    });
});

export const extendRequestHandler = safe(async (input: Record<string, any>) => {
    return fetchApiInternal('/v2/extend-request', {
        method: "POST",
        body: { ...input },
    });
});
