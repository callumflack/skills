---
name: plan-write
description: Develops an existing draft into a bounded, executable plan with owners, dependencies, and real completion checks.
---

# Prepare the first slice

Read `../plan-spec/SKILL.md` first. Read the existing plan, repository profile, scoped instructions, live code, scripts, and relevant source artifacts. Treat stale plan claims as questions to verify. For a bug, prove the trigger and owning cause before prescribing a fix. Name the owning surface, write boundary, and any external dependency as an actual missing contract or artifact; a numbered earlier PR is a sequencing dependency only when its content truly must land first.

Choose the smallest vertical slice that reaches a reviewable result. Use an available `code-stacks`, `ui-grammar`, or `build-loop-plan` skill only when its specific technique helps this work. Keep decisions, Remaining work, Done when, and Verification in the same evolving plan file; do not create a parallel scratch plan. Confirm each proposed command from repository scripts, and name working directory. For UI, specify the real route, state, and viewport that can demonstrate the change. State whether the agreed target is local, reviewed, merged, or deployed, and what evidence proves it.

Resolve design questions blocking the first slice. Leave later options as later work, without enlarging the first change. Once the first change and completion check are executable, move the same file to `plans/next/` with `mv` and refresh links to its prior path. If a blocking choice remains, keep it in `drafts/` with a concrete next question. Preparing a plan does not itself authorize implementation.
