# Ralph Playbook Reference

Source: https://github.com/ClaytonFarr/ralph-playbook

Use this only when changing the Ralph skill. Do not load it for normal build iterations.

## Core Shape

Ralph is a dumb outer loop:

```text
while true:
  feed PROMPT.md to the coding agent
  agent reads requirements + IMPLEMENTATION_PLAN.md + backpressure
  agent completes one loop iteration against checks
  agent updates IMPLEMENTATION_PLAN.md
  agent exits
  next iteration starts with fresh context
```

The loop is intentionally unsophisticated. The plan file is the scheduler and memory between otherwise isolated sessions. Backpressure is the steering system: tests, builds, typechecks, lint, acceptance criteria, and project operational notes reject bad work before the loop claims progress.

## Files

```text
project-root/
  loop.sh
  PROMPT_plan.md
  PROMPT_build.md
  AGENTS.md
  IMPLEMENTATION_PLAN.md
  specs/
  src/
```

Bundled bootstrap templates live in `templates/`. They are for projects that do not already have Ralph prompt or loop files.

Use `project-supplied` by default. Discover the project's actual prompt, plan, spec, loop, and backpressure surfaces; do not assume the canonical filenames exist. Use `bundled-bootstrap` only when setting up Ralph files or when the user explicitly asks for the inbuilt templates.

Do not ship a generic project `AGENTS.md` template. Backpressure is project-specific; write it from the project's real commands and recurring misses.

## Plan Prompt Skeleton

```text
Study specs/*, IMPLEMENTATION_PLAN.md if present, and existing source.
Compare specs against code.
Create/update IMPLEMENTATION_PLAN.md as a prioritized list of remaining work.
Plan only. Do not implement.
Do not assume functionality is missing; confirm with code search first.
```

## Build Prompt Skeleton

```text
Study specs/*, IMPLEMENTATION_PLAN.md, and source.
Choose the most important item from IMPLEMENTATION_PLAN.md.
Before changing files, search the codebase; do not assume not implemented.
Implement functionality completely.
Run tests/checks for the changed unit.
Update IMPLEMENTATION_PLAN.md with findings, completion, and unresolved bugs.
When tests pass, commit the increment if the workflow allows it.
```

## Principles

- Context is everything: one task per fresh loop keeps the model in the useful zone.
- Markdown beats heavy orchestration.
- `IMPLEMENTATION_PLAN.md` is disposable.
- Backpressure is mandatory and matters more than detailed control.
- `AGENTS.md` should stay short and operational.
- Ralph should decide implementation details from specs, code, and feedback.
- Tune signs after observed failures, not before.
- The human sits on the loop, not inside every task.
