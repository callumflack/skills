# Mental Model

A design system is a vocabulary. A UI grammar describes the valid sentences that product meaning may form with that vocabulary.

The vocabulary names a deliberately small set of React components, semantic props, owned slots, and interaction roles. A System grammar records only the subset whose composition law must constrain future work; it does not inventory the whole design system. An optional scan observes which imports and relations the surface currently uses. The grammar names which components may be composed, who owns each decision, and what evidence supports the contract. Optional Flow rules add product facts that select consequential actions or compositions. Neither mode prescribes the Tailwind, CSS, token, breakpoint, dimension, or internal-geometry mechanism an owner uses. A component appearing in source proves that the word exists; it does not prove what the sentence means.

## Orientation Is Not Understanding

A static React scan can orient an agent automatically. It can locate imports, JSX ancestry, literal props, slots, conditions, and source positions. That is a map of implementation, not automatic understanding of product intent.

Keep every claim in one of four truth classes:

- **Observed:** directly recovered from source, such as an import, JSX relation, prop, slot, condition, or file location.
- **Declared:** a semantic rule asserted by the product grammar, with a named owner and witness.
- **Derived:** a tree, action, transition, omission, or presentation decision produced by applying declared rules to a semantic request.
- **Unknown:** anything the available source and witnesses do not establish.

Never silently promote an observed fact into a declared rule. Never present a derived result as observed runtime truth. Preserve unknowns instead of filling them with plausible design language. Asking to store or document a recovery changes its medium, not its truth class; persistence requires a separate product-aware decision.

Implementation constraints sit beside, not inside, the semantic rule graph. Reference the owning design-system or tooling doctrine under `implementationConstraints`; do not reproduce it. Observations and witnesses may record concrete rendering mechanisms because they are evidence. The compiler excludes implementation constraints from semantic action and transition derivation.

## Two Directions

### Existing system: implementation to durable composition law

1. Inspect the visual result, reference, and owning React components.
2. Scan the surface only when recovered topology helps orientation.
3. Declare the smallest component vocabulary, semantic props and slots, ownership, and legal or forbidden relations that future work must preserve.
4. Add colocated specimens and distinguish declared or implemented status from rendered proof.
5. Compare the contract with the complete rendered surface. Add Flow rules only for consequential behavior that code does not already explain.

The scan accelerates orientation. It is disposable and cannot name design intent or promote current topology into durable law. An unqualified route description should therefore end in a persistence verdict rather than becoming a new current route grammar by default.

### Greenfield system: reference to implementation

1. Start from the visual/design reference and name the intended component family.
2. Declare semantic props, owned slots, valid relations, forbidden compositions, and specimens expected before acceptance.
3. Validate the System contract.
4. Implement it with the target React vocabulary.
5. Collect rendered evidence and reconcile the implementation with the declared grammar.

Flow remains an independent optional extension for consequential state, actions, omissions, transitions, and effects. The current bootstrapper can map statically reachable local function components, but it does not generate implementation code or supply missing product meaning. Portability means a new surface can be configured without changing the validator and unsupported observations are rejected rather than guessed into the grammar.

## Named Causes

Every visible delta has one named cause.

- Content presence may derive internal geometry.
- Semantic state may select presentation and actions.
- Environment or capability may select an allowed transition.
- Containers own placement; components own their internal geometry.
- A grammar names the cause and owner; the owner chooses the rendering mechanism.

If two screens differ, the grammar must name the product fact or semantic rule that causes the difference. Visual labels such as `small`, `big`, `compact`, or `card` are not causes unless the product gives them independent meaning.

Use this admissibility test for a proposed semantic rule:

1. What product fact, state, role, action, omission, or composition does it constrain?
2. Which `render` or `step` result can it change?
3. Would it remain true if the styling framework, token names, CSS files, or directory layout changed?

If the first two have no answer, or the third answer is no, the proposal is implementation policy rather than product grammar.
