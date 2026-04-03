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
} from ".";
import { EmptyInputSchema } from "../shares";

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
        handler: safe(async (_input) => {
            return ok({
                "error": false,
                "message": "Success",
                "data": {
                    "address": "TKVSaJQDWeKFSEXmA44pjxduGTxy999999",
                    "balance": 50000000,
                    "balanceTrx": 50
                }
            })
        })
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
        handler: safe(async (_input) => {
            return ok({
                "error": false,
                "message": "Success",
                "data": [
                    {
                        "id": "6818426a65fa8ea36d119d2c",
                        "requester": "TKVSaJQDWeKFSEXmA44pjxduGTxy999999",
                        "receiver": "TKVSaJQDWeKFSEXmA44pjxduGTxy999999",
                        "resourceAmount": 32000,
                        "resourceType": "ENERGY",
                        "remainAmount": 0,
                        "price": 55,
                        "durationSec": 3600,
                        "orderType": "NORMAL",
                        "allowPartialFill": true,
                        "payoutAmount": 1760000,
                        "fulfilledPercent": 100,
                        "delegates": [
                            {
                                "delegator": "TKVSaJQDWeKFSEXmA44pjxduGTxy888888",
                                "amount": 32000,
                                "txid": "b200e8b7f9130b67ff403c51d6f7a92acc7c4618906c375b69aabbcc"
                            }
                        ]
                    },
                    {
                        "id": "651d0e5d8248d002ea08a231",
                        "requester": "TKVSaJQDWeKFSEXmA44pjxduGTxy999999",
                        "receiver": "TKVSaJQDWeKFSEXmA44pjxduGTxy999999",
                        "resourceAmount": 100000,
                        "resourceType": "ENERGY",
                        "remainAmount": 100000,
                        "price": 45,
                        "durationSec": 259200,
                        "orderType": "NORMAL",
                        "allowPartialFill": false,
                        "payoutAmount": 4500000,
                        "fulfilledPercent": 0,
                        "delegates": []
                    }
                ],
                "total": 2
            })
        })
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
        handler: safe(async (_input) => {
            return ok({
                "error": false,
                "message": "Success",
                "data": {
                    "id": "6818426a65fa8ea36d119d2c",
                    "requester": "TTgMEAhuzPchNm2tCNmqXp13AxzAd99999",
                    "receiver": "TAk6jzZqHwNUkUcbvMyAE1YAoUPk7r2T6h",
                    "resourceAmount": 32000,
                    "resourceType": "ENERGY",
                    "remainAmount": 0,
                    "price": 55,
                    "durationSec": 3600,
                    "orderType": "NORMAL",
                    "allowPartialFill": true,
                    "payoutAmount": 1760000,
                    "fulfilledPercent": 100,
                    "delegates": [
                        {
                            "delegator": "TQ5VcQjA7wPio485UDhCWAANrMh111111",
                            "amount": 32000,
                            "txid": "b200e8b7f9130b67ff403c51d6f7a92acc7c4618906c375b69aabbcc"
                        }
                    ]
                }
            })
        })
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
        handler: safe(async (_input) => {
            return ok({
                "error": false,
                "message": "Success",
                "data": [
                    { "price": 50, "availableResourceAmount": 943358 },
                    { "price": 51, "availableResourceAmount": 2963976 },
                    { "price": 55, "availableResourceAmount": 5631938 },
                    { "price": 60, "availableResourceAmount": 3438832 },
                    { "price": 90, "availableResourceAmount": 1200000 }
                ]
            })
        })
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
        handler: safe(async (_input) => {
            return ok({
                "error": false,
                "message": "Success",
                "data": {
                    "unitPrice": 55,
                    "durationSec": 259200,
                    "estimateTrx": 7040000,
                    "availableResource": 32000
                }
            })
        })
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
        handler: safe(async (_input) => {
            return ok({
                "error": false,
                "message": "Success",
                "data": {
                    "orderId": "6818426a65fa8ea36d119d2c"
                }
            })
        })
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
        handler: safe(async (_input) => {
            return ok({
                "error": false,
                "message": "Success",
                "data": {
                    "extendOrderBook": [
                        { "price": 108, "value": 100000 },
                        { "price": 122, "value": 200000 }
                    ],
                    "totalDelegateAmount": 300000,
                    "totalAvailableExtendAmount": 300000,
                    "totalEstimateTrx": 24426224,
                    "isAbleToExtend": true,
                    "yourBalance": 37780396,
                    "extendData": [
                        {
                            "delegator": "TQBV7xU489Rq8ZCsYi72zBhJM44444444",
                            "isExtend": true,
                            "extraAmount": 0,
                            "extendTo": 1728704969000
                        },
                        {
                            "delegator": "TMN2uTdy6rQYaTm4A5g732kHR333333333",
                            "isExtend": true,
                            "extraAmount": 0,
                            "extendTo": 1728704969000
                        }
                    ]
                }
            })
        })
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
        handler: safe(async (_input) => {
            return ok({
                "error": false,
                "message": "Success",
                "data": {
                    "orderId": "6819da2d4d1b2aadb0d44eee"
                }
            })
        })
    },
]
