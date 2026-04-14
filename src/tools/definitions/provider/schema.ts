import z from "zod";

export const userInfoOutputSchema = z.object({
    caller: z.string().nullable(),
    address: z.string(),
    balance: z.string(),
    info: z.object({
        createdBotCount: z.number(),
        contacts: z.array(z.object({
            type: z.enum(["EMAIL", "PHONE", "TELEGRAM", "WECHAT"]),
            contactId: z.string(),
            isActive: z.boolean(),
            isVerify: z.boolean(),
            username: z.string(),
        })),
        whitelistLevel: z.number(),
        userRefCode: z.string(),
        sponsor: z.string(),
        pendingRefCode: z.string().nullable(),
        totalRef: z.number(),
        totalPendingRef: z.number(),
        totalRefBonus: z.string(),
        remainRefBonus: z.string(),
        rank: z.number()
      }).describe("user information")
});