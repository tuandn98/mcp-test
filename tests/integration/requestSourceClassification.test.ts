import { describe, expect, it } from "vitest"

import { classifyRequestClientSource } from "../../src/server"

describe("request source classification", () => {
  it("classifies mcp source case-insensitively", () => {
    const source = classifyRequestClientSource({ "x-client-source": " MCP " })
    expect(source).toBe("mcp")
  })

  it("falls back to user when header is missing", () => {
    const source = classifyRequestClientSource({})
    expect(source).toBe("user")
  })

  it("falls back to user for non-mcp source value", () => {
    const source = classifyRequestClientSource({ "x-client-source": "web" })
    expect(source).toBe("user")
  })
})
