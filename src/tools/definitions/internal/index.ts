import z from "zod";

/** Second sentence on every internal tool: prerequisite after the imperative core (see mcp_tool_standards §3). */
export const TRONSAVE_API_KEY_AUTH =
    "Requires TRONSAVE_API_KEY to be configured for the client; every internal tool call must be authenticated with this key.";

/**
 * Sentence 1: imperative + core function. Sentence 2: {@link TRONSAVE_API_KEY_AUTH}.
 * Remaining sentences: when to use, side effects, read-only, etc.
 */
export function withTronSaveAuth(firstSentence: string, ...rest: string[]): string {
    const core = firstSentence.trim();
    const tail = rest.map((s) => s.trim()).filter(Boolean).join(" ");
    const coreWithStop = core.endsWith(".") ? core : `${core}.`;
    return tail
        ? `${coreWithStop} ${TRONSAVE_API_KEY_AUTH} ${tail}`
        : `${coreWithStop} ${TRONSAVE_API_KEY_AUTH}`;
}

export const resourceTypeOptional = z
    .enum(["ENERGY", "BANDWIDTH"])
    .optional()
    .describe("Resource type. Default ENERGY when omitted.");

export const unitPriceOptional = z
    .union([z.enum(["FAST", "MEDIUM", "SLOW"]), z.number()])
    .optional()
    .describe(
        "Pricing: FAST | MEDIUM | SLOW strategy, or exact unit price in SUN per resource unit. Default MEDIUM when omitted."
    );

export const durationSecOptional = z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Delegation duration in seconds. Default 259200 (3 days) when omitted.");

export const receiverOptional = z
    .string()
    .optional()
    .describe("TRON base58 address that will receive the resource.");

export const receiverRequired = z
    .string()
    .min(1)
    .describe("TRON base58 address that will receive the resource.");

export const requesterOptional = z
    .string()
    .optional()
    .describe("TRON base58 requester; defaults to the API key account when omitted.");

/** Receiver for delegation extend flows (internal.extend.*). */
export const receiverDelegatedRequired = z
    .string()
    .min(1)
    .describe("TRON base58 address of the account that receives the delegated resource.");

export const resourceAmountPositive = z
    .number()
    .positive()
    .describe("Amount of resource to purchase (resource units).");

export const paginationFields = {
    page: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe("Page index, 0-based. Omit for first page (default 0)."),
    pageSize: z
        .number()
        .int()
        .min(1)
        .optional()
        .describe("Orders per page. Default 10 when omitted. Typical range 1–100."),
} as const;

export const orderBookFields = {
    address: z
        .string()
        .optional()
        .describe("Optional TRON base58 address filter for the receiver."),
    resourceType: resourceTypeOptional,
    minDelegateAmount: z
        .number()
        .min(0)
        .optional()
        .describe("Minimum resource amount per offer level to include (resource units, not SUN)."),
    durationSec: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Delegation duration window in seconds for the quote."),
} as const;

export const orderEstimateOptions = z
    .object({
        allowPartialFill: z
            .boolean()
            .optional()
            .describe("Allow partial fill so the order can match partially. Default true when omitted."),
    })
    .optional()
    .describe("Optional flags that affect matching behavior for the estimate.");

export const orderCreateOptions = z
    .object({
        allowPartialFill: z
            .boolean()
            .optional()
            .describe("Allow partial fill. Default true when omitted."),
        onlyCreateWhenFulfilled: z
            .boolean()
            .optional()
            .describe("Only create if the order can be 100% fulfilled. Default false when omitted."),
        maxPriceAccepted: z
            .number()
            .min(0)
            .optional()
            .describe("Maximum unit price in SUN you accept."),
        preventDuplicateIncompleteOrders: z
            .boolean()
            .optional()
            .describe("Skip if an identical pending order already exists. Default false when omitted."),
        minResourceDelegateRequiredAmount: z
            .number()
            .min(0)
            .optional()
            .describe("Minimum resource amount per matching provider (resource units)."),
    })
    .optional()
    .describe("Optional execution guards and fill behavior.");

export const extendDataRowSchema = z.object({
    delegator: z.string().min(1).describe("TRON base58 delegator address."),
    isExtend: z.boolean().describe("Whether to extend this delegation row."),
    extraAmount: z
        .number()
        .min(0)
        .describe("Additional resource amount to add (resource units)."),
    extendTo: z
        .number()
        .int()
        .positive()
        .describe("Target end time as Unix epoch milliseconds, matching internal.extend.delegates."),
});

export const extendToMsRequired = z
    .number()
    .int()
    .positive()
    .describe("Target end time as Unix epoch milliseconds (UTC) for the extended delegation.");

export const maxPriceAcceptedOptional = z
    .number()
    .min(0)
    .optional()
    .describe("Maximum unit price in SUN you are willing to pay for the extension.");

export const orderIdParam = z
    .string()
    .min(1)
    .describe(
        "TronSave order ID (hex string), e.g. value returned in internal.order.create response data.orderId."
    );
