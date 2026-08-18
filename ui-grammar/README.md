# Understand UI Grammar

UI Grammar is a portable method for describing why a product state produces a particular React composition. It gives developers and large language models (LLMs) a shared language for discussing user interface (UI) flows through product meaning, actions, transitions, components, constraints, and evidence.

Use it to understand an existing design system and product surface, or to define a new flow before implementation. The method keeps product intent connected to code without pretending that static analysis can recover intent automatically.

## The 30-second model

A design system supplies the vocabulary. A UI grammar defines the valid sentences. A semantic request describes one product situation, and the compiler returns the permitted UI stack with the rules that caused it.

```text
design-system vocabulary
  + product facts
  + guarded rules
  + evidence
  -> UI stack
```

A request contains facts such as the job, state, capabilities, authority, and desired effect. It does not contain visual knobs such as density, size, classes, token choices, or icon dimensions.

## The four connected graphs

Four views make a UI flow discussable and traceable. They are views of one contract, not four separate systems.

| Graph | What it describes | Questions it answers |
| --- | --- | --- |
| Product | Jobs, states, actions, transitions, and effects | What is happening, what can happen next, and why? |
| Component | Design-system components, slots, and allowed relations | Which UI pieces form this surface? |
| Rule | Conditions and the relations they require or forbid | Why does this state produce this action or composition? |
| Evidence | Code, tests, traces, and rendered specimens | What supports each consequential claim? |

Every visible difference should have one named cause. Product state may select actions, content presence may derive internal geometry, containers own placement, and components own their internal geometry.

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

## Use UI Grammar in either direction

Existing products start with implementation evidence and work back toward intent:

```text
React surface
  -> observed component graph
  -> declared product grammar
  -> compiled requests
  -> reviewed contract
```

Greenfield products start with intent and work toward implementation:

```text
product job and state
  -> declared grammar
  -> permitted component stack
  -> React implementation
  -> observed and rendered proof
```

The directions are deliberately asymmetric. A scanner can observe code, but a human or product-aware agent must declare its meaning. A greenfield grammar can constrain an implementation, but the implementation still needs runtime and rendered proof.

## A product-neutral example

Suppose a person asks an LLM to design an access-review flow:

```text
Create an access review for Project Atlas.
The request is pending.
Approval authority is incomplete because identity verification is missing.
Identity verification can be completed on the Web.
```

The semantic request contains those facts, not instructions such as “use a compact card” or “make the button secondary.” The grammar may derive this receipt:

```text
Decision: Omit Approve until authority is complete
Actions: Deny | Verify identity
Visual overrides: none

PageShell
  PageHeader
  AccessRequestPanel
    DetailsCard
      Identity
      Requested access
      Current state
      ActionGroup: Deny | Verify identity

Applied rules:
  complete-authority-enables-approval
  missing-identity-routes-to-verification
```

The target design system determines the available component names. The product grammar determines whether those components and actions form a valid sentence for the request.

## How an LLM uses the method

The method gives an agent a bounded sequence:

1. Scan a route or UI block for observable React structure.
2. Report unsupported boundaries as unknowns.
3. Identify the implementation owner and semantic owner.
4. Declare the smallest rules that explain states, actions, omissions, and allowed composition.
5. Attach witnesses to consequential rules.
6. Compile semantic requests into UI stacks.
7. Compare the compiled result with focused tests, runtime traces, and complete rendered surfaces.

The resulting conversation stays at product level. A person can ask to change a state, capability, action, or effect, and the grammar identifies the affected composition and evidence without opening arbitrary styling escape hatches.

## What belongs in the skill

The portable skill owns the method and its reusable machinery:

- React route bootstrapper and static scanner
- Grammar validator and UI-stack compiler
- Generic multi-flow registry runner
- Evidence-target interface
- Product-neutral examples and portability tests
- Documentation of evidence limits

The adopting repository owns all product truth:

- Route, component, and package paths
- Product grammars and representative requests
- State, authority, action, transition, and effect rules
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

Static scanning can observe imports, JSX relations, props, slots, conditions, and source locations. It cannot prove runtime branches, state authority, effects, navigation, accessibility, responsive geometry, visual quality, or product meaning.

Witness-anchor validation proves that a configured file and anchor resolve. It does not execute the witness. When a registry case names rendered-evidence IDs, the target must opt into a no-shell argv adapter which returns a versioned JSON inventory; the registry checks those IDs against that inventory. The adapter is repository-owned, and the portable skill knows neither its tool nor its capture system. Runtime tests, traces, browser checks, and rendered specimens remain the appropriate evidence for claims that require them.

The compiler does not generate React. It produces a constrained, traceable stack that an agent or developer can implement and then verify.

## Read the detailed references

Use the supporting documents when you need implementation detail:

- [`SKILL.md`](SKILL.md): agent procedure and completion criteria
- [`references/mental-model.md`](references/mental-model.md): conceptual model and both working directions
- [`references/contract.md`](references/contract.md): grammar and request contents
- [`references/evidence-boundary.md`](references/evidence-boundary.md): what each evidence class proves
- [`EXAMPLES.md`](EXAMPLES.md): generic row, bootstrap, and registry examples
