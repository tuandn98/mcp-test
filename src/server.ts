import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { ServerNotification, ServerRequest } from '@modelcontextprotocol/sdk/types.js'
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js'
import { getSessionStore, runWithSession } from './session'
import { allTools } from './tools'
import { TOOL_PREFIX } from './utils/constants'

export function initServer() {
    const server = new McpServer({
        name: 'tronsave-mcp-server',
        version: '1.0.0',
    })

    const store = getSessionStore()

    // Register tools — wrap so each call runs inside session AsyncLocalStorage (stdio default or HTTP mcp-session-id).
    allTools.forEach((tool) => {
        server.registerTool(
            `${TOOL_PREFIX}_${tool.name}`,
            { title: tool.title, description: tool.description, inputSchema: tool.inputSchema, outputSchema: tool.outputSchema },
            async (args, extra: RequestHandlerExtra<ServerRequest, ServerNotification>) => {
                return runWithSession(extra, store, () => tool.handler(args, extra))
            },
        )
    })
    return server
}

