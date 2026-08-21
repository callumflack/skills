# Understand UI Grammar

UI Grammar is a portable method for describing a precise React component vocabulary and the product-visible compositions it permits. Its lightweight System mode is the default: it records visual reference, component contracts, JSX tree, semantic props/slots, ownership, specimens, and honest evidence. Optional Flow mode describes consequential product states and actions.

Use it to understand an existing design system and product surface, or to define a new composition before implementation. UI Grammar and Code Stacks are independent lenses; neither is a required predecessor.

## The 30-second model

A design system supplies the vocabulary and owns how it is rendered. A System grammar turns a visual or design reference into a checked component vocabulary, legal composition, and specimen contract. The React implementation and rendered evidence then prove how faithfully that contract was realised.

Flow is an optional second mode. A semantic request describes one consequential product situation, and the Flow compiler returns the permitted UI stack with the rules that caused it. UI Grammar and Code Stacks remain independent lenses.

```text
visual/design reference
  -> System vocabulary + composition law
  -> React components + colocated specimens
  -> rendered evidence

optional product facts + guarded rules
  -> Flow UI stack
```

A System contract names components, semantic props, slots, ownership, allowed relations, forbidden relations, and specimens. Scanning is optional evidence for existing code. Optional `consumerPropChecks` are narrow policy probes, not vocabulary declarations.

A Flow request contains facts such as the job, state, capabilities, authority, and desired effect. It does not contain rendering knobs such as density, classes, styles, token choices, breakpoints, or icon dimensions. Generic domain names such as `size`, `color`, `width`, `height`, or `variant` remain valid when they carry independent product meaning rather than styling instructions.

The grammar may say that description presence causes a detailed row and that the row owns the resulting presentation. It may not say which utility class, CSS property, spacing token, breakpoint, or directory produces that presentation. Current mechanisms can appear in observations and witnesses. System-wide presentation or tooling policy belongs under `implementationConstraints` as a reference to its owner and is never compiled as a product cause.

## Four compatible views

These views make a UI discussable and traceable without forcing every grammar to contain all four. System uses Component and Evidence. Flow adds Product and Rule where consequential behavior needs an explicit contract.

| Graph | What it describes | Questions it answers |
| --- | --- | --- |
| Product | Jobs, states, actions, transitions, and effects | What is happening, what can happen next, and why? |
| Component | Design-system components, slots, and allowed relations | Which UI pieces form this surface? |
| Rule | Conditions and the relations they require or forbid | Why does this state produce this action or composition? |
| Evidence | Code, tests, traces, and rendered specimens | What supports each consequential claim? |

Every visible difference should have one named cause. Product state may select actions, content presence may derive internal geometry, the surface composition owner coordinates the tree, and components own their rendering.

## The lowest-level primitive

Each rule is a guarded relation between named terms:

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

This is enough to describe composition, state-dependent actions, transitions, effects, omissions, and forbidden overrides without encoding a screenshot.

## What a grammar can claim

UI Grammar keeps every claim in one of four truth classes:

- **Observed**: the scanner recovered an import, component, relation, prop, slot, condition, or source location
- **Declared**: a product-aware author stated a semantic rule and named its owner and witnesses
- **Derived**: the compiler applied declared rules to a request and produced a stack, action, transition, effect, or omission
- **Unknown**: the available source and evidence cannot establish the claim

The scanner provides automatic orientation, not automatic understanding. It can recover component structure, but it cannot infer why a product should behave that way.

An instruction to store or document a recovery changes its medium, not its truth class. Recovered topology stays non-authoritative evidence unless a product-aware owner selects a non-derivable law, names its owner and witness, and the law passes the persistence test.

## Use UI Grammar in either direction

Existing systems start with the visual result and implementation evidence, then recover only the durable composition law:

```text
visual result + React implementation
  -> observed component graph (optional)
  -> declared System vocabulary + composition
  -> specimens + rendered proof
```

Greenfield systems start with visual intent and work toward implementation:

```text
visual reference
  -> declared vocabulary, props, slots, and relations
  -> specimen contract
  -> React implementation
  -> rendered proof
```

Flow is separate and selective:

```text
consequential product state
  -> guarded actions, omissions, transitions, or effects
  -> compiled UI stack
  -> runtime and rendered proof
```

The directions are deliberately asymmetric. A scanner can observe code but cannot infer design intent. A System grammar can constrain implementation but cannot prove visual fidelity; that still needs rendered evidence. Use Flow only when code alone does not make a consequential product law clear.

## A product-neutral example

The checked-in System example starts from an Action Row reference and declares this vocabulary:

```text
ActionRow
  leading: Icon
  content: Label
  trailing: Button
```

The contract names each component's semantic props and slots, rejects undeclared children or slots, forbids a nested Button composition, links the declaration to a colocated specimen, and distinguishes that declaration from rendered proof. See [`examples/system-default/`](examples/system-default/).

If the same product also has a consequential access-review flow, an optional Flow request might contain facts such as pending state and incomplete approval authority. The compiler may then derive:

