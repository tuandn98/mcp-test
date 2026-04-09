## Phase 1 - Infrastructure
- [ ] Add Vitest dependencies (and coverage if needed).
- [ ] Add `test`, `test:watch`, and `test:coverage` scripts in `package.json`.
- [ ] Add `vitest.config.ts` (TypeScript, path aliases if any).
- [ ] Create `tests/` structure: `tests/unit/`, `tests/integration/`, `tests/e2e/`.

## Phase 2 - Unit tests (pure logic)
- [ ] Add unit tests for Zod schema validation and parsing behavior.
- [ ] Add unit tests for response shaping helpers (no I/O).
- [ ] Add unit tests for URL construction / small utilities.

## Phase 3 - Integration tests (wiring between layers)
- [ ] Test MCP tool registration: all expected tool names and schemas are registered with the `${TOOL_PREFIX}_...` convention.
- [ ] Test representative tool calls with mocked HTTP client (no real network).
- [ ] Verify error branches for invalid inputs (schema validation) return structured errors.

## Phase 4 - End-to-end tests (stdio black-box)
- [ ] Implement mock-only E2E suite: spawn `node dist/index.js` and send stdio tool calls; assert structured responses.
- [ ] Add optional dev/sandbox E2E suite gated by env vars; default skip in CI.

## Phase 5 - Docs updates
- [ ] Update `docs/testing/strategy/unit-testing.md` to reflect Vitest and how to run unit tests.
- [ ] Update `docs/testing/strategy/integration-testing.md` to reflect mocked HTTP approach and how to run integration tests.
- [ ] Update `docs/testing/strategy/e2e-testing.md` to reflect dual-mode E2E (mock CI + optional dev/sandbox).
- [ ] Update `docs/README.md` with the commands to run each test suite.
