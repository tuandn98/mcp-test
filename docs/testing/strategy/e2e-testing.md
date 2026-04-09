# End-to-end testing strategy

## Goal

End-to-end tests exercise the server as a **black box**: spawn the MCP process with **stdio**, send tool calls that match the protocol your host uses, and assert on structured responses. Optionally run against TronSave **dev** with a dedicated API key in a secure environment (not necessarily in public CI).

## Current state

The `package.json` scripts `start:e2e` and `start:prod` set `TL_MODE`, but **application code does not read `TL_MODE`** (see [protocols/auth-protocol.md](../../protocols/auth-protocol.md)). E2E automation is not yet checked into this repository.

## Conventions (when implemented)

- Document required env vars (`TRONSAVE_API_KEY`, `NETWORK`) per environment.
- Prefer idempotent or safe read-only tools for smoke tests when calling real backends.

## Related

- [unit-testing.md](./unit-testing.md)
- [integration-testing.md](./integration-testing.md)
- [test-plans/](../test-plans/) — Feature-specific plans
