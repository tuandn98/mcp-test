import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { initServer } from './server'
import { logger } from './utils/logger'

async function main() {
  const server = initServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
  logger.info('MCP Server started', {
    pid: process.pid,
  })
}

main().catch((e) => {
  logger.error(`Fatal error: ${e instanceof Error ? e.message : JSON.stringify(e)}`)
  process.exit(1)
})