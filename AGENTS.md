# Agent instructions

Operational notes for work in this repo. For personalization defaults, see [`AGENTS-SEED.md`](AGENTS-SEED.md).

## Markdown prose

Do not manually wrap markdown prose. One paragraph or list item = one source line.

Bad:

<!-- prettier-ignore-start -->

```md
Do not turn this into architecture theater. Every planned type, function, or
call frame should point at a live repo surface or an explicit new surface.
```

<!-- prettier-ignore-end -->

Good:

```md
Do not turn this into architecture theater. Every planned type, function, or call frame should point at a live repo surface or an explicit new surface.
```

Editors and viewers soft-wrap. Prettier owns source shape.

## Formatting

- Config: `.prettierrc` sets `proseWrap: "never"`.
- Format touched markdown: `npm run format -- <path>`
- Check all markdown: `npm run format:check`

Pre-commit runs Prettier on staged `*.md` via lint-staged. Fix locally before pushing if hooks are skipped.

## Fenced examples

Keep intentional line breaks inside copy-paste templates. Wrap those blocks with `<!-- prettier-ignore-start -->` and `<!-- prettier-ignore-end -->`. See `code-stacks/SKILL.md` for a working example.

Do not add soft returns to normal prose outside ignored template blocks.

## Done gate for markdown edits

After editing markdown in this repo, run the narrowest check:

1. `npm run format -- <touched-paths>`
2. `npm run format:check` when multiple files changed

Treat a format failure as a blocking lint error.
