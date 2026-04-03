import z from "zod";
import { ToolDefinition } from "../definition_type";
import { ok, safe } from "../../../utils/response";
import {
    durationSecOptional,
    extendDataRowSchema,
    extendToMsRequired,
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
        name: "internal.account.get",
        title: "Internal Account Information",
        description: withTronSaveAuth(
            "Retrieve the Tronsave account profile linked to the API key: wallet address, TRX balance, and account metadata.",
            "Use when the user needs their linked address or balance.",
            "Read-only; does not submit orders or change chain state."
        ),
        inputSchema: EmptyInputSchema,
        handler: getInternalAccountHandler
    },
    {
        name: "internal.order.history",
        title: "Internal Account Order History",
        description: withTronSaveAuth(
            "List paginated order history for the internal account linked to the API key, sorted by creation time descending.",
            "Use when the user asks about past purchases, fulfillment, payouts, or delegates.",
            "Read-only."
        ),
        inputSchema: z.object({ ...paginationFields }),
        handler: getOrderHistoryHandler
    },
    {
        name: "internal.order.details",
        title: "Single Order Details",
        description: withTronSaveAuth(
            "Fetch full details for one TronSave order by order ID.",
            "Use when monitoring fulfillment after internal.order.create or when the user asks for status on a specific order.",
            "Read-only."
        ),
        inputSchema: z.object({
            orderId: orderIdParam,
        }),
        handler: getOrderDetailsHandler
    },
    {
        name: "internal.order.book",
        title: "Energy Market Order Book",
        description: withTronSaveAuth(
            "Return the current TronSave market depth for ENERGY or BANDWIDTH: offers sorted by unit price ascending.",
            "Use before internal.order.create or internal.order.estimate when the user needs live prices or liquidity.",
            "Read-only."
        ),
        inputSchema: z.object({ ...orderBookFields }),
        handler: getOrderBookHandler
    },
    {
        name: "internal.order.estimate",
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
        handler: estimateBuyResourceHandler
    },
    {
        name: "internal.order.create",
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
        handler: createOrderHandler
    },
    {
        name: "internal.extend.delegates",
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
        handler: getExtendableDelegatesHandler
    },
    {
        name: "internal.extend.request",
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
        handler: extendRequestHandler
    },
]
