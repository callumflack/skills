# Language

Shared vocabulary for React refactors. Use these terms exactly when ownership is the point.

## Terms

**Route Entry**
The framework-owned file that receives route params, search params, metadata, and request-time data, then delegates.
_Avoid_: screen, page component, top-level component.

**Route Controller**
The route-owned gate for canonical URL state, auth/session/token branching, redirects, and route diagnostics.
_Avoid_: container, manager, handler.

**Feature Entry**
The thin component that starts the feature after route concerns are settled.
_Avoid_: app, root, main component.

**Controller**
The orchestration layer that turns runtime inputs, side effects, and domain data into a stable model for views.
_Avoid_: container, manager, orchestrator component.

**Model**
Renderable UI state. Not domain data. A model is the shaped data and actions the UI can render without knowing orchestration.
_Avoid_: props bag, render state, content props.

**Presentation Model**
The controller output consumed by presentation. Usually `{ layout, view }`.
_Avoid_: controller props, component state.

**Layout Model**
The shell/chrome part of the presentation model: host mode, density, refs, overflow, header/footer, frame metadata.
_Avoid_: wrapper props, shell props.

**View Model**
The discriminated runtime part of the presentation model. It selects what the user sees now and carries only that variant's data/actions.
_Avoid_: optional mega-interface, state enum plus loose props.

**Layout View**
The presentational shell that renders chrome and places the selected view.
_Avoid_: wrapper, scaffold, frame component.

**View Switch**
The component that switches on the view model kind and delegates to runtime views.
_Avoid_: screen switch, mode renderer.

**Runtime View**
A focused presentational view for one `view.kind`.
_Avoid_: screen, state component, case component.

**Effect Hook**
A focused hook for one external synchronization concern.
_Avoid_: lifecycle hook, side-effect bucket.

**Pure Helper**
A pure function for derivation, normalization, validation, or calculation.
_Avoid_: util dump, helpers bucket.

## Principles

- **Controllers derive models. Views render models.**
- The container/presentational split is ancestry, not naming doctrine. Use **Controller** and **View**; do not introduce `Container.tsx`.
- File names should reveal ownership before implementation detail.
- `View` means runtime presentation, not a route screen.
- `Model` means renderable UI shape, not backend/domain persistence.

## Relationships

- A **Route Entry** delegates to a **Route Controller** or **Feature Entry**.
- A **Controller** derives a **Presentation Model**.
- A **Presentation Model** contains a **Layout Model** and **View Model**.
- A **Layout View** renders the shell around a **View Switch**.
- A **View Switch** renders one **Runtime View** from the **View Model**.
- **Effect Hooks** and **Pure Helpers** serve the **Controller**; they should not leak orchestration into views.
