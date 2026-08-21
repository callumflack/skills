# Grammar Contract

The contract sits between visual/design reference and React composition. System mode is the small core; Flow mode is an optional extension for consequential product behavior.

## System mode

A System grammar declares `visualReference`, a `vocabulary.components` list (each component may declare semantic `props`, named `slots`, and `owner`), a `composition` tree with legal and forbidden relations, and `specimens` plus `evidence`. Scan and flow fields are optional. `status: declared` records intent; an implemented claim must resolve its evidence target and specimen path in the repository. This is implementation/specimen evidence, not automatic rendered visual proof.

## System core

A System grammar requires:

- `mode: "system"` and a repository-contained `visualReference` (or an explicitly external HTTP reference);
- a `surface` id, render root, and composition owner;
- a structured `vocabulary.components` collection naming each component's owner, semantic props, and slots;
- a `composition` root plus legal and forbidden parent-slot-child relations;
- uniquely identified `specimens` with `declared` or `implemented` status;
- an `evidence` target that resolves to one specimen.

An `implemented` specimen must resolve to an existing repository-contained path. `declared` and `implemented` are lifecycle states, not rendered-proof claims. Runtime behavior, accessibility, geometry, and visual fidelity require their own evidence.

`scan`, implementation constraints, and consumer prop checks are optional. System never requires states, actions, an action matrix, a stack template, or semantic requests.

## Optional Flow request inputs

A product request should contain semantic facts only:

- the target surface and user job;
- subject and content identity;
- semantic state;
- capabilities, readiness, authority, or environment when they affect behavior;
- collections whose names preserve product meaning;
- requested effects or return destination when relevant.

Exclude rendering knobs such as density, icon dimensions, internal classes, styles, token choices, breakpoints, or screenshot-shaped variant values. If slot presence or semantic state already explains a visual consequence, derive it in the grammar. Generic keys such as `size`, `color`, `width`, `height`, and `variant` remain available when the product domain gives them independent meaning.

Use semantic domain vocabulary freely: product-specific capabilities, authority, content roles, return destinations, omissions, and visual ownership are valid inputs when they carry product meaning. The validator rejects exact rendering-mechanism keys at state, request, and action-condition boundaries; it does not guess from prose or ban domain words by substring.

## Optional Flow extension

A Flow grammar may additionally name:

- the surface id, intent, render root, implementation owner, semantic owner, and composition owner;
- the React sources and relations used for observation;
- observed relations and required slots;
- declared guarded rules with modality, reason, owner, and witnesses;
- semantic states and actions;
- an action or transition matrix;
- a stack template and forbidden consumer overrides.

The optional top-level `implementationConstraints` collection holds references to design-system, styling, or tooling policy. Each entry should name an id, its system owner, and a source reference. Do not copy the policy text into the grammar. These constraints may guide implementation and review, but action and transition matrices cannot cite their ids and the compiler never returns them as applied semantic rules.

```json
{
  "implementationConstraints": [
    {
      "id": "system-presentation-policy",
      "owner": "design-system",
      "reference": "docs/design-system.md"
    }
  ]
}
```

The optional `consumerPropChecks` collection defines narrow static checks against selected imported bindings:

```json
{
  "consumerPropChecks": [
    {
      "module": "@/components/ui-presentation/field",
      "components": ["Field", "FieldLabel", "FieldError"],
      "reviewProps": ["className"],
      "forbiddenProps": ["style"]
    }
  ]
}
```

Each entry is partial, not a design-system vocabulary inventory. The scanner observes actual imports. Checks match both the configured module and its local JSX binding, so a same-named component imported from another module is outside the check. Omitting both prop lists creates an observation-only binding check; this also preserves version 1 `designSystem` vocabularies that never declared `forbiddenConsumerProps`.

`reviewProps` emits nonblocking diagnostics with root and source location. Use it for mechanisms that need an ownership explanation but may be legitimate. `forbiddenProps` fails validation and is only for true invariants. A prop cannot be listed in both. A JSX spread on a checked consumer makes prop absence unprovable: it fails each hard forbidden-prop check and warns for each review-level prop.

Grammar version 2 is canonical. It requires `surface.compositionOwner`; semantic `rule.owner` is unchanged. Version 1 inputs are normalized with warnings: `surface.visualOwner` or `surface.renderRoot` supplies missing composition ownership, the old `designSystem` consumer-check shape is translated when populated, and first-match action behavior is retained.

Version 2 action rules require a non-empty `dependsOn` list. Every listed fact must be an exact key in that rule's `when` object. This validates declared dependencies only; it does not infer dependencies from decision prose or interpolation. Version 1 keeps legacy action rules compatible and reports missing declared guards as review warnings only when `dependsOn` is present.

Action rules use first-match resolution by default. Set `actionResolution` to `additive` when independent facts contribute independent actions or effects. All matching rules merge in rule declaration order; actions, rule ids, effects, and decisions are deduplicated by first occurrence, and multiple distinct transitions are an explicit compile error.

An additive rule may set `forEach` to a request collection path and guard against `item.*` facts:

```json
{
  "forEach": "sources",
  "when": { "item.status": "attention" },
  "dependsOn": ["item.status"],
  "actions": ["reconnect"],
  "decision": "{{item.label}} needs attention.",
  "effects": ["reconnect {{item.id}}"],
  "ruleIds": ["attention-source-can-reconnect"]
}
```

Collections evaluate in request order within each rule. Action labels interpolate against each matching item, so distinct source actions remain distinct; identical labels, effects, decisions, and rule ids deduplicate first-seen. `forEach` with first-match resolution is invalid because silently selecting one item would be unsafe.

System grammars never compile requests. Flow grammars opt into executable action/stack fields; observational Flow grammars may set `executable: false`.

Each visible element, action, omission, transition, and effect must have one owner. Each visible delta must resolve to one named cause. Consequential rules must carry witnesses near the owning behavior.

The current format stores these concerns together in one grammar JSON object and separate request JSON objects. Product contracts belong in the adopting repository, not inside the portable skill. The validator closes the structural records named above: unknown top-level, surface, scanner, consumer-prop-check, relation, semantic-rule, witness, action-rule, and implementation-constraint keys fail. Product vocabulary inside `states`, `actions`, and action `when` values remains open. Keep the contract smaller than the implementation: encode consequential causes and evidence, not a duplicate branch-by-branch rendering model. The format does not expose separate generated schemas for observed facts, declarations, requests, or results; do not claim validation beyond the checks implemented by the compiler.

## Output

JSON is the canonical machine-readable artifact for grammars and requests. The static `scan` command also emits JSON. Validation and compiled stacks are rendered as Markdown human receipts so reviewers can inspect:

- the product job and semantic state;
- the derived decision, actions, transitions, effects, and omissions;
- the component tree;
- the declared rules applied;
- whether observed facts and witness anchors resolved.

The Markdown is a receipt of the canonical inputs and compiler result, not a second source of truth.

## Current Boundary

The compiler can bootstrap a static component graph from a route entry, scan named functions in configured TypeScript and TSX sources, validate a limited set of observed facts and witness anchors, resolve first-match or additive semantic action rules, and interpolate a stack template. Scan nodes retain their configured render root, observed relations may be root-scoped, and scan output offers root-scoped relation candidates for review. `scan.sources` must be unique, existing, repository-contained `.ts` or `.tsx` files. CSS and other presentation artifacts are witness-only.

Bootstrap output is orientation evidence, not a semantic grammar. A successful configuration does not prove runtime behavior, rendered truth, accessibility, geometry, or automatic semantic understanding. The compiler does not generate React.
