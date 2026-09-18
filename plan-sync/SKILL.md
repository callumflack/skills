---
name: plan-sync
description: Reconciles a plan with live task, Git, PR, check, acceptance, and deployment evidence.
---

# Sync a plan

Read `../plan-spec/SKILL.md` first. Read the plan and repository profile, then verify the task output, current head and diff, scoped acceptance checks, and PR state. When GitHub CLI is available, useful read-only commands are `gh pr view "$pr_url" --json number,url,state,isDraft,headRefOid,baseRefName,mergedAt,mergeCommit,statusCheckRollup`, `gh pr diff "$pr_url" --name-only`, and `gh pr checks "$pr_url"`. Compare the head and changed paths with the plan's actual outcome. Treat a stale PR body as historical prose.

Inspect the relevant implementation with `gh pr diff "$pr_url"` or the delivered source; matching filenames is insufficient. Trace each acceptance criterion to evidence and check for subsequent reverts when reconciling merged work.

Update the plan and any links affected by its move: record real decisions, completed work, remaining work, blockers, and the next action. Move to `done/` only when the agreed completion target is proved and the user accepts it. A local-reviewed target needs actual acceptance; a deployed target needs evidence from the intended route and environment. A merge does not prove deployment. Do not infer user review from silence or ask again when acceptance already appears in the conversation.

A closed unmerged PR does not automatically mean discarded. If a regression or revert invalidates the outcome, reopen the same plan and show what remains. Move to `discarded/` only for accepted abandonment or supersession, with the reason and replacement. Refresh repository references after moving the file. This skill makes no remote mutations and grants no Git delivery action.
