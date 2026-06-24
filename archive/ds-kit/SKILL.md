---
name: ds-kit
description: Install, audit, and extend Callum's copy-first design-system kit in React, Next.js, or Tailwind apps. Use whenever the user wants to set up the shared design-system foundation, copy in `vars.css`/`index.css`/`classes.ts`, install `Text` and the customized `Button`, sync a repo with the canonical ds-kit source, or add semantic tokens/variants that must stay aligned across CSS, Tailwind aliases, and class merging.
---

# DS Kit

Use this skill to apply the canonical design-system kit from its source repo into the current app, then keep the copied foundation consistent over time.

## Canonical source

Default source path:

- `/Users/cflack/Repos/callumflack/ds-kit`

If that path is missing, ask the user for the canonical kit location before proceeding.

## Scope

Current V1 runtime install set:

- `.vscode/settings.json` — suppresses "Unknown at rule" for Tailwind directives (`@apply`, `@theme`, `@source`, etc.)
- `biome.json` — Biome config with `css.parser.tailwindDirectives` and Tailwind at-rule ignores (optional; requires `package.json` + `@biomejs/biome`)
- `styles/vars.css`
- `styles/index.css`
- `styles/animations.css`
- `styles/utils.css`
- `lib/classes.ts`
- `lib/utils.ts`
- `components/typography/text.tsx`
- `components/typography/field.tsx`
- `components/ui/button.tsx`

The kit contract currently centers on:

- CSS tokens first
- Tailwind theme mapping in `index.css`
- merge-aware semantic utilities in `classes.ts`
- `Text` as the canonical typography primitive
- `Button` as the canonical interactive primitive
- shared sizing/focus/invalid helpers in `components/typography/field.tsx`

Do not broaden the install set unless the user asks.

## Modes

Choose the narrowest mode that fits the request.

### Install

Use for requests like:

- "install my ds kit here"
- "set up my design system in this Next app"
- "copy in `Text`, `Button`, and the token system"

Workflow:

1. Inspect the target repo before editing.
2. Verify the canonical source path exists.
3. Check the target structure:
   - whether `src/` exists
   - whether imports use `@/`
   - where global CSS is loaded
   - whether Tailwind 4 is in use
4. Copy the V1 runtime install set into matching target folders.
5. Adapt import paths only if the target repo requires it.
6. Check integration assumptions and report follow-up work:
   - dependencies
   - global stylesheet entrypoint
   - font assets referenced in `styles/index.css`
   - alias differences
7. Summarize exactly what was installed and any manual follow-up.

Default behavior:

- Prefer copying from the canonical ds-kit source rather than retyping files.
- Preserve the kit folder structure in the target app.
- Make the smallest integration edits needed for the copied files to work.

### Audit

Use for requests like:

- "audit this repo against ds-kit"
- "does this app still follow my design-system contract?"
- "check whether the design-system install drifted"

Audit for these conditions:

- semantic tokens are defined in CSS before component-level use
- Tailwind-facing semantic aliases live in `styles/index.css`
- `classes.ts` knows about merge-sensitive semantic utilities
- `Text` remains the canonical typography primitive
- `Button` remains the canonical interactive primitive
- `Button` and related components still use the shared sizing/focus contract rather than inventing parallel geometry

Findings should be concrete and path-based. Focus on drift, missing touchpoints, and parallel styling systems.

### Extend

Use for requests like:

- "add a new semantic token"
- "add a button variant"
- "extend the text scale"
- "rename a design token semantically"

Before editing, identify all required touchpoints. For common changes:

- new token:
  - `styles/vars.css`
  - `styles/index.css`
  - `lib/classes.ts` if Tailwind merge awareness is needed
- new typography semantic:
  - `styles/index.css`
  - `components/typography/text.tsx`
  - `lib/classes.ts` if it creates new merge-sensitive utilities
- new button semantic:
  - `components/ui/button.tsx`
  - supporting token/theme files if the variant depends on new semantics
- shared control sizing/state change:
  - `components/typography/field.tsx`
  - `components/ui/button.tsx`

Prefer changing the token and contract layers first, then component variants.

## Install notes

The current ds-kit source includes lightweight docs:

- `README.md`
- `CONTRACT.md`
- `PROMOTION-RULE.md`
- `INSTALL-NOTES.md`
- `references/dependencies.md`

Read these when you need confirmation of scope or assumptions. Do not load extra files unless the task needs them.

## Guardrails

- Treat ds-kit as copy-first source, not an npm package.
- Do not generate a parallel design system from scratch when the kit should be copied.
- Do not silently broaden the install with unrelated `ui/*` files.
- Keep app-specific branding local unless the user explicitly wants to promote it back into ds-kit.
- If a requested change seems foundational and reusable, say so and suggest promoting it back to the canonical ds-kit repo.

## Output

For install work, report:

- source path used
- files copied or updated
- integration assumptions checked
- manual follow-up, if any

For audit work, report:

- findings first
- any open questions or assumptions
- brief drift summary

For extension work, report:

- which contract layers were updated
- any follow-up promotion recommendation

## Example prompts

- "Install my ds-kit into this Next app."
- "Audit this repo against my ds-kit contract."
- "Add a new semantic warning button variant and keep the merge rules aligned."

## Skills to install

These skills MUST be installed:

- npx skills add https://github.com/vercel-labs/skills --skill find-skills
- npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices
- npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns
- npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
- npx skills add https://github.com/vercel-labs/agent-eval --skill frontend-design
- npx skills add https://github.com/vercel-labs/agent-browser --skill agent-browser
- npx skills add https://github.com/vercel-labs/before-and-after --skill before-and-after
- npx skills add https://github.com/vercel-labs/agent-browser --skill dogfood
- npx skills add vercel-labs/next-skills