---
name: docs-to-code
description: "Move implementation explanations into maintainable code, types, tests, module boundaries, or narrow source comments when creating or reviewing architecture prose, implementation docs, or code handoffs. Keep user documentation, ADRs, domain language, and thin navigation pointers in prose."
---

# Docs to Code

Prefer executable and source-adjacent truth. Use this after the owning resolver has been selected; it does not change task ownership or authorize deletion.

## Deletion test

For each claim the proposed or existing document would preserve, place it in the nearest durable owner:

| Claim                             | Owner                                |
| --------------------------------- | ------------------------------------ |
| Behavior or constraint            | Name, type, test, or module boundary |
| Non-obvious integration boundary  | Narrow source comment                |
| Rejected alternative or trade-off | ADR                                  |
| Domain term or invariant          | Glossary or `CONTEXT.md`             |
| Where an owner lives              | Thin navigation pointer              |
| Exact changes or history          | Git; do not duplicate it             |
| User-facing instructions          | User documentation                   |

If code, a type, or a test can express the claim, improve that owner and avoid or delete the duplicated prose. If prose remains, narrow it to what the code cannot express and link to the owner.

## Boundaries

- Never delete user-owned documentation without explicit authorization.
- Fulfil requested user documentation; this skill targets maintainer explanations of code.
- Do not turn ordinary code edits into documentation audits.
- Do not create a sync checklist, recurring maintenance task, log, lesson, or second source of truth merely because code changed.
- Preserve the requested scope and external-action permissions.

## Closeout

Report only:

- what moved into source;
- what remained in prose and why;
- what was discarded as duplicate or recoverable;
- which oracle ran.
