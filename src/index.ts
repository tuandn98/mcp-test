import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { allTools } from './tools'
import { logger } from './utils/logger'
import { err } from './utils/response'

// ─── Server khởi tạo ─────────────────────────────────────────────────────────

const server = new McpServer({
  name: 'mcp-server',
  version: '1.0.0',
})

allTools.forEach((tool) => {
  server.registerTool(tool.name, {title: tool.name, description: tool.description, inputSchema: tool.inputSchema}, tool.handler)
})

// ─── Khởi động ───────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)

  logger.info('MCP Server started', {
    tools: allTools.map((t) => t.name),
    pid: process.pid,
  })
}

main().catch((e) => {
  logger.error('Fatal error', e)
  process.exit(1)
})