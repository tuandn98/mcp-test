# Integration testing strategy

## Goal

Integration tests should verify **wiring between layers**: MCP tool registration, schema validation against representative inputs, and HTTP client behavior against a **controlled** fake or mock server (not the real TronSave API in CI).

## Current state

No dedicated integration test suite is wired in the repository yet. This file defines the **intended** scope for when it is added.

## Conventions (when implemented)

- Avoid depending on secret API keys in CI; use test doubles or recorded responses where appropriate.
- If TronSave offers a stable sandbox, document credentials and constraints in this file or in CI configuration (without committing secrets).

## Related

- [unit-testing.md](./unit-testing.md)
- [e2e-testing.md](./e2e-testing.md)
