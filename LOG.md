# Worklog

## 2026-09-18

- **Plan provenance steer:** Callum requested Arslan's recap prompt verbatim as the primary reference for deriving and revising the plan skills. Keep it beside `plan-spec`, clearly attributed and linked from the skill. Preserve the distinction between the quoted source and the current operating rules; LL remains outside this plan system. This slice does not authorize commits or a new history review.
- **Plan provenance resolved:** the reference preserves the supplied prompt and links the initial derivation evidence, with its Unity/Vana sampling limits explicit. `plan-spec` routes skill creation, revision and assessment to it. Formatting and installed runtime-link checks passed; no staging or commit.
- **Plan provenance commit:** Callum subsequently authorized a local commit of this update, including the untracked shared `plan-spec` prerequisite, its reference, attribution and catalog entry. The seven operational skills and their pending catalog/worklog entries remain outside this commit; no push requested.

- **LL objective:** Callum requested global `learning-loop` (LL), backed by a Playbooks assessment method. Earlier proposals confused the learning's local destination with the reusable procedure's owner. Preserve the existing plan-skills work; LL does not change those skills or global policy.
- **LL goal steer:** Callum identified the success measure as a subsequent agent finding and correctly applying the decision without him repeating it: better work with fewer interventions. Make that the opening goal and judge later work against it. The original eight Stake findings need owner-by-owner assessment, not automatic duplication as new rules.
- **LL resolved:** skill and assessment playbook are authored; structural validation, repository formatting and installed runtime/reference links pass. The Stake retro task read the installed skill and followed its companion link, confirmed the ownership split and usability, and found no blocking correction. Independent behavioral improvement remains unproved; the Playbooks queue owns the next organic check. Callum authorized scoped local commits for LL in skills and Playbooks; no push requested.

- **Objective:** tailor the plan lifecycle skills to Callum's observed Unity Surfaces work, using June–September Git/PR, ticket and conversation evidence before authoring. Skills live here; Unity owns its local plan profile and evidence. User approved one sequence with lowest suitable model efforts.
- **Boundary:** preserve both checkouts and existing dirty work. No staging, commits, pushes, ticket changes or sent messages. Install authored skills through the existing linker; use a temporary workspace for the fictional walkthrough.
- **Resolved implementation:** eight skills are authored and linked. Structural validation, whole-repo formatting and runtime links pass. An independent local walkthrough preserved unrelated work, kept status read-only, waited for fictional acceptance before closing, and proposed no unsupported retro rule. Remote dispatch/PR/deployment behavior was not exercised.
- **Commit correction:** Callum explicitly requested committing the complete new plan system. The earlier provenance-only split was too narrow. Commit all seven remaining operational skills and their catalog entries, completing the package alongside the already committed `plan-spec`. This supersedes the initial no-commit boundary and pending local review gate; no push requested. Unity's local profile and research remain owned by its repository.

## 2026-09-17

- **Correction:** `react-build-lens` treated Next bundled docs as a substitute for `react-feature-composition`, and listed composition in a "do not substitute / do not load" pair with `next-best-practices`. Agents collapsed that into "composition is barred in Next apps." The skill's own composition skill is for React or Next.js.
- **Decision:** Give each owner a positive job. Next docs own runtime (`use client`, RSC, routing, data fetching, metadata, rendering). Composition owns feature folders, controllers, models, views, services, selectors, including in Next. "Read Next docs first" means order. Delete every "do not load composition" / "non-Next React only" line rather than adding a ban-of-the-ban.
- **Resolved:** Description, Rule, cold-agent, Framework Check, selector, and workflow step 2 now pair runtime then ownership. No remaining "do not load composition" line. Prettier check passed. Reload a new agent task to pick up the linked skill.
- **Resolved follow-up:** Pruned the redundant pairing in `react-build-lens`. `react-feature-composition` now selects related skills by observed concern and treats `next-best-practices` as an explicitly requested optional checklist using the current source. The runtime/ownership split and existing skill edits remain intact.

## 2026-09-07

- **Resolved:** published `pstack-codex` from this authored-skills repo while the agents repo retains only the external Pstack reference. The adapter, session-mode hook, and six tests passed structural validation and runtime link checks. Python bytecode remains ignored. No follow-up remains for this slice.

- **Resolved:** `thread-homebase` audit fixes passed formatting and structural validation; the requested task was notified to reload the method.

- **Decision:** simplify `thread-homebase` after the approved audit: retain exact titles, owner distinctions, and evidence-based status; remove automatic task lifecycle changes, duplicated heartbeat instructions, and embedded review cadence. Send the validated update to task `01a04126-4e46-75c0-bf6f-bb4b8bb2ffb0`.

- **Correction:** Callum rejected the fixed model hierarchy and the subsequent advisor-only interpretation. Astra should judge the work and delegate to any suitable model, including Astra. Simplify the skill using Eric's Mind note; preserve useful handoff context and completion responsibility without a staffing recipe.

- **Resolved:** the skill and provenance now live here, with a README entry. The documented linker passed its topology check for Codex, Claude, and Cursor. The former source path is now the registry symlink, not a duplicate.
- **Decision:** Callum requested moving `orchestrate-astra`, including its provenance, from the agents registry into this canonical skills repo and making it globally available using the documented linker. This supersedes the earlier local-source exception. Next: move, catalogue, format, and link.
- **Resolved:** `ask-astra` is created, catalogued, and linked into Codex, Claude, and Cursor. Structural validation, repository formatting, and link checks passed. No additional workflow or commit introduced.
- **Decision:** add `ask-astra` as a separate, small advisor skill. Sol retains ownership; Astra gets a bounded read-only question with fresh context. Keep the approved draft without fixed effort, mandatory review loops, or extra scaffolding. Next: validate and link the canonical authored source.

## 2026-09-04

- Completed correction: `friction-to-proof` had been over-triggering on any angry technical or product complaint. Its public description, body, and README catalogue entry now limit it to anger at teammates or interpersonal workplace conflict and explicitly exclude coding, debugging, repository/tool failures, agent-process failures, and ordinary technical/product critique.
- Verification: full Prettier and the skill validator passed. Agents, Codex, Cursor, and Claude all resolve `friction-to-proof` to this exact canonical source. Repo-wide `check-links.sh` still stops on an unrelated pre-existing `narrow-react-prop-types` runtime target; this change left it untouched.

## 2026-09-02

- Added `knowledge-promotion-review`, a read-only evidence classifier for deciding whether cross-repository learning stays local or becomes a domain or cross-domain candidate. In blinded isolated replays, it matched the baseline on an easy deterministic-fix case and materially improved a harder cross-domain case by requiring guided/unguided behavioral testing, a counterexample, and artifact inspection before promotion.

## 2026-08-31

- Added a Codex-only compatibility layer for pstack model routing and collaboration-agent calls. Cursor continues to own its generated `~/.cursor/rules/pstack-models.mdc`; third-party pstack bodies and installations remain untouched. A fresh isolated Codex `/how` request automatically loaded both `pstack-codex` and `how`, then selected `gpt-5.6-luna` at `high` for the hypothetical explorer without spawning agents or changing the fixture.
- Added thread-scoped Poteto persistence for Codex through an idempotently installed `UserPromptSubmit` hook. State is keyed by Codex session and records `active` or `inactive`; the inactive tombstone overrides earlier injected context. Separate threads remain untouched.
