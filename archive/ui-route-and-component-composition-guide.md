# Route And Component Composition Guide

```text
[Shell + Layout]
  -> page.tsx
    -> Route / Container
      -> Presenter (optional)
        -> View
          -> design-system components
```

Use this guide when writing App Router routes and React components in this repo.

It describes the route methodology, the component layering, and the design system boundary behind both.

## Boundaries, Ownership, And Co-location

The point of this method is to make ownership obvious.

We do that in two reinforcing ways:

- **Boundaries** define which layer owns which decisions.
- **Co-location** expresses that ownership in the file tree.

In other words: we enforce boundaries so responsibilities stay clear, and we use co-location so the code lives next to the layer that owns it.

That is why this guide cares about both component layering and file placement. They are not separate concerns. They are two ways of making ownership legible.

- `Page` owns the App Router file convention entrypoint.
- `Route` owns route-level orchestration such as query hooks, URL state, refresh, and data-to-view wiring.
- `Presenter` owns view-model shaping when that work deserves its own layer.
- `View` owns the visible surface and route-local UI composition.

Once those ownership boundaries are clear, placement follows naturally:

- route-private code stays co-located with the owning route
- admin-shared code moves to admin-owned shared folders
- app-wide shared code moves to `src/components`

When this is working, you can answer three questions quickly:

1. Who owns this decision?
2. Where should this code live?
3. When is it justified to move it upward?

## Server / Client Interleaving

Keep this right-sized for the route in front of you.

- Default: `page.tsx` stays a thin server entrypoint and renders a client `Route` when the screen needs client hooks, refresh, URL state, or other client-owned orchestration.
- Do not collapse client fetch/orchestration into `View` just because the `Route` feels thin. If a client hook owns route state, that layer is still the `Route`.
- Consider deeper server/client interleaving only when there is a clear payoff such as server-rendered initial data, reduced client work, or better loading behavior. Do not force that split by default.
- When interleaving is not clearly earning its complexity, prefer the simpler `page.tsx -> Route -> View` shape.

## Recommended Flow

For new React routes in this repo, prefer this shape:

1. `layout.tsx` or parent shell owns auth and persistent chrome.
2. `page.tsx` stays tiny and renders the route entry.
3. `Route` owns client state, search params, and data fetching.
4. Add a `Presenter` only if the view-model shaping earns its own layer.
5. `View` owns the visible UI.
6. `View` composes shared design-system primitives from `src/components` before adding route-local UI.
7. Shared admin-only UI graduates to `admin/_components` only after real reuse.
8. App-wide primitives live in `src/components`.

## Naming Rule

Prefer existing repo language over introducing new structural names.

- Use `Shell` for persistent page chrome.
- Use `Layout` for page-level arrangement inside a shell.
- Use `Page` only for the file-convention entrypoint.
- Use `Route` for route-owned controller logic.
- Use `View` for the actual presentational surface.
- Use `Presenter` for view-model shaping when needed.
- Use `Container` only when it is clearer than `Route` and matches local usage.
- Use `Wrapper` for local grouping.
- Avoid inventing alternatives like `Frame` when one of the repo terms already fits.
- In route-private folders, prefer short local filenames like `route.tsx`, `view.tsx`, `presenter.tsx`, or names that describe the local surface such as `recent-runs-panel.tsx`. Do not repeat the whole route name in colocated file names.

## 1. Shell And Layout

`Shell` means persistent app chrome.

Examples:

- [default-shell.tsx](/Users/cflack/Repos/vana-com/context-gateway/src/components/layout/default-shell.tsx)
- [authenticated-shell.tsx](/Users/cflack/Repos/vana-com/context-gateway/src/components/layout/authenticated-shell.tsx)

`Layout` means a component that arranges page content within an existing shell.

Example:

- [section-sidebar-layout.tsx](/Users/cflack/Repos/vana-com/context-gateway/src/components/layout/section-sidebar-layout.tsx)

## 2. Page

`page.tsx` is the route entrypoint, not the feature and not usually the surface.

It should stay thin:

- wire the App Router file convention
- redirect if needed
- render one route component
- add `Suspense` only when the route actually depends on it

The actual screen the user experiences is usually a `View`, reached through the route stack.

Examples:

- [src/app/(authenticated)/admin/page.tsx](</Users/cflack/Repos/vana-com/context-gateway/src/app/(authenticated)/admin/page.tsx>)
- [src/app/(authenticated)/admin/accounts/page.tsx](</Users/cflack/Repos/vana-com/context-gateway/src/app/(authenticated)/admin/accounts/page.tsx>)
- [src/app/(authenticated)/admin/telemetry/runs/page.tsx](</Users/cflack/Repos/vana-com/context-gateway/src/app/(authenticated)/admin/telemetry/runs/page.tsx>)

