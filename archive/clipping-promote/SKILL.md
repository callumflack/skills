---
name: clipping-promote
description: Normalize imported Obsidian clippings into canonical vault shape. Use when processing a new clipping (especially X/Twitter threads) to resolve or create the author Mind, add handle metadata, convert generic titles into claim-style titles when the note is being curated, and optionally move clipping state through Clippings/_inbox, Clippings/_read, and Clippings/_distilled.
---

# Clipping Promote

Process imported clipping notes into reusable, queryable notes without changing vault ontology.

## Vault assumptions

- Canonical folders remain: `Clippings/`, `Minds/`, `Topics/`, `Synthesis/`, `Journal/`.
- Clipping state folders are optional and used as a state machine:
  - `Clippings/_inbox`
  - `Clippings/_read`
  - `Clippings/_distilled`

## Outcome contract

For each processed clipping:

1. `author` frontmatter is exactly one canonical Mind wikilink.
2. Mind exists in `Minds/` and includes handle metadata for deterministic lookup.
3. Title is either:
   - neutral capture title (raw notes), or
   - claim-style title (curated/promoted notes).
4. Filename matches final title.
5. Original body content is preserved unless user asks for rewriting.

## Procedure

### 1) Parse clipping identity inputs

Extract candidate identity from:

- `source` URL handle (e.g. `x.com/antoniogm/...`)
- `author` field if present
- first author line in body (e.g. `Antonio García Martínez ... @antoniogm`)

Normalize:

- handle: lowercase, no leading `@` for stored handle value
- display name: proper case, keep diacritics

### 2) Resolve existing Mind (in priority order)

Find a match in `Minds/*.md` using:

1. exact display-name title match
2. exact `aliases` match for `@handle`
3. exact `handles.x` match
4. exact body mention of same handle

If multiple candidates match, stop and ask user to choose.

### 3) Create Mind if missing

If no Mind matches, create `Minds/<Display Name>.md` with:

```md
---
type: mind
tags: []
aliases:
  - "@<handle>"
handles:
  x: "<handle>"
---

# <Display Name>

Known online as `@<handle>`.

## Notes
```

If non-X identity is present, add additional keys under `handles` (e.g. `ethereum`, `github`).

### 4) Canonicalize clipping author

Set clipping frontmatter author to a single string wikilink:

```md
author: "[[<Display Name>]]"
```

Do not keep list-form author arrays when there is only one author.

### 5) Decide title mode (raw vs curated)

- **Raw capture mode**: keep neutral title.
- **Curated mode**: replace generic/thread/import title with a claim title.

Use claim mode when at least one is true:

- user asks for stronger title
- clipping has clear thesis and will be reused
- clipping is moving to `_distilled` or being promoted toward `Synthesis/`

### 6) Generate claim title (curated mode only)

Create 2-3 candidate titles and pick one passing at least 4/5 checks:

1. specific assertion
2. debatable
3. standalone
4. scope-bounded
5. useful for action

Rules:

- avoid `Thread by`, `Thoughts on`, generic nouns
- keep phrasing short and concrete
- preserve original meaning; do not invent claims

### 7) Rename note safely

When title changes:

- update frontmatter `title`
- rename file to `<Title>.md`
- keep body unchanged

### 8) Optional state transition

If state folders exist, move note according to progress:

- `_inbox` -> captured only
- `_read` -> reviewed + minimal metadata
- `_distilled` -> explicit claims extracted

Do not create additional schema fields to represent state.

## Guardrails

- Never create platform Topic notes like `[[Twitter]]`, `[[X]]`, `[[Thread]]`.
- Keep tags sparse; do not add platform tags by default.
- Prefer deterministic identity properties (`aliases`, `handles`) over taxonomy.
- Preserve user text and formatting in clipping body.

## Quick checklist

- [ ] Mind resolved or created
- [ ] Mind has `aliases` + `handles.x` when X handle exists
- [ ] Clipping `author` is canonical wikilink
- [ ] Title mode chosen correctly (raw or claim)
- [ ] File renamed if title changed
- [ ] State folder updated only if user wants state transition
