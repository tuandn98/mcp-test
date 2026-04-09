# Add automated test coverage (Vitest)
Status: in-progress | Started: 2026-04-09

## Goal
Introduce automated tests for this MCP server using Vitest: unit tests for pure logic, integration tests for tool wiring and validation, and end-to-end tests that exercise the server over stdio.

## Scope
- In scope: Vitest setup, test scripts, baseline folder structure, initial test suites (unit/integration/e2e), and minimal docs updates needed to run tests locally and in CI.
- Out of scope: Releasing a new version, changing tool behavior, refactoring production code except where small seams are needed to make code testable.

## Decision Log
- 2026-04-09: Use Vitest as the test runner (fast, TypeScript-friendly).
- 2026-04-09: E2E strategy is dual-mode: mock-only suite suitable for CI plus an optional dev/sandbox suite requiring secrets in a secure environment.
