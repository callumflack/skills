# Refactor Candidates

Use this when deciding whether a React feature needs reshaping and how to present the options.

## Candidate Output

Use the candidate output contract in `../SKILL.md`. Do not propose final interfaces yet if the model shape is still unclear. First ask which candidate to explore.

## Smells

Route/runtime mixing:

- route params, auth, redirects, session branching, and runtime UI state live in the same component
- leaf views know about route mechanics

Prop soup:

- the same bag of props is threaded through several layers
- most props are only valid for one runtime variant
- callbacks are passed to views that cannot legally call them

Boolean variants:

- `isEditing`, `isEmbedded`, `isSuccess`, `showHeader`, `isCompact`, or similar booleans multiply possible states
- branch logic is spread across parent, layout, and leaves

Effect-driven derived state:

- an effect mirrors data into another state variable just so render can read it
- status labels, completion state, or visible view kind can be derived at render time

Hidden side effects:

- one hook bootstraps, polls, notifies host, resizes embeds, and completes flows
- cleanup or subscription logic is coupled to presentation

Dynamic form sprawl:

- normalization, validation, field rendering, and submit orchestration live together
- field components know raw schema details they should not own

Shallow extraction:

- a helper only moves lines out of a component but keeps the same caller knowledge
- a service or selector exists only to make tests easy, while the real bugs are in call ordering

## Deepening Checks

Use the deletion test:

- If deleting the extraction just moves equal complexity back into callers, it is shallow.
- If deleting it would spread model derivation, validation, or side-effect ordering across many views, it earns its keep.

Good React feature extractions concentrate:

- route decisions in Route Controllers
- renderable state in Presentation Models
- domain transforms in Services
- read-model queries in Selectors
- host synchronization in Effect Hooks
- rendering in Runtime Views

Avoid seams with only one reason to exist. One caller plus no test or runtime variation is usually just indirection.

## Recommendation Bias

Use the recommendation ladder in `../SKILL.md`. This reference supplies the smell details and deepening checks; the entry point owns prioritization.
