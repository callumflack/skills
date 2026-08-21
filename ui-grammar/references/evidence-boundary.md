# Evidence Boundary

UI Grammar separates evidence by what it can actually prove.

## Observed

The current static scanner can observe configured React/TSX source facts:

- imports from configured React sources;
- named render roots;
- JSX components and ancestry;
- literal and expression-shaped props;
- simple surrounding conditional expressions;
- configured slots;
- source files and line numbers;
- absence of configured forbidden props on selected module/component bindings only when those JSX elements contain no unresolved prop spread.

The route bootstrapper can additionally follow statically resolvable local function components through relative or TypeScript-configured imports. It emits explicit unknowns when traversal reaches external, unresolved, dynamic, or otherwise unsupported component boundaries.

These facts provide automatic orientation. They do not provide automatic understanding.

## Declared

Semantic intent belongs in guarded rules, not in scanner inference. A declared rule names its context, subject, modality, relation, object, reason, semantic owner, and witnesses.

Consequential rules require witnesses. Prefer the nearest evidence that can establish the claim:

- code for ownership and composition;
- focused tests for state, authority, actions, omissions, and transitions;
- runtime traces for effects and navigation;
- rendered specimens and complete routes for geometry, accessibility, and visual coherence.

The current validator proves only that configured witness files exist and contain their configured anchors. Anchor resolution is not execution of the witness and is not proof that its assertion passes.

A validator should reject a declared source relation when the scanner cannot observe it. That constrains a configuration; it does not prove the remaining declarations semantically correct by automation.

## Derived

A compiled stack is derived from a semantic request, matching action rules, declared rules, state presentation, and templates. Additive collection rules evaluate their declared `when` facts once per item; the compiler does not infer dependencies beyond each rule's explicit `dependsOn` list. Its tree, action labels, transitions, effects, and omissions are compiler decisions. They become product truth only after the owning implementation and appropriate witnesses agree.

## Unknown

Keep a claim unknown when the available evidence cannot establish it. Static scanning does not prove:

- runtime branches or state authority;
- effects, navigation, persistence, or network behavior;
- accessibility behavior;
- computed geometry, responsive behavior, or visual quality;
- semantic intent;
- route-level coherence outside configured sources.

Unknown is an honest result, not an invitation to infer a rule from visual similarity.

## Receipt Boundary

Grammar and request JSON are canonical machine-readable inputs. Keep product contracts outside the portable skill; a repository registry may index them and link them to optional rendered-evidence targets. `scan` emits observed JSON. `validate` and `stack` emit Markdown receipts for human review. The receipts must preserve the truth class of each claim and must not imply that an anchor check executed a test or that a static scan observed runtime behavior.

System validation closes the component, slot, relation, specimen, and evidence envelope. Optional Flow validation additionally keeps product vocabulary inside states, actions, and conditions open before compilation. Neither mode includes generated React. Bootstrap traversal remains a static approximation; its unknowns are part of the result, not errors to guess away.
