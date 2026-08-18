# Mental Model

A design system is a vocabulary. A UI grammar describes the valid sentences that product meaning may form with that vocabulary.

The vocabulary names available components, tokens, and interaction primitives. The grammar names which components may be composed, which product facts select a composition, who owns each decision, and what evidence supports consequential rules. A component appearing in source proves that the word exists; it does not prove what the sentence means.

## Orientation Is Not Understanding

A static React scan can orient an agent automatically. It can locate imports, JSX ancestry, literal props, slots, conditions, and source positions. That is a map of implementation, not automatic understanding of product intent.

Keep every claim in one of four truth classes:

- **Observed:** directly recovered from source, such as an import, JSX relation, prop, slot, condition, or file location.
- **Declared:** a semantic rule asserted by the product grammar, with a named owner and witness.
- **Derived:** a tree, action, transition, omission, or presentation decision produced by applying declared rules to a semantic request.
- **Unknown:** anything the available source and witnesses do not establish.

Never silently promote an observed fact into a declared rule. Never present a derived result as observed runtime truth. Preserve unknowns instead of filling them with plausible design language.

## Two Directions

### Existing product: implementation to intent

1. Scan the owning React surface for observed facts.
2. Identify the implementation owner and semantic owner.
3. Declare the smallest rules that explain the existing composition.
4. Attach witnesses for rules that affect authority, behavior, state, or user consequence.
5. Compile semantic product requests and compare the result with the complete consuming surface.

The scan accelerates orientation. A human or product-aware agent still has to name intent and resolve uncertainty.

### Greenfield: intent to implementation

1. State the product job, semantic state, content, capabilities, and effects.
2. Declare valid relations, ownership, forbidden compositions, and witnesses expected before acceptance.
3. Compile a component stack from that meaning.
4. Implement the stack with the target React vocabulary.
5. Collect observed facts and runtime evidence, then reconcile them with the declared grammar.

Greenfield use is a direction for the method. The current bootstrapper can map statically reachable local function components, but it does not generate implementation code or supply the missing product meaning. Portability means a new surface can be configured without changing the compiler and unsupported observations are rejected rather than guessed into the grammar.

## Named Causes

Every visible delta has one named cause.

- Content presence may derive internal geometry.
- Semantic state may select presentation and actions.
- Environment or capability may select an allowed transition.
- Containers own placement; components own their internal geometry.

If two screens differ, the grammar must name the product fact or semantic rule that causes the difference. Visual labels such as `small`, `big`, `compact`, or `card` are not causes unless the product gives them independent meaning.
