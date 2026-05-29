# Ralph Loop Backpressure

Generic. No repo-specific paths.

## Order

1. Use the current task's acceptance criteria.
2. Use project operational notes, usually `AGENTS.md`.
3. Run the smallest check that proves the changed surface.
4. If the project names checks, run those first.
5. If behavior changed and no check exists, add or run a focused check where the project normally keeps checks.

## Plan Pressure

`IMPLEMENTATION_PLAN.md` is the loop memory.

Update it when:

- a task completes;
- a blocker is found;
- a check fails for a real reason;
- work is already implemented;
- the plan is stale or wrong.

## Backpressure Miss

If there is no meaningful proving check, do not invent confidence.

Record the gap in `IMPLEMENTATION_PLAN.md`, then either add the smallest useful check or report that the loop is blocked on missing backpressure.

## AGENTS.md Hygiene

Keep project `AGENTS.md` operational only.

Put commands, recurring gotchas, and durable run instructions there. Put progress, status, and discoveries in `IMPLEMENTATION_PLAN.md`.
