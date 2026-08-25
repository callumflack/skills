# Agent instructions

This repo publishes portable agent skills. The work is markdown skill bodies, not application code.

## Surfaces

- **Public skill:** top-level `<name>/SKILL.md`. Directory name matches frontmatter `name`. List it in the root `README.md` in the same change.
- **Retired:** move to `archive/`. See `archive/README.md`. Keep the `SKILL.md` shape; promote only by moving it back to top-level, rewriting it as a current public skill, and adding it to README.
- **Uncertain scratch:** `archive-unsure/`. Not a public skill. Do not add installable skills here.
- **Research notes:** `docs/`. Not a skill.

README is the catalog. A top-level skill directory that is missing from README is unpublished by accident, not a draft.

Do not copy a skill's workflow into this file. Load the skill.

## Authoring

- Frontmatter requires `name` and `description`. Description is third person, WHAT + WHEN, with trigger terms. Installers and agents use that string to decide whether to load the skill.
- Procedure lives in `SKILL.md`. Bulky reference goes in `references/` and is linked one level deep.
- Adapted third-party skills need a `NOTICE.md` plus a README license line. See `cognitive-load/`.
- Optional Codex UI: `agents/openai.yaml`. See `ui-grammar/agents/openai.yaml`.

## Format

Prettier owns markdown shape (`.prettierrc`: `proseWrap: "never"`). After markdown edits:

```sh
npm run format -- <path>
```

`npm run format:check` is the done gate. Pre-commit formats staged `*.md`.

Wrap copy-paste templates that need intentional line breaks with `<!-- prettier-ignore-start -->` / `<!-- prettier-ignore-end -->`. See `code-stacks/SKILL.md`.
