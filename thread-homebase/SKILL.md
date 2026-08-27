---
name: thread-homebase
description: Review and prioritise Codex tasks from one homebase thread. Use when the user wants to inspect active work, recover forgotten tasks, or renegotiate priorities across projects.
---

# Thread homebase

Use the Codex task registry as the source of truth. This is a work-triage report, not a project-status reconstruction.

## Report

- Include active tasks and the 6–12 most recently updated non-archived Codex tasks. Do not list every old task unless the user asks.
- Put active work first. For each task, link its exact thread ID as `codex://threads/<thread-id>`, then give the parent project from its working directory, current WIP or purpose, and registry status.
- Keep each row or line short enough to scan. The title is not a substitute for the purpose.
- Do not infer that `idle` or `not loaded` means completed. Say only what the registry or the task's recent content proves.
- End with a proposed 1–3 priorities only when the user is deciding what to do next.

## Outliers

When asked, or on an alternating-day review, add an `Outliers` section. Include only tasks that appear stale, abandoned, blocked, or without a discernible outcome. Give one concrete reason for each. Do not pad the section when none qualify.

## Automation and continuity

Keep schedule and notification settings in a heartbeat automation, not in this skill. Copy this report contract into the heartbeat prompt so it works even if skills are not loaded automatically.

Treat the homebase task as a short-lived coordination space. When old decisions and check-ins obscure current work, start a fresh homebase task and archive the old one. The skill carries the method forward.
