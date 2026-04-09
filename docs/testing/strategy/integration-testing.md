# Integration testing strategy

## Goal

Integration tests should verify **wiring between layers**: MCP tool registration, schema validation against representative inputs, and HTTP client behavior against a **controlled** fake or mock server (not the real TronSave API in CI).

## Current state

Integration tests are implemented using **Vitest** and live under `tests/integration/`.

Run them with:

```bash
npm test
```

## Conventions

- Avoid depending on secret API keys in CI; use test doubles or recorded responses where appropriate.
- If TronSave offers a stable sandbox, document credentials and constraints in this file or in CI configuration (without committing secrets).

## Related

- [unit-testing.md](./unit-testing.md)
- [e2e-testing.md](./e2e-testing.md)
