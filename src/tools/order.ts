import z from "zod";
import { ToolDefinition } from "../types";
import { ok, safe } from "../utils/response";

const mockupOrders: {
    orderId: string,
    resourceAmount: number,
    remainAmount: number
    paidTxid: string
    createdAt: number
}[] = [
    {
        orderId: 'order1',
        resourceAmount: 100000,
        remainAmount: 0,
        paidTxid: 'txid_424n3jnrm',
        createdAt: 1705547556
    },
    {
        orderId: 'order2',
        resourceAmount: 300000,
        remainAmount: 0,
        paidTxid: 'txid_7jh76jhgfrm',
        createdAt: 1705547965
    }
]
export const orderTools: ToolDefinition[] = [
    {
        name: 'get_orders',
        title: 'Get orders via api-key',
        description: 'Retrieve all orders with API key',
        inputSchema: z.object({}),
        handler: safe(async (_input) => {
            return ok({
                orders: mockupOrders,
                total: mockupOrders.length,
            })
        })
    },
    {
        name: 'get_order_by_id',
        title: 'Get order by orderId',
        description: 'Retrieve all orders with API key',
        inputSchema: z.object({
            orderId: z.string().min(1).describe("Order ID")
        }),
        handler: safe(async (_input) => {
            return ok(
                mockupOrders.find(order => _input.orderId === order.orderId)
            )
        })
    },
]