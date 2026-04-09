---
title: Project Initialization Requirements
---

# Project Initialization Requirements

This document defines the **minimum required structure** and **operating rules** that must exist when initializing this repository.

## 1. Mandatory directories and files

The repository must include:

- `docs/` (project documentation)
- `tasks/` (agent task tracking)
- `CHANGELOG.md` (project-level changelog)

## 2. Documentation requirements (`docs/`)

- All documentation under `docs/` must be written in **English**.
- `docs/README.md` is the documentation **table of contents** and must be kept up to date when doc paths change.

See `.cursor/rules/docs-standard.mdc`.

## 3. Task tracking requirements (`tasks/`)

The `tasks/` directory must follow the standard defined by `.cursor/rules/tasks-plans-changelog.mdc`.

### 3.1 Normal tasks (single session)

- Create a file `tasks/YYYY-MM-DD-slug.md`.
- Use it for small changes completed in one session.

### 3.2 Big changes (multi-session)

- Create a folder `tasks/plan-slug/` (must start with `plan-`).
- Include:
  - `plan.md` (overview, scope, decision log)
  - `tasks.md` (execution checklist)

### 3.3 Agent activity log

- `tasks/agent-log.md` must exist.
- The agent appends one line after finishing a task or meaningful plan milestone (append-only).

## 4. Project changelog (`CHANGELOG.md`)

- `CHANGELOG.md` is the project history from a **user/business impact** perspective.
- Use [Keep a Changelog](https://keepachangelog.com/) format.
- Update it for releases or significant merged changes (unless explicitly requested otherwise).
