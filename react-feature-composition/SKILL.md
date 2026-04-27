---
name: react-feature-composition
description: Guide React or Next.js feature composition before implementation and during reshaping. Use when designing feature structure, route/runtime boundaries, controller hooks, presentation models, layout/view ownership, typed view variants, focused effects, or large UI surfaces with prop soup and hidden dependencies.
---
# React Feature Composition

Design the feature toward idiomatic React first. When refactoring, do not let the incumbent mess define the target shape.

## Read First

Read the language contract and both references before planning the refactor:

- `LANGUAGE.md`
- `references/ui-react-best-practices.md`
- `references/ui-composition-patterns.md`

These are mandatory. `LANGUAGE.md` defines the ownership vocabulary. The references define the React doctrine.

## Use Related Skills

If these skills are available in the environment, invoke them early:

- `vercel-react-best-practices`
- `vercel-composition-patterns`

Invoke when relevant:

- `nextjs` for App Router, route/controller boundaries, rendering, metadata, and data flow
- `ui-text` for semantic text, copy, typography, and token hygiene
- `web-design-guidelines` for a UI review pass

If they are not already installed locally, look them up on `skills.sh` first instead of guessing package names.

Published skill pages:

- `vercel-react-best-practices`: `https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices`
- `vercel-composition-patterns`: `https://skills.sh/vercel-labs/agent-skills/vercel-composition-patterns`
- `nextjs`: `https://skills.sh/teachingai/full-stack-skills/nextjs`
- `web-design-guidelines`: `https://skills.sh/ehmo/platform-design-skills/web-design-guidelines`

To avoid manual lookup tedium, prefer a finder flow when possible:

- use the `find-skills` skill if it is installed
- or run `npx skills find <query>`

Useful searches:

- `npx skills find react performance`
- `npx skills find react composition`
- `npx skills find nextjs`
- `npx skills find web design guidelines`

## Core Principles

- Prefer explicit ownership over convenience.
- Controllers derive models. Views render models.
- Prefer composition over boolean prop growth.
- Prefer render-time derivation over syncing derived state in effects.
- Prefer discriminated unions over optional props that only make sense for one variant.
- Prefer narrow side-effect hooks over one mega-hook or mega-component.
- Prefer file and folder names that reveal ownership at a glance.
- Use the container/presentational split as ancestry, not naming doctrine.
- Preserve behavior unless the task explicitly includes UX change.

## Target Shape

When a feature has route gating, host chrome, and multiple runtime views, prefer:

1. Route Entry
2. Route Controller
3. Feature Entry
4. Controller hook
5. Presentation Model
6. Layout View
7. View Switch
8. Runtime Views
9. Pure Helpers in `lib/`
10. Effect Hooks in `hooks/`

Prefer a shape like:

```text
feature/
  page.tsx
  controller.tsx
  feature.tsx
  feature/
    feature-layout.tsx
    feature-view.tsx
    types.ts
    hooks/
      use-feature-controller.ts
      use-embed-presentation.ts
      use-completion.ts
    lib/
      density.ts
      completion.ts
    views/
      intro-view.tsx
      input-view.tsx
      success-view.tsx
```

## Ownership Rules

Use names that encode ownership. Use `LANGUAGE.md` terms when explaining moves.

- `page.tsx`: Route Entry only
- `controller.tsx`: Route Controller only
- `feature.tsx`: Feature Entry only
- `use-*-controller.ts`: Controller and Presentation Model derivation
- `types.ts` or `*-model.ts`: Model types and pure model shape
- `*-layout.tsx`: Layout View
- `*-view.tsx`: View Switch only
- `views/*`: Runtime Views
- `lib/*`: Pure Helpers
- `hooks/*`: Effect Hooks and focused subscriptions

If a file name hides ownership, rename it.

## Refactor Workflow

1. Identify the real seams.
   - route-owned entry state
   - runtime interactive state
   - host/layout presentation
   - pure derivation
   - side effects
   - field normalization and validation

