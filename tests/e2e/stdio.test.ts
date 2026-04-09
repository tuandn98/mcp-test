import { beforeAll, describe, expect, it } from "vitest";

import { existsSync } from "node:fs";
import { execSync } from "node:child_process";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import { allTools } from "../../src/tools";
import { TOOL_PREFIX } from "../../src/utils/constants";

function getFirstTextContent(result: unknown): string {
  if (!result || typeof result !== "object") return "";
  const content = (result as any).content;
  if (!Array.isArray(content) || content.length === 0) return "";
  const first = content[0];
  if (!first || typeof first !== "object") return "";
  return typeof (first as any).text === "string" ? (first as any).text : "";
}

describe("e2e stdio (mock-only)", () => {
  beforeAll(() => {
    // E2E tests run the compiled server to match production entrypoint.
    if (!existsSync("dist/index.js")) {
      execSync("npm run build", { stdio: "inherit" });
      return;
    }
    // Always rebuild so `dist/` matches current `src/`.
    execSync("npm run build", { stdio: "inherit" });
  });

  it("can connect over stdio, list tools, and call a tool (missing API key path)", async () => {
    const transport = new StdioClientTransport({
      command: "node",
      args: ["dist/index.js"],
      cwd: process.cwd(),
      env: {
        ...process.env,
        TRONSAVE_API_KEY: "",
      },
    });

    const client = new Client({ name: "tronsave-mcp-e2e", version: "0.0.0" });
    await client.connect(transport);

    const listed = await client.listTools();
    const listedNames = new Set(listed.tools.map((t) => t.name));
    const expectedNames = allTools.map((t) => `${TOOL_PREFIX}_${t.name}`);
    const missing = expectedNames.filter((n) => !listedNames.has(n));
    expect(missing).toEqual([]);

    // Sanity: at least one tool is present.
    expect(listed.tools.length).toBeGreaterThan(0);

    const res = await client.callTool({
      name: `${TOOL_PREFIX}_internal_account_get`,
      arguments: {},
    });

    expect(res.isError).toBe(true);
    expect(getFirstTextContent(res)).toContain("TRONSAVE_API_KEY");

    const badArgs = await client.callTool({
      name: `${TOOL_PREFIX}_get_deposit_address`,
      // Violates min(10)
      arguments: { amountTrx: 1 },
    });
    expect(badArgs.isError).toBe(true);
    // SDK/schema validation errors are surfaced as text to the caller.
    expect(getFirstTextContent(badArgs)).toMatch(/amountTrx|min|zod|validation/i);

    await client.close();
  });
});

