import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { createServer, IncomingMessage, ServerResponse } from 'node:http'
import { IncomingHttpHeaders } from 'node:http'
import { buildMcpRequestContext, ClientSource, logMcpHttpEvent, runWithMcpRequestContext } from './observability/mcpEvents'
import { allTools } from './tools'
import { TOOL_PREFIX } from './utils/constants'
import { logger } from './utils/logger'

export function initServer() {
    const server = new McpServer({
        name: 'tronsave-mcp-server',
        version: '1.1.0',
    })

    // Register tools
    allTools.forEach((tool) => {
        server.registerTool(`${TOOL_PREFIX}_${tool.name}`, { title: tool.title, description: tool.description, inputSchema: tool.inputSchema, outputSchema: tool.outputSchema }, tool.handler)
    })
    return server
}

const MCP_PATH = '/mcp'
const DEFAULT_PORT = 3002
const CLIENT_SOURCE_HEADER = 'x-client-source'

export type RequestClientSource = 'mcp' | 'user'

export function classifyRequestClientSource(headers: IncomingHttpHeaders): RequestClientSource {
    const sourceHeader = headers[CLIENT_SOURCE_HEADER]

    if (typeof sourceHeader !== 'string') {
        return 'user'
    }

    const normalizedSource = sourceHeader.trim().toLowerCase()
    return normalizedSource === 'mcp' ? 'mcp' : 'user'
}

function getHeaderString(headers: IncomingHttpHeaders, key: string): string | undefined {
    const value = headers[key]
    if (typeof value === 'string') {
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : undefined
    }
    return undefined
}

function getToolNameHint(headers: IncomingHttpHeaders, parsedBody: unknown): string {
    const fromHeader = getHeaderString(headers, 'x-mcp-tool-name')
    if (fromHeader) {
        return fromHeader
    }

    if (parsedBody !== null && typeof parsedBody === 'object') {
        const methodName = (parsedBody as { params?: { name?: unknown } }).params?.name
        if (typeof methodName === 'string' && methodName.trim().length > 0) {
            return methodName.trim()
        }
    }

    return 'unknown'
}

function getClientHint(headers: IncomingHttpHeaders): string {
    return getHeaderString(headers, 'x-mcp-client') ?? 'unknown'
}

function getInputParamsRaw(parsedBody: unknown): unknown {
    if (parsedBody !== null && typeof parsedBody === 'object') {
        return (parsedBody as { params?: { arguments?: unknown } }).params?.arguments
    }
    return undefined
}

function getRequestBody(req: IncomingMessage): Promise<unknown> {
    return new Promise((resolve, reject) => {
        let payload = ''
        req.setEncoding('utf8')
        req.on('data', (chunk) => {
            payload += chunk
        })
        req.on('end', () => {
            if (!payload) {
                resolve(undefined)
                return
            }
            try {
                resolve(JSON.parse(payload))
            } catch (error) {
                reject(error)
            }
        })
        req.on('error', reject)
    })
}

function sendJson(res: ServerResponse, statusCode: number, data: Record<string, string>) {
    res.statusCode = statusCode
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data))
}

export async function startStreamableServer(port: number = Number(process.env.PORT) || DEFAULT_PORT) {
    const mcpServer = initServer()
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })

    await mcpServer.connect(transport)

    const httpServer = createServer(async (req, res) => {
        if (!req.url?.startsWith(MCP_PATH)) {
            sendJson(res, 404, { error: 'Not found' })
            return
        }

        const method = req.method?.toUpperCase()
        if (method !== 'POST' && method !== 'GET') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
        }

        try {
            const clientSource = classifyRequestClientSource(req.headers)
            const parsedBody = method === 'POST' ? await getRequestBody(req) : undefined
            const startedAtMs = Date.now()
            const toolName = getToolNameHint(req.headers, parsedBody)
            const clientHint = getClientHint(req.headers)
            const context = buildMcpRequestContext({
                clientSource: clientSource as ClientSource,
                toolName,
                clientHint,
                apiPath: req.url,
                apiMethod: method,
                requestStartedAtMs: startedAtMs,
                inputParamsRaw: getInputParamsRaw(parsedBody),
            })

            logger.info('Streamable request received', {
                method,
                path: req.url,
                clientSource,
                toolName,
                clientHint,
                mcpCorrelationId: context.mcpCorrelationId,
            })

            if (clientSource === 'mcp') {
                res.once('finish', () => {
                    const latencyMs = Date.now() - startedAtMs
                    void runWithMcpRequestContext(context, async () => {
                        await logMcpHttpEvent({ statusCode: res.statusCode, latencyMs })
                    })
                })
            }

            await runWithMcpRequestContext(context, async () => {
                await transport.handleRequest(req, res, parsedBody)
            })
        } catch (error) {
            logger.error('Failed to handle streamable request', error)
            if (!res.headersSent) {
                sendJson(res, 400, { error: 'Invalid request payload' })
            }
        }
    })

    await new Promise<void>((resolve) => {
        httpServer.listen(port, resolve)
    })

    logger.info('MCP Streamable HTTP server started', { pid: process.pid, port, path: MCP_PATH })

    return { server: mcpServer, transport, httpServer, port, path: MCP_PATH }
}