2. Find the dominant smell.
   - prop bag threaded through many layers
   - component doing route gate, orchestration, layout, and rendering
   - boolean variant explosion
   - effect used to mirror derived state
   - view-specific props exposed everywhere
   - dynamic form logic mixed with field rendering

3. Extract the behavioral core.
   - Move orchestration into one controller hook.
   - Keep it responsible for deriving a stable presentation model.
   - Keep runtime views presentational.

4. Replace prop soup with models.
   - Build a presentation model, usually `{ layout, view }`.
   - Build a `layout` model for shell concerns.
   - Build a discriminated `view` model for runtime variants.
   - Expose only the data and actions each view kind actually needs.

5. Split effects by concern.
   - bootstrap
   - completion
   - host notifications
   - embed sizing and presentation
   - polling or subscription

6. Move pure logic out of render components.
   - state derivation
   - normalization
   - validation
   - density and layout calculations
   - completion helpers

7. Rename and move files to match the final ownership model.

## Preferred Patterns

### Controller

Use a controller hook when a component is mixing behavior and rendering.

The controller's job is to derive the presentation model. It is the modern React version of the old container/presentational split, without naming files `Container.tsx`.

Good output:

- refs needed by layout
- `layout`
- `view`

Do not return a grab bag of unrelated loose props.

### Presentation Model

Prefer:

```ts
type PresentationModel = {
  layout: LayoutModel;
  view: ViewModel;
};
```

The model is renderable UI state, not domain data.

### Discriminated View Model

Prefer:

```ts
type View =
  | { kind: "intro"; onStart: () => void }
  | {
      kind: "input";
      inputRequest: InputRequest;
      onSubmit: SubmitFn;
      onCancel: () => void;
    }
  | { kind: "processing"; statusLabel: string }
  | { kind: "success"; result: Data; onDone: () => void }
  | { kind: "error"; error?: string; onRetry: () => void; onCancel: () => void };
```

Avoid:

- giant shared interfaces
- many optional props
- fake generic `content props`
- passing success-only props to intro views

### Layout Model

Use `layout` for:

- host mode
- shell variant
- density
- outer refs
- overflow treatment
- header and footer visibility
- provider or host metadata used by shell chrome

Do not put view-only actions into `layout`.

### Effect Discipline

Effects are for external synchronization, not for bookkeeping that can be derived during render.

Bad:

- syncing `viewModel.state` into another `status` state just to read it later

Good:

- derive the presentation model during render
- keep only truly local transition state when needed for async control flow

### Context Discipline

Do not default to feature context.

Use context only when data is truly ambient and deeply shared.

Do not use context as a substitute for:

- better file boundaries
- a controller hook
- explicit presentation models

## Dynamic Form Guidance

When forms are dynamic:

- normalize schema into typed descriptors first
- validate against normalized descriptors
- render fields through focused field components or a typed registry
- keep field rendering separate from normalization and validation

## Anti-Patterns

Avoid these unless there is a strong reason:

- one 1000+ line feature component
- boolean props that multiply variants
- route gating inside leaf components
- one shared props interface for mutually exclusive states
- wide context providers for one feature subtree
- effect-driven derived state syncing
- naming files after implementation accidents instead of responsibility

## Validation

Run targeted validation on touched files, then run the doctrine review pass over the refactor.

- formatter on touched UI files
- lint on touched files
- typecheck when types, boundaries, or call sites changed
- focused tests when behavior changed
- run `vercel-react-best-practices` against the work before calling it done
- run `vercel-composition-patterns` against the work before calling it done

If a commit hook reformats files, inspect the post-hook diff before finishing.

## Done When

The refactor is done when all of this is true:

- route gating is separate from runtime views
- file names match ownership
- layout concerns are separate from view concerns
- view variants are explicit and typed
- side effects are narrow and named
- pure logic lives outside presentational components
- prop threading is reduced because the model is better, not because context hid it
- the resulting tree is easier to explain in one diagram
