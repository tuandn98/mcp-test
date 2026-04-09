# Unit testing strategy

## Goal

Unit tests should validate **pure logic** and **small modules in isolation**: Zod schema behavior, response shaping in `src/utils/response.ts`, URL construction in helpers, and error branches that do not require live HTTP.

## Current state

Unit tests are implemented using **Vitest** and live under `tests/unit/`.

Run them with:

```bash
npm test
```

## Conventions

- Prefer testing **handlers** with `fetchApiInternal` mocked or stubbed so tests do not call TronSave production or dev hosts.
- Keep fixtures minimal and colocated with tests or under a dedicated `fixtures/` directory.

## Related

- [integration-testing.md](./integration-testing.md)
- [e2e-testing.md](./e2e-testing.md)
