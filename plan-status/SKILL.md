---
name: plan-status
description: Reports live plan progress, next executable action, blockers, and evidence gaps without changing status.
---

# Report status

Read `../plan-spec/SKILL.md` first. This is read-only. Read the relevant plan and repository profile, then verify time-sensitive claims against live Git, PR checks, task output, and the owning app when accessible. Distinguish observation from inference and old prose. If access is missing, state the gap.

Lead with the practical status in one sentence. For each requested plan, say what is active, the next executable action, and what is waiting on a person, system, or artifact. Separate local proof, review/PR state, merge state, and deployment state. Idle work does not imply done; a merged PR proves neither user acceptance nor deployed behavior by itself. If the user asks what to do next, rank one to three executable actions by unblock value and dependencies. Do not edit a plan, move its folder, or mutate Git from a status request.
