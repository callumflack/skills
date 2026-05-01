# Model Interface Design

Use this when the controller output or view model shape is the hard part of a React refactor.

Based on "design it twice": the first model shape is rarely the best.

## When To Use

Run this before editing when:

- a controller would serve several runtime states
- optional props are accumulating
- views need different action sets
- model naming is fuzzy
- route, host, and runtime state all influence presentation
- the wrong model would force churn across many files

Skip it for narrow renames, leaf extraction, or obvious one-view features.

## Frame The Problem

Write a short problem-space note:

- current callers and views
- runtime states the model must represent
- layout/chrome state that is separate from runtime view state
- actions each state can legally expose
- domain data that should stay outside the render model
- side effects the controller coordinates but views must not know about

Then compare at least two shapes.

## Candidate Shapes

### 1. Minimal Model

Optimize for the fewest concepts.

Use when:

- the feature has one main flow
- layout is stable
- only a few actions vary by state

Risk:

- can become optional-prop soup if future variants differ more than expected

### 2. Discriminated View Model

Optimize for legal states.

Use when:

- views are mutually exclusive
- each view has distinct actions or data
- invalid prop combinations are common

Preferred shape:

```ts
type PresentationModel = {
  layout: LayoutModel;
  view: ViewModel;
};

type ViewModel =
  | { kind: "intro"; onStart: () => void }
  | { kind: "input"; request: InputRequest; onSubmit: SubmitFn; onCancel: () => void }
  | { kind: "processing"; statusLabel: string }
  | { kind: "success"; result: Result; onDone: () => void }
  | { kind: "error"; message: string; onRetry: () => void; onCancel: () => void };
```

Risk:

- can overfit if every tiny visual difference becomes a new kind

### 3. Composed Feature Surface

Optimize for caller composition.

Use when:

- consumers need to assemble different subparts
- feature pieces share state but render in different arrangements
- boolean variant props are multiplying

Risk:

- context can hide dependencies if the provider interface is too wide

Example shape:

```tsx
<FeatureProvider value={model}>
  <FeatureLayout>
    <FeatureHeader />
    <FeatureView />
    <FeatureActions />
  </FeatureLayout>
</FeatureProvider>
```

Use slots or compound parts for rendering flexibility. Keep the provider narrow: shared model in, no hidden route state, no catch-all action bag.

## Compare

Compare in prose. Use these criteria:

- **Legality**: can the type system represent impossible UI states?
- **Locality**: where do state changes concentrate?
- **Caller knowledge**: how much must a view or caller know to render correctly?
- **Test seam**: where can behavior be verified without testing implementation details?
- **Change cost**: what must change when adding a new runtime view?

Recommend one shape. Do not leave the user with a menu unless the real decision is product/UX, not code shape.

## Red Flags

- `layout` contains view-only actions.
- `view` contains shell/chrome fields.
- Views receive domain data and re-derive display state.
- All variants share one mega-interface.
- The controller returns many loose props instead of one Presentation Model.
- A Service imports React.
- A Selector writes state or performs I/O.
