---
name: ui-grammar
description: "Turn a visual reference and design system into a precise React component vocabulary and witnessed UI grammar, with selective product-flow constraints when state or actions are consequential. Use for consistent, system-conforming UI and to avoid ad hoc visual execution; recover source topology on demand without treating scans as product truth."
---

# UI Grammar

A UI grammar is a small intermediate language between product intent and React. Keep every claim in one of four classes:

- **observed facts** recovered from source;
- **declared rules** that name intent and ownership;
- **derived results** compiled from a request and those rules;
- **unknowns** that the available evidence cannot establish.

Attach witnesses to consequential declared rules. The compiler may discover implementation, but it must not promote implementation into design intent by itself. Aim for automatic orientation, not automatic understanding.

## Modes

Choose the smallest mode that answers the request. Grammar is not required for every route.

- **System/default:** start from a visual reference and design system, name the React vocabulary and component family, describe the JSX tree, semantic props and slots, legal and forbidden compositions, ownership, specimens, and rendered proof. This is the primary mode for consistent visual outcomes.
- **Flow/selective:** encode only consequential product state, actions, omissions, transitions, and effects that are not already obvious from code. Keep the grammar focused on the decisions that constrain future work.
- **Recover/on-demand:** use `bootstrap` or `scan` to orient yourself in an existing source topology. For an unqualified request to describe an existing route without a new visual reference or unresolved product rule, return a disposable route sentence rather than authoring a route grammar. Recovered topology is evidence, not durable product truth; it does not require `calldiff` or another skill dependency.

### Persistence test

Check in a grammar only when it records durable, non-derivable, future-constraining law, has an owner and witness, and generates, validates, or rejects something useful. Otherwise prefer source types or props, colocated specimens or tests, a temporary conversation artifact, or regenerated bootstrap evidence. Code remains the master.

A follow-up request to “document this” changes the storage medium, not the truth class. It does not promote recovered topology into current doctrine. Carry the persistence verdict forward: update an existing owner with only the qualifying law, or, when writing the recovery itself was explicitly requested, label it as non-authoritative evidence rather than indexing it as a current grammar. `Persist` refers to grammar or declared law, not merely to a file: `Persist: none` may still retain explicitly requested recovery evidence. Record that separately as `Retain as requested evidence`, and reserve `Discard` for regenerable material that is not retained.

## Relationship

`ui-grammar` and `code-stacks` are independent lenses. UI Grammar constrains user-visible composition and meaning; Code Stacks maps intended code wiring. Either may be used alone. Use the lens that matches the unresolved question rather than treating them as a required sequence.

A product rule may name the semantic cause of a visual consequence and the component or container that owns it. It must not prescribe the rendering mechanism used to produce it. Tailwind utilities, CSS properties, classes, tokens, breakpoints, rendered dimensions, internal spacing, and filesystem placement belong to the owning design-system or tooling doctrine. A grammar may reference that doctrine under `implementationConstraints`; it must not copy it into semantic inputs or rules. Observations and witnesses may mention current mechanisms because they report implementation evidence.

Effect is optional and outside UI Grammar's core. Record an effect only when the product flow needs it; do not add an Effect dependency or doctrine.

For the human-facing explanation and progressive introduction, read [README.md](README.md).

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
- A consumer does not choose a visual size when slot presence already explains the size.
- Product meaning determines what is composed; the composition owner coordinates the surface, while each component owns its rendering.

TypeScript can make some composition laws executable: discriminated unions and runtime tables declared with `as const` and `satisfies` can be exhaustive and can drive fixtures or tests. TypeScript cannot prove runtime effects, navigation, accessibility, or visual geometry; keep those claims in runtime or rendered evidence.

## Workflow

1. **Start shared.** Capture the pressure: mark what must remain the same versus what may change. Find the live semantic and presentation owners before naming rules. Completion: every comparison has an invariant and delta, and each decision has a current owner.

2. **System/default path.** Inventory the visual reference and design system, then name the React vocabulary, component tree, semantic contracts, legal and forbidden compositions, and ownership. Build colocated specimens and prove the full rendered surface. Bootstrap, scan, and the flow compiler are optional evidence, not prerequisites.

3. **Flow/selective path.** Write and validate only consequential semantic rules. Compile actions, transitions, or omissions only when they are the unresolved question. Prove each result with its nearest runtime, test, trace, or rendered witness; do not require a route grammar or exhaustive action matrix when no such law is being recorded.

