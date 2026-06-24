# UI Component Naming

This is a small companion to
[ui-route-and-component-composition-guide.md](/Users/cflack/Repos/vana-com/odl-website/docs/ui-route-and-component-composition-guide.md).

That guide defines the route and ownership layers.
This doc defines the idiomatic names for the UI pieces those layers compose.

## Core Rule

Name a UI component after the layer of decision-making it owns.

Do not use different nouns for the same layer.
Do not use a bigger noun than the component has earned.

## The UI Stack

- `Shell`: persistent page chrome
- `Layout`: page-level arrangement inside a shell
- `Page`: App Router file-convention entrypoint only
- `Route`: route-owned orchestration and wiring
- `Presenter`: optional view-model shaping
- `View`: the complete presentational surface
- `Section`: a reusable content block inside a view
- `Wrapper`: a lightweight local grouping primitive

## What Each Name Means

### `Shell`

Use `Shell` for persistent chrome that outlives a single page surface.

Examples:
- app frame
- persistent background treatment
- nav/footer shell

In this repo:
- [`PageShell`](/Users/cflack/Repos/vana-com/odl-website/src/components/layout/page-shell.tsx)

### `Layout`

Use `Layout` for page-level arrangement within an existing shell.

This is structure, not route orchestration and not a full view.

In this repo:
- [`LegalPageLayout`](/Users/cflack/Repos/vana-com/odl-website/src/components/layout/legal-page-layout.tsx)

### `Page`

Use `Page` only for the App Router entrypoint file and exported page component.

Do not use `Page` for shared primitives.

### `Route`

Use `Route` for route-owned controller logic.

It owns state, query wiring, refresh, URL concerns, and data-to-view handoff.

### `Presenter`

Use `Presenter` only when a view needs a real adapter layer for shaping data
into view props.

Do not create this layer by default.

### `View`

Use `View` for a full presentational surface.

A `View` can compose many sections and lower-level primitives, but it still
represents one coherent surface.

In this repo:
- [`BlogPostView`](/Users/cflack/Repos/vana-com/odl-website/src/components/post/blog-post-view.tsx)
- [`CaseStudyPostView`](/Users/cflack/Repos/vana-com/odl-website/src/components/post/case-study-post-view.tsx)

### `Section`

Use `Section` for a reusable content block inside a `View`.

A section is bigger than a button or heading primitive, but smaller than a
whole view.

Good section names describe the block itself:
- `EnderSection`
- `ProblemQuadrant`
- `PricingSection`

In this repo, shared section primitives live in:
- [`src/components/sections`](/Users/cflack/Repos/vana-com/odl-website/src/components/sections)

### `Wrapper`

Use `Wrapper` sparingly for a lightweight local grouping primitive.

If the component has a clearer structural role, use that noun instead.

## Practical Rules

- Use `Shell` for persistent chrome.
- Use `Layout` for internal page arrangement.
- Use `View` for a complete presentational surface.
- Use `Section` for reusable blocks inside a view.
- Use `Wrapper` only when the component is truly just grouping.
- Use `Page` only for the route entrypoint.
- Prefer `Route` over `Container` for route-owned orchestration.

## Folder Rule

The folder should match the layer.

- `src/components/layout` for shells and layouts
- route-owned folders for route-private surfaces
- `src/components/sections` for shared view-level content blocks

Other shared buckets still have a clear place:

- `src/components/ui` for design-system and Shadcn-style UI primitives
- `src/components/elements` for small shared building blocks that are not whole
  sections or layouts
- `src/components/navigation` for nav-specific UI

These do not need a heavier naming framework than that.
They are already idiomatic when they stay in their lane.

## Quick Heuristic

When naming a component, ask:

1. Is this the whole surface the user experiences?
2. Or is it one reusable block inside that surface?
3. Or is it just structure around other content?

Use the answer to pick the noun:

- whole surface -> `View`
- reusable block inside a view -> `Section`
- structure around content -> `Layout`
- persistent app chrome -> `Shell`

## Current Repo Read

Today, the idiomatic read for this repo is:

- `PageShell` is a `Shell`
- `LegalPageLayout` is a `Layout`
- `BlogPostView` and `CaseStudyPostView` are `View`s
- `HeroIntro`, `EnderSection`, and `ProblemQuadrant` are shared `Section`s
- `SectionHeading` and `SectionCta` are section primitives that belong with
  the shared section layer
