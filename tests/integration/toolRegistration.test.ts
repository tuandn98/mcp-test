import { describe, expect, it, vi } from "vitest";

import { TOOL_PREFIX } from "../../src/utils/constants";
import { allTools } from "../../src/tools";

vi.mock("@modelcontextprotocol/sdk/server/mcp.js", () => {
  class McpServer {
    public registerTool = vi.fn();
    public constructor(_args: unknown) {}
  }
  return { McpServer };
});

describe("server tool registration", () => {
  it("registers all tools with TOOL_PREFIX convention", async () => {
    const { initServer } = await import("../../src/server");
    const server = initServer() as { registerTool: ReturnType<typeof vi.fn> };

    expect(allTools.length).toBeGreaterThan(0);
    expect(server.registerTool).toHaveBeenCalledTimes(allTools.length);

    for (const tool of allTools) {
      expect(server.registerTool).toHaveBeenCalledWith(
        `${TOOL_PREFIX}_${tool.name}`,
        expect.objectContaining({
          title: tool.title,
          description: tool.description,
          inputSchema: tool.inputSchema,
          outputSchema: tool.outputSchema,
        }),
        tool.handler,
      );
    }
  });
});

