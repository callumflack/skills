---
name: plan-dispatch
description: Starts authorized work from a ready plan in the current task or an explicitly requested separate task, then follows the result.
---

# Dispatch work

Read `../plan-spec/SKILL.md` first. Read the ready plan and repository profile; verify the first slice, current Git state, ownership, dependencies, and completion target against live sources. Act on the user's authorized scope. By default, execute the slice in the current task. Keep the user's branch or dirty-worktree preference; create an isolated worktree only when the task or repository convention calls for it.

If the user explicitly requests a separate Codex task, use the host's `create_thread` tool after selecting the actual project. If the user or applicable repository guidance explicitly requests subagents, use the available collaboration tools with disjoint file ownership and tell workers to preserve each other's changes. Parallelize only independent owners. A single ordinary slice stays direct. Choose a suitable model only when delegation is requested; no fixed model hierarchy is needed.

Give the worker or new task the plan contents, current and intended open path, bounded scope, write exclusions, agreed local/PR/deployment target, verified commands, dependencies, and actual acceptance evidence. When delegating, the coordinator alone moves and updates the plan. Dispatch succeeds only after the task is created or work starts; then move the plan to `open/` and record the real task, branch, or PR. Follow progress using the host's `wait_threads` or collaboration wait tools, inspect output and completion evidence, and keep the plan's next action current. Starting a task is not completion. This workflow does not expand authorization to commit, push, merge, deploy, or message others.
