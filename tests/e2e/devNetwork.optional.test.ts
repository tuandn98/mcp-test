import { beforeAll, describe, expect, it } from "vitest";

import { execSync } from "node:child_process";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import { TOOL_PREFIX } from "../../src/utils/constants";

const shouldRun = process.env.E2E_DEV === "1" && (process.env.TRONSAVE_API_KEY?.trim()?.length ?? 0) > 0;

describe.runIf(shouldRun)("e2e stdio (dev/sandbox network)", () => {
  beforeAll(() => {
    execSync("npm run build", { stdio: "inherit" });
  });

  it("calls internal_account_get against configured backend", async () => {
    const transport = new StdioClientTransport({
      command: "node",
      args: ["dist/index.js"],
      cwd: process.cwd(),
      env: {
        ...process.env,
      },
    });

    const client = new Client({ name: "tronsave-mcp-e2e-dev", version: "0.0.0" });
    await client.connect(transport);

    const res = await client.callTool({
      name: `${TOOL_PREFIX}_internal_account_get`,
      arguments: {},
    });

    // We only assert "not an error" here; response shape depends on live backend.
    expect(res.isError).toBe(false);

    await client.close();
  });
});

