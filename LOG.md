# Worklog

## 2026-09-07

- **Resolved:** published `pstack-codex` from this authored-skills repo while the agents repo retains only the external Pstack reference. The adapter, session-mode hook, and six tests passed structural validation and runtime link checks. Python bytecode remains ignored. No follow-up remains for this slice.

- **Resolved:** `thread-homebase` audit fixes passed formatting and structural validation; the requested task was notified to reload the method.

- **Decision:** simplify `thread-homebase` after the approved audit: retain exact titles, owner distinctions, and evidence-based status; remove automatic task lifecycle changes, duplicated heartbeat instructions, and embedded review cadence. Send the validated update to task `01a04126-4e46-75c0-bf6f-bb4b8bb2ffb0`.

- **Correction:** Callum rejected the fixed model hierarchy and the subsequent advisor-only interpretation. Astra should judge the work and delegate to any suitable model, including Astra. Simplify the skill using Eric's Mind note; preserve useful handoff context and completion responsibility without a staffing recipe.

- **Resolved:** the skill and provenance now live here, with a README entry. The documented linker passed its topology check for Codex, Claude, and Cursor. The former source path is now the registry symlink, not a duplicate.
- **Decision:** Callum requested moving `orchestrate-astra`, including its provenance, from the agents registry into this canonical skills repo and making it globally available using the documented linker. This supersedes the earlier local-source exception. Next: move, catalogue, format, and link.

## 2026-09-02

- Added `knowledge-promotion-review`, a read-only evidence classifier for deciding whether cross-repository learning stays local or becomes a domain or cross-domain candidate. In blinded isolated replays, it matched the baseline on an easy deterministic-fix case and materially improved a harder cross-domain case by requiring guided/unguided behavioral testing, a counterexample, and artifact inspection before promotion.

## 2026-08-31

- Added a Codex-only compatibility layer for pstack model routing and collaboration-agent calls. Cursor continues to own its generated `~/.cursor/rules/pstack-models.mdc`; third-party pstack bodies and installations remain untouched. A fresh isolated Codex `/how` request automatically loaded both `pstack-codex` and `how`, then selected `gpt-5.6-luna` at `high` for the hypothetical explorer without spawning agents or changing the fixture.
- Added thread-scoped Poteto persistence for Codex through an idempotently installed `UserPromptSubmit` hook. State is keyed by Codex session and records `active` or `inactive`; the inactive tombstone overrides earlier injected context. Separate threads remain untouched.
