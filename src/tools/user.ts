import z from "zod";
import { ToolDefinition } from "../types";
import { ok, safe } from "../utils/response";

export const userTools: ToolDefinition[] = [
    {
        name: 'get_internal_account_info',
        title: 'Get internal account info',
        description: `Retrieve the internal account information associated with the TRONSAVE_API_KEY. 
        Returns wallet address, current TRX balance, and account metadata.`,
        inputSchema: z.object({}),
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
]