# Unit testing strategy

## Goal

Unit tests should validate **pure logic** and **small modules in isolation**: Zod schema behavior, response shaping in `src/utils/response.ts`, URL construction in helpers, and error branches that do not require live HTTP.

## Current state

The repository does not yet include an automated unit test runner (for example Jest or Vitest) in `package.json`. Treat this document as the **intended** direction when tests are introduced.

## Conventions (when implemented)

- Prefer testing **handlers** with `fetchApiInternal` mocked or stubbed so tests do not call TronSave production or dev hosts.
- Keep fixtures minimal and colocated with tests or under a dedicated `fixtures/` directory.

## Related

- [integration-testing.md](./integration-testing.md)
- [e2e-testing.md](./e2e-testing.md)