## 3. Route

`Route` means the route-owned React controller.

`Route` components usually:

- are client components
- own URL state, local state, query hooks, and refresh/invalidation
- translate fetched data into view props
- avoid heavy markup
- still exist even when they feel thin; if route-owned client orchestration or data fetching is present, do not move that responsibility into `View`

Examples:

- [src/app/(authenticated)/admin/accounts/_lib/route.tsx](</Users/cflack/Repos/vana-com/context-gateway/src/app/(authenticated)/admin/accounts/_lib/route.tsx>)
- [src/app/(authenticated)/admin/telemetry/_components/telemetry-connectors-route.tsx](</Users/cflack/Repos/vana-com/context-gateway/src/app/(authenticated)/admin/telemetry/_components/telemetry-connectors-route.tsx>)
- [src/app/(authenticated)/admin/telemetry/_components/telemetry-runs-route.tsx](</Users/cflack/Repos/vana-com/context-gateway/src/app/(authenticated)/admin/telemetry/_components/telemetry-runs-route.tsx>)

## 4. Presenter

`Presenter` means an adapter layer that turns raw route or hook data into view-specific props and interaction models.

Use it when a `View` would otherwise get bloated with formatting, derived copy, or UI-specific state shaping.

We do use this name, but sparingly.

Example:

- [src/components/account/credentials/credentials-presenter.tsx](/Users/cflack/Repos/vana-com/context-gateway/src/components/account/credentials/credentials-presenter.tsx)

## 5. View

`View` means the presentational surface for a route or sub-surface.

`View` components should:

- receive plain props
- render UI states and markup
- stay ignorant of fetch details and auth/session concerns
- be easy to reuse inside the owning route tree
- not import route-owned query hooks just to avoid a thin `Route`

Examples:

- [src/app/(authenticated)/admin/accounts/_components/view.tsx](</Users/cflack/Repos/vana-com/context-gateway/src/app/(authenticated)/admin/accounts/_components/view.tsx>)
- [src/app/(authenticated)/admin/telemetry/_components/telemetry-connectors-view.tsx](</Users/cflack/Repos/vana-com/context-gateway/src/app/(authenticated)/admin/telemetry/_components/telemetry-connectors-view.tsx>)

## 6. Container

`Container` means a component that owns data or orchestration and feeds a more presentational child.

We have the concept, but in this repo the name `Route` is usually preferred for route-owned containers. Use `Container` only when it is clearer than `Route` or when matching an existing local pattern.

## 7. Route-Private Folders

Use route-private folders under the owning route before promoting code upward.

This is our main co-location rule: keep route-private code with the route that owns it, and only move it upward when the ownership boundary broadens through real reuse.

- `_components`: route-local presentational pieces
- `_lib`: route-local controller/helpers/query wiring
- `_types`: route-local types

Admin specs already codify this pattern:

- [openspec/specs/admin-route-colocation/spec.md](/Users/cflack/Repos/vana-com/context-gateway/openspec/specs/admin-route-colocation/spec.md)
- [openspec/specs/admin-query-pattern/spec.md](/Users/cflack/Repos/vana-com/context-gateway/openspec/specs/admin-query-pattern/spec.md)
- [openspec/specs/admin-surface-composition/spec.md](/Users/cflack/Repos/vana-com/context-gateway/openspec/specs/admin-surface-composition/spec.md)

## 8. Wrapper

`Wrapper` means a lightweight local grouping primitive.

Example:

- [stack-panel.tsx](/Users/cflack/Repos/vana-com/context-gateway/src/components/elements/stack-panel.tsx)

## 9. Design System

Behind the route structure is a foundational design system.

In this repo, that mostly lives in `src/components`.

When building pages and route surfaces:

- defer to existing shared components before inventing local markup
- study `src/components/ui`, `src/components/layout`, and `src/components/typography` first
- compose page structure from the design system whenever the needed primitive already exists
- keep route files focused on route concerns, not re-implementing reusable UI

Good default: learn the existing component language first, then compose with it.

## 10. Network Requests

Keep network request code out of `View`.

In this repo, the usual shape is:

- a route-owned hook wraps the request library and query key details
- `Route` calls that hook, owns refresh/invalidation, and passes plain props down
- `View` renders the states and interactions, but does not know how data is fetched

This keeps request code easy to reuse and keeps fetch details from leaking across the surface.

Good default: if multiple routes need the same admin resource pattern, extract a small hook for it instead of repeating fetch and invalidation code in each route.
