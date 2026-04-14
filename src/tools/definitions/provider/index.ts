import { getProviderInfoHandler } from "../../handlers/provider";
import { ToolDefinition } from "../definition_type";
import { EmptyInputSchema } from "../shares";
import { userInfoOutputSchema } from "./schema";

export const providerTools: ToolDefinition[] = [
    {
        name: "user_info_get",
        title: "User Information",
        description: "Retrieve user information using GraphQL signed authorization." +
            "Use when the user asks for user information." +
            "Read-only."
        ,
        inputSchema: EmptyInputSchema,
        outputSchema: userInfoOutputSchema,
        handler: getProviderInfoHandler,
    }
]