4. **Recover/on-demand path.** Use `bootstrap` or `scan` to orient yourself in source topology and record unknowns without semantic promotion. For `describe <existing route>`, name the system vocabulary the route uses, its observed composition tree, route-owned product inputs, candidate non-derivable laws, disposable topology, and unknowns. Do not title observed relationships “Derived rules”; derived results exist only when declared rules are compiled against a request. Stop after disposable orientation unless a non-derivable, future-constraining law passes the persistence test.

End every Recover result with this decision, including after a later request to document it:

```text
Persistence verdict:
  Persist as grammar/law: <only qualifying non-derivable laws, or none>
  Retain as requested evidence: <non-authoritative recovery path, or none>
  Already owned by: <existing system, types, tests, specimens, or docs>
  Encode instead in: <nearest code/type/test/specimen owner, when applicable>
  Discard: <regenerable topology and observations not retained>
```

When a durable grammar is warranted, write the receipt in this shape:

```text
Grammar:
Owner:
Tree:
Product inputs:
Optional slots:
Declared rules:
Semantic states:
Container-owned:
Component-owned:
Forbidden overrides:
Forbidden compositions:
Inherited system constraints: <references only>
Witnesses:
```

Completion: every visible element and behavior has exactly one owner, and system policy is referenced rather than restated.

Shape contracts around semantic names and optional slots; derive geometry from their presence. Add a variant only when it carries independent product meaning. Keep one component responsible for its specimens and let consumers map product data into its contract without styling escape hatches.

## Review

Reject a grammar when:

- two implementations represent one role;
- a boolean or size prop restates information already present in content;
- an unexplained consumer override is treated as product truth rather than a review signal;
- a semantic state, request, or `when` condition names a class, token, breakpoint, density, dimension, or internal-geometry mechanism;
- a semantic rule copies design-system, styling, directory-placement, or instrumentation doctrine instead of referencing its owner under `implementationConstraints`;
- a narrow consumer-prop check is presented as a complete design-system inventory;
- an action or transition matrix cites an implementation constraint as a semantic cause;
- a recovery receipt promotes observed topology into declared or derived law, or becomes current doctrine merely because it was written to disk;
- one prop changes unrelated visual dimensions;
- component specimens pass while a complete route is incoherent.

Keep a version 2 grammar smaller than the implementation it explains. Name only consequential product causes, ownership, declared dependencies, and evidence. Use `reviewProps` for mechanisms such as `className` that deserve inspection but can be legitimate; reserve `forbiddenProps` for true repository invariants whose direct occurrence or possible presence through a JSX spread must fail validation. Use additive `forEach` rules when each item in a product collection independently contributes an action; do not enumerate debugger scenario combinations.

## Compiler

The System grammar declares the deliberately small component vocabulary that its composition law constrains; it is not a second inventory of the whole design system. When scanning is useful, the scanner observes imports from configured sources and compares implementation evidence with that declared contract. Optional `consumerPropChecks` target selected module/component bindings only.

The portable command uses the owning React app's existing TypeScript compiler; it adds no dependency:

```sh
node .agents/skills/ui-grammar/scripts/ui-grammar.mjs bootstrap <entry.tsx> \
  --package-json <owning/package.json> [--export <name|default>]
node .agents/skills/ui-grammar/scripts/ui-grammar.mjs validate <grammar.json>
node .agents/skills/ui-grammar/scripts/ui-grammar.mjs scan <grammar.json>
node .agents/skills/ui-grammar/scripts/ui-grammar.mjs stack <grammar.json> <request.json>
```

`bootstrap` follows statically reachable local function components and reports unsupported or external boundaries as unknowns. `scan.sources` accepts unique, existing, repository-contained `.ts` and `.tsx` files only. CSS and other rendering artifacts may be witnesses, but never scanner inputs. Neither command can prove runtime branches, state authority, effects, navigation, accessibility, visual geometry, or product meaning. Put semantic claims in declared rules with the nearest test, trace, or rendered witness; keep rendering policy with its system owner.

Use JSON for canonical machine inputs and Markdown for human receipts.

## References

- Read [references/mental-model.md](references/mental-model.md) when explaining the method or choosing between existing-product and greenfield directions.
- Read [references/contract.md](references/contract.md) when authoring a grammar or semantic request.
- Read [references/evidence-boundary.md](references/evidence-boundary.md) before claiming what a scan, witness, compiled stack, or rendered specimen proves.

For the generic row receipt, route-bootstrap fixture, and complete existing-route example, read [EXAMPLES.md](EXAMPLES.md).
