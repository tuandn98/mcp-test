import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { allTools } from './tools'
import { TOOL_PREFIX } from './utils/constants'

export function initServer() {
    const server = new McpServer({
        name: 'tronsave-mcp-server',
        version: '1.0.0',
    })

    // Register tools
    allTools.forEach((tool) => {
        server.registerTool(`${TOOL_PREFIX}_${tool.name}`, { title: tool.title, description: tool.description, inputSchema: tool.inputSchema }, tool.handler)
    })
    return server
}

