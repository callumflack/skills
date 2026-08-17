---
name: ui-grammar
description: "Scans React surfaces into observed component facts, combines them with declared semantic rules and witnesses, and compiles product requests into proof-carrying UI stacks. Use when configuring, discussing, creating, or revising UI without drifting from a design system."
---

# UI Grammar

A UI grammar is a small intermediate language between product intent and React.
Keep every claim in one of four classes:

- **observed facts** recovered from source;
- **declared rules** that name intent and ownership;
- **derived results** compiled from a request and those rules;
- **unknowns** that the available evidence cannot establish.

Attach witnesses to consequential declared rules. The compiler may discover
implementation, but it must not promote implementation into design intent by
itself. Aim for automatic orientation, not automatic understanding.

For the human-facing explanation and progressive introduction, read
[README.md](README.md).

## Primitive

Write each rule as a guarded relation between typed terms:

```text
under <context>
<subject> <must | may | must-not> <relation> <object>
because <condition>
owned by <semantic owner>
witnessed by <code | test | runtime | specimen>
```

Dynamic UI adds two projections:

```text
render(state, environment) -> view tree
step(state, event) -> next state + effects
```

## Core rule

Every visible delta has one named cause.

- Content-driven differences are derived inside the component.
- Semantic states are explicit typed inputs.
- Containers own placement; components own their internal geometry.
- A consumer does not choose a visual size when slot presence already explains
  the size.

## Workflow

1. **Capture the pressure.** Quote the discussion and mark what must remain the
   same versus what may change. Completion: every comparison has an invariant
   and a delta.
2. **Bootstrap observations.** Point `bootstrap` at a route or UI entry and
   inspect its reachable component graph and unknowns. Completion: source facts
   are available without semantic fields or product guesses.
3. **Find the live owner.** Inspect the route, render root, primitives, semantic
   model, current consumers, and witnesses before naming rules. Completion: the
   implementation owner and semantic owner are both current.
4. **Configure and validate observed facts.** Write the product grammar, then
   run the bundled `scan` and `validate` commands. Completion: imports, JSX
   relations, slots, props, conditions, source locations, and declared witness
   anchors resolve without semantic promotion.
5. **Write the grammar receipt.** Use this shape:

   ```text
   Grammar:
   Owner:
   Tree:
   Product inputs:
   Optional slots:
   Derived rules:
   Semantic states:
   Container-owned:
   Component-owned:
   Forbidden overrides:
   Forbidden compositions:
   Witnesses:
   ```

   Completion: every visible element and behavior has exactly one owner.
6. **Shape the contract.** Prefer semantic names and optional slots. Derive
   geometry from their presence. Add a variant prop only when two forms have
   the same content but genuinely different meaning. Completion: no screenshot
   label such as `small`, `big`, or `card` remains unless it is semantic.
7. **Compile a UI stack.** Accept product meaning, not visual knobs. Derive the
   component tree, actions, transitions, and omitted controls from the grammar.
   Completion: every derived decision names its rule and witness.
8. **Compose, do not copy.** One component renders every specimen; routes map
   their own data and effects into its contract. Completion: consumers add no
   internal styling escape hatch.
9. **Prove the matrix.** Render every meaningful slot/state combination and the
   complete consuming routes. Record the invariant values and the single
   expected delta for each comparison. Completion: whole-screen inspection and
   computed geometry agree with the receipt.

## Review

Reject a grammar when:

- two implementations represent one role;
- a boolean or size prop restates information already present in content;
- a consumer supplies internal classes;
- one prop changes unrelated visual dimensions;
- component specimens pass while a complete route is incoherent.

## Compiler

The portable command uses the owning React app's existing TypeScript compiler;
it adds no dependency:

```sh
node .agents/skills/ui-grammar/scripts/ui-grammar.mjs bootstrap <entry.tsx> \
  --package-json <owning/package.json> [--export <name|default>]
node .agents/skills/ui-grammar/scripts/ui-grammar.mjs validate <grammar.json>
node .agents/skills/ui-grammar/scripts/ui-grammar.mjs scan <grammar.json>
node .agents/skills/ui-grammar/scripts/ui-grammar.mjs stack <grammar.json> <request.json>
```

`bootstrap` follows statically reachable local function components and reports
unsupported or external boundaries as unknowns. `scan` validates configured
facts against named TSX sources. Neither can prove runtime branches, state
authority, effects, navigation, accessibility, visual geometry, or product
meaning. Put those claims in declared rules with the nearest test, trace, or
rendered witness.

Keep product contracts outside the skill and index them with the portable
registry runner when a repository has multiple flows:

```sh
node .agents/skills/ui-grammar/scripts/ui-grammar-registry.mjs \
  list <registry.json>
node .agents/skills/ui-grammar/scripts/ui-grammar-registry.mjs \
  inspect <registry.json> <flow-id-or-source-file>
node .agents/skills/ui-grammar/scripts/ui-grammar-registry.mjs \
  check <registry.json>
```

The repository supplies its root, entries, grammars, requests, and optional
rendered-evidence targets. Evidence targets are generic source-anchor and
command templates; the skill contains no application, route, capture, or task
runner defaults.

Use JSON for canonical machine inputs and Markdown for human receipts.

## References

- Read [references/mental-model.md](references/mental-model.md) when explaining
  the method or choosing between existing-product and greenfield directions.
- Read [references/contract.md](references/contract.md) when authoring a grammar
  or semantic request.
- Read [references/evidence-boundary.md](references/evidence-boundary.md) before
  claiming what a scan, witness, compiled stack, or rendered specimen proves.

For the generic row receipt, route-bootstrap fixture, and repository-registry
shape, read [EXAMPLES.md](EXAMPLES.md).
