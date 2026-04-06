import { safe } from "../../utils/response";
import { fetchApiInternal } from "./helper";
import { internalApiPaths } from "./internalPaths";

export const getInternalAccountHandler = safe(async () => {
    return fetchApiInternal(internalApiPaths.userInfo, {
        method: "GET",
    });
});

export const getOrderHistoryHandler = safe(async (input: Record<string, any>) => {
    return fetchApiInternal(internalApiPaths.orderHistory, {
        method: "GET",
        query: { ...input },
    });
});

export const getOrderDetailsHandler = safe(async (input: Record<string, any>) => {
    const path = `${internalApiPaths.orderDetailsBase.replace(/\/$/, "")}/${encodeURIComponent(input.orderId)}`;
    return fetchApiInternal(path, {
        method: "GET",
    });
});

export const getOrderBookHandler = safe(async (input: Record<string, any>) => {
    return fetchApiInternal(internalApiPaths.orderBook, {
        method: "GET",
        query: { ...input },
    });
});

export const estimateBuyResourceHandler = safe(async (input: Record<string, any>) => {
    return fetchApiInternal(internalApiPaths.estimateBuyResource, {
        method: "POST",
        body: { ...input },
    });
});

export const createOrderHandler = safe(async (input: Record<string, any>) => {
    return fetchApiInternal(internalApiPaths.createOrder, {
        method: "POST",
        body: { ...input },
    });
});

export const getExtendableDelegatesHandler = safe(async (input: Record<string, any>) => {
    return fetchApiInternal(internalApiPaths.extendableDelegates, {
        method: "POST",
        body: { ...input },
    });
});

export const extendRequestHandler = safe(async (input: Record<string, any>) => {
    return fetchApiInternal(internalApiPaths.extendRequest, {
        method: "POST",
        body: { ...input },
    });
});
