---
name: plan-spec
description: Defines the shared format and lifecycle for repository plans when capturing, preparing, doing, or closing work across sessions.
---

# Plan specification

A plan preserves one intended outcome and its next executable step when work will outlive the current conversation. Normal small fixes completed in one session need no plan.

When creating, revising, or assessing the plan skills, read [Arslan's original recap prompt and the derivation record](references/origin.md) first. It is the primary design reference: derive the workflow from Callum's observed habits. The shared operating rules are below; each repository supplies its local conventions.

Read the repository's `AGENTS.md` for the scopes entered and its `plans/README.md` if present. The repository profile owns its commands, checks, delivery conventions, and any local exceptions. This skill owns only the shared plan shape and lifecycle. Preserve read-only, no-commit, dirty-worktree, and other user boundaries. A plan never grants permission to implement, commit, push, merge, deploy, or send messages.

In a Git repository, establish the owner with `git rev-parse --show-toplevel`; inspect `git status --short`, `git diff --stat`, `git diff --cached --stat`, and `git branch --show-current` before plan writes or execution. List plans with `rg --files plans`. In a non-Git workspace, use the user-selected directory and say which Git evidence is unavailable. Planning skills do not install missing tooling.

## One file, one outcome

Use `plans/<status>/<short-slug>.md`. Keep the same file and slug as it moves. Add an area prefix only when it resolves ambiguity. Search existing plans before creating one, and append evidence to a plan for the same outcome. Do not bulk-migrate older documents or maintain a second status index or YAML status. The folder is status:

| Folder | Meaning |
| --- | --- |
| `drafts/` | Worth keeping; open questions or approach remain. |
| `next/` | First bounded change, owner, dependencies, decisions, and completion check are clear. |
| `open/` | Work on the agreed scope has started. |
| `done/` | Agreed completion check passes and the user accepts the outcome; code has merged unless local-only completion was agreed. |
| `discarded/` | The user drops the outcome or accepts a superseding replacement. |

Blocked work stays in its current folder with the blocker owner or artifact and the action that unblocks it. Move back to `drafts/` when the approach needs rethinking. Reopen the same plan when its claimed outcome proves incomplete; a distinct follow-up gets a new plan. Move files without staging or committing unless the user separately authorizes Git delivery. Refresh repository links to a moved plan.

## Content that earns its place

Start with one sentence stating the practical outcome. A cheap draft needs only `# Title`, `## Why`, `## Sources`, and `## Next`. In Why, separate observed feedback from a proposed cause or solution; label a hypothesis if useful. Sources link the actual issue, PR, research, conversation, or artifact. Next names the next question or action. Do not manufacture dates or proof.

Before moving to `next/`, add:

- **Scope:** first bounded change, owning surface and write boundary, plus external dependencies.
- **Decisions:** chosen approach and material tradeoffs. Mark earlier decisions or questions **resolved** or **superseded** with the replacement; preserve why the change happened.
- **Remaining work:** short checkboxes for reviewable results, with the first vertical slice clear.
- **Done when:** observable acceptance and the explicitly agreed completion target: local, reviewed, merged, or deployed. Do not substitute one state for another.
- **Verification:** actual commands with working directory, plus the real route, state, and viewport for visible UI when relevant. Confirm commands exist before writing them.
- **Working context:** current task, branch, and PR links only once they exist.

The section names may follow a repository's local profile. Keep intention, decisions, and remaining work in the plan; link code, tests, ADRs, research, and proof at their existing owners rather than copying them. One plan can evolve from rough observation to accepted result. At handoff, leave the next action and any blocker unambiguous. At closure, record outcome evidence and acceptance without claiming that an idle task, green test, merged PR, or preview automatically proves deployment.
