# Validation

Validate behavior through the public feature seam. Do not lock tests to the internal refactor shape.

## Required Checks

Run the narrowest useful checks for touched files:

- formatter on touched UI/docs files
- lint on touched files when available
- typecheck when model types, route boundaries, or call sites changed
- focused tests when behavior changed or a stable seam exists
- `vercel-react-best-practices` review pass
- `vercel-composition-patterns` review pass

If a hook or formatter rewrites files, inspect the post-hook diff before finishing.

## Good Test Seams

Prefer seams that users or callers actually cross:

- route-level behavior for route gating, redirects, params, or search state
- controller output for model derivation when the controller has stable inputs
- service output for domain transforms
- selector output for read-model queries
- rendered behavior for runtime views
- integration/e2e flow for user-visible multi-step behavior

## Bad Test Seams

Avoid tests that:

- assert that an internal helper was called
- mock internal collaborators the feature owns
- snapshot a prop bag just because it exists
- test private hook ordering instead of observable behavior
- verify behavior by reading implementation-only state

If no correct seam exists, say that explicitly. The missing seam is an architecture finding.

## Behavior-First Assertions

Good assertions:

- the route chooses the correct feature state for the URL/session
- the controller derives the expected `{ layout, view }`
- a Service transforms raw inputs into the expected domain shape
- a Selector returns the expected read model from state
- a Runtime View renders the correct controls and legal actions for its `view.kind`
- an Effect Hook performs one external synchronization concern

Bad assertions:

- `useFeatureController` calls `selectFoo` once
- `FeatureView` receives every prop in a snapshot
- internal status state changes before render reads it
- a private helper is called with an exact object reference

## Done Checklist

- Route gating is separate from runtime views.
- File names match ownership.
- Layout concerns are separate from view concerns.
- View variants are explicit and typed.
- Services, Selectors, and Pure Helpers are outside React.
- Side effects are narrow and named.
- Behavior is checked through the public seam or the missing seam is documented.
- The final tree can be explained in one small diagram.
