---
name: code-stacks
description: "Draft code-shaped planning notes as stacks made of types, interfaces, boundaries, composition, and call stacks. Use after owner, scope, and proof oracle are selected, when live code work needs executable structure before edits; not for PRD-to-local-plan conversion."
---

# Code Stacks

Use this when a code-shaped plan needs to be concrete enough to implement, but not yet code.

## Rule

Plan in the shape of the system:

- types and interfaces;
- boundary names;
- composition points;
- call stacks;
- data and control flow;
- exact oracles.

Do not turn this into architecture theater. Every planned type, function, or call frame should point at a live repo surface or an explicit new surface.

## Boundary

This skill does not select scope, create execution state, or define done.

- Use the host repo instructions for owner, allowed writes, and forbidden surfaces.
- Use the selected proof oracle or done gate. Copy it into the plan; do not invent a replacement.
- For PRD-to-local-plan conversion, use `build-loop-plan` or the host repo's equivalent planning workflow.
- If no artifact owner is selected, keep the stack plan in chat.

## Workflow

1. Start from the selected owner, scope, and proof oracle.
2. Inspect the live files that will anchor the plan.
3. List the existing symbols, routes, modules, APIs, or tests that matter.
4. Draft the plan as pseudocode:
   - data shapes first;
   - interfaces second;
   - call stack third;
   - implementation steps last.
5. Mark new names as `new` and existing names as `existing`.
6. Attach the selected oracle beside the stack frame it proves.
7. Before coding, re-read the touched files. The plan is a guide, not source truth.

## Format

<!-- prettier-ignore-start -->

````md
# <Feature or Fix> Stack Plan

Owner surface: `<app/package/path>`
Forbidden surfaces: `<paths or systems>`
Done gate: `<selected proof oracle>`

## Live Anchors

- existing: `<symbol/path>` - <why it matters>
- new: `<symbol/path>` - <why it belongs here>

## Shapes

```ts
type ExistingInput = ...

interface NewBoundary {
  method(input: ExistingInput): Output
}
```

## Call Stack

```txt
user action / caller
  -> existing entrypoint
    -> new boundary
      -> existing dependency
        -> done oracle
```

## Composition

```ts
// existing caller
const result = newBoundary({
  fromExisting,
  constrainedBy,
})
```

## Steps

1. Patch `<path>` to add `<boundary>`.
2. Wire `<existing caller>` through `<boundary>`.
3. Prove with `<selected oracle>`.
````

<!-- prettier-ignore-end -->

## Discipline

- Prefer real symbol names over generic labels.
- Keep speculative surfaces out of the stack.
- Keep edge cases attached to the frame that owns them.
- If the plan cannot name a caller, callee, boundary, and oracle, go back to repo inspection.
