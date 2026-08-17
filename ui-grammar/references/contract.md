# Grammar Contract

The contract sits between product intent and React composition. It accepts
meaning and returns a proof-carrying UI stack.

## Inputs

A product request should contain semantic facts only:

- the target surface and user job;
- subject and content identity;
- semantic state;
- capabilities, readiness, authority, or environment when they affect behavior;
- collections whose names preserve product meaning;
- requested effects or return destination when relevant.

Exclude visual knobs such as component size, density, icon dimensions, internal
classes, token choices, or screenshot-shaped variant names. If slot presence or
semantic state already explains a visual consequence, derive it in the grammar.

## Grammar Contents

A useful grammar names:

- the surface id, intent, render root, implementation owner, and semantic owner;
- the React sources and vocabulary used for observation;
- observed relations and required slots;
- declared guarded rules with modality, reason, owner, and witnesses;
- semantic states and actions;
- an action or transition matrix;
- a stack template and forbidden consumer overrides.

Each visible element, action, omission, transition, and effect must have one
owner. Each visible delta must resolve to one named cause. Consequential rules
must carry witnesses near the owning behavior.

The current executable format stores these concerns together in one grammar
JSON object and a separate request JSON object. Product contracts belong in the
adopting repository, not inside the portable skill. The format does not yet
expose independent formal schemas for observed facts, declarations, requests,
or results. Do not claim schema-level validation beyond the checks implemented
by the compiler.

## Output

JSON is the canonical machine-readable artifact for grammars and requests. The
static `scan` command also emits JSON. Validation and compiled stacks are
rendered as Markdown human receipts so reviewers can inspect:

- the product job and semantic state;
- the derived decision, actions, transitions, effects, and omissions;
- the component tree;
- the declared rules applied;
- whether observed facts and witness anchors resolved.

The Markdown is a receipt of the canonical inputs and compiler result, not a
second source of truth.

## Current Boundary

The compiler can bootstrap a static component graph from a route entry, scan
named functions in configured TSX sources, validate a limited set of observed
facts and witness anchors, select the first matching action rule, and
interpolate a stack template. A repository registry may index multiple product
grammars and link them to optional rendered-evidence targets without placing
those product bindings in the skill.

Bootstrap output is orientation evidence, not a semantic grammar. A successful
configuration does not prove runtime behavior, rendered truth, accessibility,
geometry, or automatic semantic understanding. The compiler does not generate
React.
