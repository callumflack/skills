# Agent instructions

This repo publishes portable agent skills. The work is markdown skill bodies, not application code.

## Surfaces

- **Public skill:** top-level `<name>/SKILL.md`. Directory name matches frontmatter `name`. List it in the root `README.md` in the same change.
- **Retired:** move to `archive/`. See `archive/README.md`. Keep the `SKILL.md` shape; promote only by moving it back to top-level, rewriting it as a current public skill, and adding it to README.
- **Uncertain scratch:** keep it in `archive/` alongside retired material. It is not a public skill.
- **Research notes:** `docs/`. Not a skill.

README is the catalog. A top-level skill directory that is missing from README is unpublished by accident, not a draft.

Do not copy a skill's workflow into this file. Load the skill.

## Authoring

When adding, updating, renaming, retiring, or verifying publication of a skill, follow [Skill publication](scripts/README.md#skill-publication). Keep README, `skills.sh.json`, and runtime links aligned; `npm run verify` is the completion gate. A push alone does not verify skills.sh publication.

- Frontmatter requires `name` and `description`. Description is third person, WHAT + WHEN, with trigger terms. Installers and agents use that string to decide whether to load the skill.
- Procedure lives in `SKILL.md`. Bulky reference goes in `references/` and is linked one level deep.
- Adapted third-party skills need a `NOTICE.md` plus a README license line. See `cognitive-load/`.
- Optional Codex UI: `agents/openai.yaml`. See `ui-grammar/agents/openai.yaml`.

## Local authoring

This checkout is the canonical source for Callum-authored skills. On Callum's machine, `scripts/link-skills.sh` links them into the global registry and agent runtimes. Do not install or update this repository with `npx skills`; use `npx skills` only for external skills.

Its canonical Homebase entry point is `Tooling/skills/AGENTS.md`; resolve the real repository root before running its scripts or Git commands.

Edits to an existing skill are live through the links; start a new agent task to reload them. After adding, renaming, or retiring a skill, run `scripts/link-skills.sh`. Use `scripts/check-links.sh` to verify the installed topology without changing it.

## Format

Prettier owns markdown shape (`.prettierrc`: `proseWrap: "never"`). After markdown edits:

```sh
npm run format -- <path>
```

`npm run verify` checks formatting and catalogue consistency. Pre-commit formats staged `*.md`.

Wrap copy-paste templates that need intentional line breaks with `<!-- prettier-ignore-start -->` / `<!-- prettier-ignore-end -->`. See `code-stacks/SKILL.md`.
