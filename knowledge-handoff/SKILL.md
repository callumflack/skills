---
name: knowledge-handoff
description: Capture durable knowledge from a Codex chat, external conversation, source reading, rough note, synthesis session, or long-running pinned thread into the KB owning surface. Use when the user wants to roll up, archive, unpin, distill, preserve, route, or make retrievable what matters from knowledge-work context, especially when long Codex chats are being used as memory. Do not use for ordinary code/workflow handoff unless the user asks for durable conceptual capture.
---

# Knowledge Handoff

Long chats are caches. KB artifacts are memory.

Use this skill to compress what should survive, route it to the owning vault surface, and reduce dependence on pinned Codex history.

## Owner And Oracle

Before writing, name:

- owner surface
- allowed writes
- forbidden writes
- source material being compressed
- done gate
- first real check

Ask only when the owner surface cannot be inferred safely. Otherwise state one concrete routing assumption and proceed.

## Route

Use the repo router before writing. Prefer the smallest owner:

- `raw/` for source capture, transcript, imported conversation, external text, or unprocessed material.
- `wiki/` for durable claim, synthesis, inquiry, thread, distillation, or public-facing knowledge note.
- Existing project, inquiry, thread, list, or distillation page when it already owns the idea.
- `.agents/logs/` only for repo-operational context, repeated workflow friction, or future-agent orientation.
- Notion or another external surface only when the user explicitly names it as owner.

Never default to temp files. Temp handoffs are for workflow continuation, not KB memory.

## Preserve

Keep:

- the durable claim
- source pressure: what makes the claim sharp, resistant, or non-obvious
- provenance: chat/source/file/link/date/path
- live distinction: what this is not and what it must not collapse into
- open questions
- next retrieval hook: exact title, wikilink, index entry, or search phrase
- next action if the user resumes

Drop:

- generic chat summary
- assistant self-narration
- implementation minutiae unless they change the knowledge claim
- duplicate copies of PRDs, plans, notes, issues, commits, or diffs
- secrets, credentials, and unnecessary personal data

## Output Shapes

Pick one shape.

### Raw Capture

Use when the source itself must survive before interpretation. Follow `.agents/resolvers/raw-processing.md`.

Include source URL/path/date and minimal metadata. Do not rewrite the source body unless the resolver requires it.

### Claim Note

Use when one strong idea should survive. Follow `.agents/resolvers/wiki-write.md`.

Include:

- claim
- why it matters
- provenance
- evidence
- counterpressure or caveat
- adjacent wikilinks
- open questions

### Synthesis Note

Use when several sources or threads need integration. Follow `.agents/resolvers/wiki-write.md`.

Include:

- synthesis thesis
- source cluster
- important distinctions
- tensions
- implications
- graph links

### Thread Or Distillation Update

Use when the idea belongs to an existing running inquiry.

Update the existing note instead of creating a duplicate. Prefer current-compression or distillation pages for what matters now; preserve chronology in thread pages.

### Repo-Operational Log

Use `.agents/logs/` only when the durable thing is workflow context, repeated friction, repo-specific operating rule, or future-agent orientation.

## Long Codex Chat Compression

When the user wants to archive, unpin, or stop relying on a long Codex chat:

1. Extract what still matters.
2. Split workflow continuation from durable knowledge.
3. If workflow continuation is needed, create a separate handoff artifact.
4. For knowledge, write the KB artifact.
5. Add a short reactivation prompt when useful:

```text
We are continuing from this KB artifact. Read it first, inspect current repo state and adjacent notes, verify what still applies, and continue without assuming the old Codex chat is available.
```

## Completion

Before calling done, run the owning resolver gate and inspect the written surface.

Report:

- artifact path
- owner surface
- what survived
- what was intentionally not copied
- index/log update, if required
- retrieval hook
- whether the original chat can now be archived safely

## Anti-Patterns

Do not:

- dump a whole chat transcript into `wiki/`
- create temp files as the final artifact
- smooth away the user's sharp language or source pressure
- create a new note when an existing thread, distillation, inquiry, or list owns it
- treat code handoff and knowledge capture as the same operation
- use `.agents/logs/` for conceptual knowledge
- duplicate material already captured elsewhere
- claim done without checking repo index/log conventions
