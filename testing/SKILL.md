---
name: testing
description: "Choose, write, keep, or delete tests using the smallest real oracle. Use when adding, changing, deleting, or justifying tests; fixing brittle tests; choosing a proof oracle; or deciding no test is appropriate."
---

# Testing

## Relationship

This skill selects the oracle and what earns a test.

- `code-stacks` copies a selected oracle into a plan. It does not choose one. If no oracle is selected, use this skill first.
- `bug-repro-test-first` is _when_: a reported bug gets a failing proof before the fix. This skill is _whether_, _what_, and _which layer_.
- Host-repo gates, doctrine linters, and package scripts stay in the host repo. Copy their exact command; do not invent a portable substitute.

## Core Rule

Good tests are executable reasons to trust behavior.

They protect workflows, ownership boundaries, product contracts, runtime honesty, auth/security contracts, data mapping, and known failure modes. They do not checksum implementation shape, classes, tokens, copied model values, or draft copy.

A proof that flakes is not a proof.

## Pick The Smallest Real Oracle

- Typecheck/lint: route types, imports, impossible states, formatting rules.
- Unit/model: branching, state transforms, route targets, source-state mapping.
- Integration: multiple pieces working together with real-ish app data.
- Browser: visible workflows, layout, interactions, hydration, runtime overlays, diagnostics, and CSS behavior.
- Manual/design QA: taste, spacing, hierarchy, color, and product judgement.

Use the cheaper oracle only when it proves the actual risk. Move up when the lower layer can lie.

Manual/design QA is acceptable only when the risk is judgement and the inspection is actually performed. If presentation can break a workflow, accessibility, trust, legal/security meaning, or a repeated regression, use browser or screenshot proof.

After choosing the oracle, take the exact command from the selected product gate first. Otherwise use the touched package's `package.json`. Prefer focused test paths over broad suites when they prove the named risk.

Prefer deterministic fixtures, clocks, and waits. If the oracle flakes, drop down a layer or isolate the race; do not keep it.

## Write Tests Vertically

Do not bulk-write speculative test suites.

Name one behavior, risk, or boundary. Add one focused proof through the public interface. Get it passing with the smallest product change. Then decide whether another proof has earned its place.

When a test is the problem, patch the assertion or the smallest enclosing test. Do not rewrite helpers, add source hooks, or restyle nearby tests until the existing public contract cannot express the behavior.

## What Earns A Test

Prefer tests for behavior that can break while still typechecking:

- complex TypeScript branching or state transforms
- async boundaries, races, retries, cancellation, and terminal states
- auth, permission, privacy, security, and runtime-boundary contracts
- data mapping, normalization, persistence, and source-state classification
- route targets, redirects, mutations, and cross-module product contracts
- error-path identity by code, type, route, or state, not human-facing prose
- regressions where the failure mode is known and expensive

Do not assert ceremony:

- body copy, section headings, status wording, or absence of old copy
- CSS classes, Tailwind utilities, token values, color ratios, or data-slot names
- whether a component happens to use a particular child, wrapper, or class
- copied object literals or adjacent model spelling
- static render snapshots whose only signal is text or layout spelling

Keep the assertion only when that exact surface is the public contract under change: a spec, design source, legal/accessibility requirement, protocol surface, external reference, or known harmful failure mode beyond aesthetics. Absence-of-old-copy assertions are useful only while an explicit migration is in flight; delete them after the sweep is settled.

Screenshot or browser proof of workflow-breaking presentation is not ceremony.

Delete or replace tests that only assert the ceremony list.

## Decision Check

Before adding or keeping a test, answer:

1. What failure would this catch?
2. Would a user, runtime boundary, product contract, or repeated bug care?
3. Is this the smallest real oracle that proves it?
4. Will this survive a harmless internal refactor?
5. Will this stay green for the same reason twice — no flake?
6. When it fails, will the fix be obvious?

If no test is right, name the smaller oracle used instead.
