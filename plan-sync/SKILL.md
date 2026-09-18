---
name: plan-sync
description: Reconciles an existing plan when the user reports or evidence shows a relevant PR merged, or when plan sync is requested; preserves read-only requests.
---

# Sync a plan

Read `../plan-spec/SKILL.md` first. A user report or verified observation of a relevant merge triggers reconciliation during authorized writable work; no separate invocation is needed. For status-only, read-only or excluded plan paths, report the needed update without writing. Find the existing plan by its outcome, PR or working context; a merge alone does not justify creating a plan.

Read the plan and repository profile, then verify the task output, current head and diff, scoped acceptance checks, and PR state. When GitHub CLI is available, useful read-only commands are `gh pr view "$pr_url" --json number,url,state,isDraft,headRefOid,baseRefName,mergedAt,mergeCommit,statusCheckRollup`, `gh pr diff "$pr_url" --name-only`, and `gh pr checks "$pr_url"`. Compare the head and changed paths with the plan's actual outcome. Treat a stale PR body as historical prose. If verification is unavailable, attribute the merge report and record the evidence gap; do not invent a timestamp, commit or completed check.

Inspect the relevant implementation with `gh pr diff "$pr_url"` or the delivered source; matching filenames is insufficient. Trace each acceptance criterion to evidence and check for subsequent reverts when reconciling merged work.

Update the plan now, even if it cannot close: record the merge evidence, actual delivered scope, completed and remaining work, blockers, and next action. Replace stale pre-merge instructions. A partial delivery stays open for requirements of the same outcome; accidentally bundled future outcomes follow plan-spec's split rule, with none silently dropped.

Move to `done/` when the delivered scope matches the plan and its agreed Done when is satisfied. For a merged-delivery target, a matching merge and the agreed checks suffice; do not add another user sign-off. If Done when requires user acceptance, verify it from the conversation; a deployed target needs evidence from the intended route and environment. A merge does not prove deployment or visual acceptance. Do not infer user review from silence or ask again when the required acceptance is already recorded.

If the user explicitly defers visual review until after merge, record that decision and the later review action, naming the intended route/environment and reviewer. Do not repeat a pre-merge review gate or mark the review passed. If visual acceptance remains part of Done when, keep the plan open with review as the next action; deferral alone does not waive that requirement. If Done when is already satisfied and review is a follow-up, close the plan and preserve the pending review in a linked follow-up.

A closed unmerged PR does not automatically mean discarded. If a regression or revert invalidates the outcome, reopen the same plan and show what remains. Move to `discarded/` only for accepted abandonment or supersession, with the reason and replacement. Refresh repository references after moving the file. This skill makes no remote mutations and grants no Git delivery action.
