import z from "zod";
import { ToolDefinition } from "../definition_type";
import {
    buyResourceOutputSchema,
    durationSecOptional,
    estimateOrderOutputSchema,
    extendDataRowSchema,
    extendDelegatesOutputSchema,
    extendToMsRequired,
    getInternalAccountOutputSchema,
    getOrderBookOutputSchema,
    internalOrderListOutputSchema,
    internalOrderOutputSchema,
    maxPriceAcceptedOptional,
    orderBookFields,
    orderCreateOptions,
    orderEstimateOptions,
    orderIdParam,
    paginationFields,
    receiverDelegatedRequired,
    receiverOptional,
    receiverRequired,
    requesterOptional,
    resourceAmountPositive,
    resourceTypeOptional,
    unitPriceOptional,
    withTronSaveAuth,
} from "./schema";
import { EmptyInputSchema } from "../shares";
import { createOrderHandler, estimateBuyResourceHandler, extendRequestHandler, getExtendableDelegatesHandler, getInternalAccountHandler, getOrderBookHandler, getOrderDetailsHandler, getOrderHistoryHandler } from "../../handlers/internal";

export const internalTools: ToolDefinition[] = [
    {
        name: "internal_account_get",
        title: "Internal Account Information",
        description: withTronSaveAuth(
            "Retrieve the Tronsave account profile linked to the API key: wallet address, TRX balance, and account metadata.",
            "Use when the user needs their linked address or balance.",
            "Read-only; does not submit orders or change chain state."
        ),
        inputSchema: EmptyInputSchema,
        outputSchema: getInternalAccountOutputSchema,
        handler: getInternalAccountHandler
    },
    {
        name: "internal_order_history",
        title: "Internal Account Order History",
        description: withTronSaveAuth(
            "List paginated order history for the internal account linked to the API key, sorted by creation time descending.",
            "Use when the user asks about past purchases, fulfillment, payouts, or delegates.",
            "Read-only."
        ),
        inputSchema: z.object({ ...paginationFields }),
        outputSchema: internalOrderListOutputSchema,
        handler: getOrderHistoryHandler
    },
    {
        name: "internal_order_details",
        title: "Single Order Details",
        description: withTronSaveAuth(
            "Fetch full details for one TronSave order by order ID.",
            "Use when monitoring fulfillment after internal.order.create or when the user asks for status on a specific order.",
            "Read-only."
        ),
        inputSchema: z.object({
            orderId: orderIdParam,
        }),
        outputSchema: internalOrderOutputSchema,
        handler: getOrderDetailsHandler
    },
    {
        name: "internal_order_book",
        title: "Energy Market Order Book",
        description: withTronSaveAuth(
            "Return the current TronSave market depth for ENERGY or BANDWIDTH: offers sorted by unit price ascending.",
            "Use before internal.order.create or internal.order.estimate when the user needs live prices or liquidity.",
            "Read-only."
        ),
        inputSchema: z.object({ ...orderBookFields }),
        outputSchema: getOrderBookOutputSchema,
        handler: getOrderBookHandler
    },
    {
        name: "internal_order_estimate",
        title: "Estimate TRX Cost Before Order",
        description: withTronSaveAuth(
            "Estimate TRX cost for a buy order before submitting it.",
            "Use when the user wants a quote, price check, or comparison with the order book.",
            "Read-only."
        ),
        inputSchema: z.object({
            resourceType: resourceTypeOptional,
            resourceAmount: resourceAmountPositive,
            receiver: receiverOptional,
            requester: requesterOptional,
            durationSec: durationSecOptional,
            unitPrice: unitPriceOptional,
            options: orderEstimateOptions,
        }),
        outputSchema: estimateOrderOutputSchema,
        handler: estimateBuyResourceHandler
    },
    {
        name: "internal_order_create",
        title: "Create Energy or Bandwidth Order",
        description: withTronSaveAuth(
            "Place a new buy order for ENERGY or BANDWIDTH on TronSave.",
            "This submits an order to the market and may lock or spend TRX according to API rules."
        ),
        inputSchema: z.object({
            resourceType: resourceTypeOptional,
            resourceAmount: resourceAmountPositive,
            receiver: receiverRequired,
            durationSec: durationSecOptional,
            unitPrice: unitPriceOptional,
            sponsor: z.string().optional().describe("Optional sponsor or referral code."),
            options: orderCreateOptions,
        }),
        outputSchema: buyResourceOutputSchema,
        handler: createOrderHandler
    },
    {
        name: "internal_extend_delegates",
        title: "List Extendable Delegations",
        description: withTronSaveAuth(
            "Return extendable delegations for a receiver and produce extendData for the extension flow.",
            "Use as step 1 before internal.extend.request when the user wants to extend existing delegation time.",
            "Read-only."
        ),
        inputSchema: z.object({
            receiver: receiverDelegatedRequired,
            extendTo: extendToMsRequired,
            resourceType: resourceTypeOptional,
            maxPriceAccepted: maxPriceAcceptedOptional,
            requester: requesterOptional,
        }),
        outputSchema: extendDelegatesOutputSchema,
        handler: getExtendableDelegatesHandler
    },
    {
        name: "internal_extend_request",
        title: "Submit Delegation Extension",
        description: withTronSaveAuth(
            "Submit an extension request for existing delegated resources on TronSave.",
            "This creates an extension order and may commit TRX.",
            "Use as step 2 after internal.extend.delegates; pass extendData from that response unchanged."
        ),
        inputSchema: z.object({
            receiver: receiverDelegatedRequired,
            extendData: z
                .array(extendDataRowSchema)
                .min(1)
                .describe("Rows copied from data.extendData returned by internal.extend.delegates."),
            resourceType: resourceTypeOptional,
        }),
        /** Same contract as `internal.order.create`: new extension order id from `POST /v2/extend-request`. */
        outputSchema: buyResourceOutputSchema,
        handler: extendRequestHandler
    },
]
