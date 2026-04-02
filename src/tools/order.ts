import z from "zod";
import { ToolDefinition } from "../types";
import { ok, safe } from "../utils/response";

export const orderTools: ToolDefinition[] = [
    {
        name: 'get_order_history',
        title: 'Get internal account order history',
        description: `Retrieve the order history of the internal account associated with the TronSave API key. Requires a valid TronSave API key passed in the request header.
        Returns a paginated list of past orders sorted by creation time descending, 
        including resource amount, price, fulfillment status, payout, and matched delegates. 
        Rate limit: 15 requests per second.`,
        inputSchema: z.object({
            page: z.number().optional().describe('Page number, starts from 0. Default: 0'),
            pageSize: z.number().optional().describe('Number of orders per page. Default: 10')
        }),
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
        name: 'get_order_details',
        title: 'Get one order details',
        description: `Retrieve full details of a specific order by its ID from TronSave. Requires a valid TronSave API key passed in the request header.
        Returns order status, resource amount, price, fulfillment percentage, 
        payout amount, and the list of matched delegates with their transaction IDs. 
        Use this to monitor order progress after calling create_order.`,
        inputSchema: z.object({
            orderId: z.string().describe('Order ID returned from create_order')
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
        name: 'get_order_book',
        title: 'Get order book',
        description: `Retrieve the current order book from TronSave energy market. 
        Returns a list of available energy offers sorted by price ascending, 
        each entry containing the unit price in SUN and the available energy amount at that price. 
        Use this before placing a buy order to assess market depth and choose an optimal price.`,
        inputSchema: z.object({
            address: z.string().optional().describe('Receiver resource address'),
            resourceType: z.enum(["ENERGY", "BANDWIDTH"]).describe('Resource type'),
            minDelegateAmount: z.number().optional().describe('Min resource amount delegate'),
            durationSec: z.number().optional().describe('Duration delegate in seconds')
        }),
        handler: safe(async (_input) => {
            return ok(
                {
                    "error": false,
                    "message": "Success",
                    "data": [
                        {
                            "price": 50,
                            "availableResourceAmount": 943358
                        },
                        {
                            "price": 51,
                            "availableResourceAmount": 2963976
                        },
                        {
                            "price": 55,
                            "availableResourceAmount": 5631938
                        },
                    ]
                }
            )
        })
    },
    {
        name: 'estimate_trx',
        title: 'Estimate TRX',
        description: `Estimate the TRX cost before placing a buy order on TronSave. Requires a valid TronSave API key passed in the request header.
        Accepts resource type, amount, duration, unit price strategy and optional receiver address. 
        Returns the estimated unit price in SUN, total TRX cost, and available resource amount at that price. 
        Use this to preview cost and validate budget before calling create_order.`,
        inputSchema: z.object({
            resourceType: z.enum(["ENERGY", "BANDWIDTH"]).optional().describe('Resource type. Default: ENERGY'),
            resourceAmount: z.number().describe('Amount of resource to buy'),
            receiver: z.string().optional().describe('Resource receiving address'),
            requester: z.string().optional().describe('Requester address'),
            durationSec: z.number().optional().describe('Duration in seconds. Default: 259200 (3 days)'),
            unitPrice: z.union([
                z.enum(["FAST", "MEDIUM", "SLOW"]),
                z.number()
            ]).optional().describe('Price strategy or exact price in SUN. Default: MEDIUM'),
            options: z.object({
                allowPartialFill: z.boolean().optional()
            }).optional()
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
        name: 'create_order',
        title: 'Create order',
        description: `Place a new buy order for ENERGY or BANDWIDTH on TronSave. Requires a valid TronSave API key passed in the request header.
        Accepts resource type, amount, receiver address, duration, and pricing strategy (FAST/MEDIUM/SLOW or exact SUN price). 
        Supports partial fill, duplicate prevention, and max price guard via options. 
        Returns the created order ID on success. Rate limit: 15 requests per second.`,
        inputSchema: z.object({
            resourceType: z.enum(["ENERGY", "BANDWIDTH"]).optional().describe('Resource type. Default: ENERGY'),
            resourceAmount: z.number().describe('Amount of resource to buy'),
            receiver: z.string().describe('Resource receiving address'),
            durationSec: z.number().optional().describe('Duration in seconds. Default: 259200 (3 days)'),
            unitPrice: z.union([
                z.enum(["FAST", "MEDIUM", "SLOW"]),
                z.number()
            ]).optional().describe('Price strategy or exact price in SUN. Default: MEDIUM'),
            sponsor: z.string().optional().describe('Sponsor/referral code'),
            options: z.object({
                allowPartialFill: z.boolean().optional().describe('Allow partial fill. Default: true'),
                onlyCreateWhenFulfilled: z.boolean().optional().describe('Only create if can be 100% fulfilled. Default: false'),
                maxPriceAccepted: z.number().optional().describe('Max price accepted in SUN'),
                preventDuplicateIncompleteOrders: z.boolean().optional().describe('Skip if identical pending order exists. Default: false'),
                minResourceDelegateRequiredAmount: z.number().optional().describe('Min resource amount per single provider')
            }).optional()
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
        name: 'get_extendable_delegates',
        title: 'Get extendable delegates',
        description: `Retrieve all extendable delegates for a receiver address on TronSave. Requires a valid TronSave API key passed in the request header.
        Step 1 of the extend flow — call this before extend_request. 
        Returns the extend order book, total delegate amount, estimated TRX payout, 
        internal balance, and the extendData array ready to pass directly into extend_request.
        Rate limit: 1 request per second.`,
        inputSchema: z.object({
            receiver: z.string().describe('The address that received the resource delegate'),
            extendTo: z.number().describe('Timestamp in milliseconds to extend the delegation to'),
            resourceType: z.enum(["ENERGY", "BANDWIDTH"]).optional().describe('Resource type. Default: ENERGY'),
            maxPriceAccepted: z.number().optional().describe('Maximum price per unit willing to pay for extension (SUN)'),
            requester: z.string().optional().describe('Requester address. Defaults to the address linked to the API key')
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
        name: 'extend_request',
        title: 'Extend request',
        description: `Submit an extension request for existing delegated resources on TronSave. Requires a valid TronSave API key passed in the request header.
        Step 2 of the extend flow — must be called after get_extendable_delegates. 
        Pass the extendData array from get_extendable_delegates response directly into this call. 
        Returns an orderId on success. Rate limit: 15 requests per second.`,
        inputSchema: z.object({
            receiver: z.string().describe('The address that received the resource delegate'),
            extendData: z.array(z.object({
                delegator: z.string().describe('Delegator address'),
                isExtend: z.boolean().describe('Whether to extend this delegation'),
                extraAmount: z.number().describe('Extra resource amount to add'),
                extendTo: z.number().describe('Timestamp in milliseconds to extend to')
            })).describe('Extend data array returned from get_extendable_delegates'),
            resourceType: z.enum(["ENERGY", "BANDWIDTH"]).optional().describe('Resource type. Default: ENERGY')
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