```text
Decision: Omit Approve until authority is complete
Actions: Deny | Verify identity
```

System constrains which component sentences are valid. Flow selectively constrains what the product situation permits. Neither requires Code Stacks.

## How an LLM uses the method

The method gives an agent a bounded sequence:

1. Choose System composition or optional Flow analysis from the unresolved question.
2. For System, inspect the visual/design reference and existing components; scan only when recovered topology helps orientation.
3. Name the smallest component vocabulary, semantic props/slots, ownership, and legal or forbidden relations that future work must preserve.
4. Add colocated specimens and validate the machine contract; prove visual fidelity with a complete rendered surface.
5. For Flow, declare only consequential state, action, omission, transition, or effect rules and attach their nearest witnesses.
6. Register cases and compile stacks only for executable Flow grammars.
7. For an unqualified request to describe an existing route, return a disposable route sentence: system vocabulary used, observed composition tree, route-owned inputs, candidate non-derivable laws, recovered topology, and unknowns.
8. End every Recover result with a persistence verdict: what qualifies for persistence, what an existing owner already records, what belongs in code/types/tests/specimens instead, and what should be discarded as regenerable topology. Carry that verdict through a later request to document the result.

The resulting conversation stays at product level. A person can ask to change a state, capability, action, or effect, and the grammar identifies the affected composition and evidence without opening arbitrary styling escape hatches.

## What belongs in the skill

The portable skill owns the method and its reusable machinery:

- System vocabulary, composition, specimen, and evidence validation
- React route bootstrapper and static scanner
- Optional Flow validator and UI-stack compiler
- Generic multi-flow registry runner
- Evidence-target interface
- Product-neutral examples and portability tests
- Documentation of evidence limits

The adopting repository owns all product truth:

- Visual/design references and the real design-system vocabulary
- Component props, slots, ownership, allowed relations, and specimens
- Route, component, and package paths
- System grammars, optional Flow grammars, and representative Flow requests
- State, authority, action, transition, and effect rules
- References to inherited implementation constraints owned by the design system or tooling doctrine
- Witness paths and anchors
- Rendered-evidence identifiers and commands
- Tests that assert consequential product decisions

A copied skill should run in another React repository without carrying application names, routes, commands, or semantic rules from its previous host.

## Run the portable tools

The bootstrapper uses the owning React package’s installed TypeScript compiler:

```sh
node .agents/skills/ui-grammar/scripts/ui-grammar.mjs bootstrap \
  path/to/entry.tsx \
  --package-json path/to/package.json \
  --export default
```

Once a product grammar exists, validate observations and witnesses, inspect the scan, or compile a request:

```sh
node .agents/skills/ui-grammar/scripts/ui-grammar.mjs validate grammar.json
node .agents/skills/ui-grammar/scripts/ui-grammar.mjs scan grammar.json
node .agents/skills/ui-grammar/scripts/ui-grammar.mjs stack \
  grammar.json request.json
```

Repositories with several flows can index them without changing the compiler:

```sh
node .agents/skills/ui-grammar/scripts/ui-grammar-registry.mjs \
  list ui-grammar/registry.json
node .agents/skills/ui-grammar/scripts/ui-grammar-registry.mjs \
  inspect ui-grammar/registry.json account.profile
node .agents/skills/ui-grammar/scripts/ui-grammar-registry.mjs \
  check ui-grammar/registry.json
```

Use JSON for canonical machine inputs. The tools emit JSON observations and Markdown receipts for human and LLM review.

## Evidence and limits

Static scanning accepts unique repository-contained TypeScript and TSX sources and can observe imports, JSX relations, props, slots, conditions, and source locations. CSS is witness material, not a scan source. Static evidence cannot prove runtime branches, state authority, effects, navigation, accessibility, responsive geometry, visual quality, or product meaning.

Witness-anchor validation proves that a configured file and anchor resolve. It does not execute the witness. When a registry case names rendered-evidence IDs, the target must opt into a no-shell argv adapter which returns a versioned JSON inventory; the registry checks those IDs against that inventory. The adapter is repository-owned, and the portable skill knows neither its tool nor its capture system. Runtime tests, traces, browser checks, and rendered specimens remain the appropriate evidence for claims that require them.

The compiler does not generate React. It produces a constrained, traceable stack that an agent or developer can implement and then verify.

Keep a grammar minimal: System encodes visual reference, vocabulary, composition, specimens, and evidence. Optional Flow encodes consequential product causes and guarded actions; only executable Flow requires an action matrix, stack template, and registry cases. Code Stacks remains an independent lens.

## Read the detailed references

Use the supporting documents when you need implementation detail:

- [`SKILL.md`](SKILL.md): agent procedure and completion criteria
- [`references/mental-model.md`](references/mental-model.md): conceptual model and both working directions
- [`references/contract.md`](references/contract.md): grammar and request contents
- [`references/evidence-boundary.md`](references/evidence-boundary.md): what each evidence class proves
- [`EXAMPLES.md`](EXAMPLES.md): generic row, bootstrap, and registry examples
