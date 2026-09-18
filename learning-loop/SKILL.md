---
name: learning-loop
description: Runs a bounded learning loop (LL) from worklogs, commits, corrections and successful work into the owning decisions and checks. Use to accrue learnings, carry lessons into future agent work, or revisit whether an earlier learning repair helped.
---

# Learning Loop · LL

The goal is better work next time, with fewer interventions from the user: a subsequent agent finds and correctly applies the decision without the user repeating it. Assess correctness and repeated intervention together in later comparable work; completing a retrospective or writing guidance does not establish this outcome.

What did we learn? Why was it not already carried forward? What smallest change would carry it into the next relevant task?

Run this global procedure in the current work's scope. The working project owns its decisions; the skill's global availability grants no authority to edit other repositories or global policy. Follow the user's existing authorization: assessment requests stay read-only; requests to apply improvements proceed through the authorized repairs.

## 1. Bound the evidence

Resolve the working owner and its instructions. Use the requested date, commit range or task; state the boundary when inferred. Read the relevant worklog entries, actual diffs, source evidence and current code, standards and checks. Distinguish committed, staged and unstaged work. Reconcile superseded steers against explicit acceptance and current implementation.

Finish with a bounded source set and allowed destinations. Preserve unrelated work.

## 2. Find the learning and the gap

Look for successful decisions as well as repeated or costly corrections. For each useful finding, identify the evidence, the decision worth retaining, and what the next agent should do differently. Check whether the current owner already carries it.

Classify the carry-forward gap before choosing a repair:

| Evidence | Repair to consider |
| --- | --- |
| New accepted knowledge | Encode the decision in its nearest durable owner |
| Existing decision not encountered | Repair the task-entry pointer or discoverability |
| Decision encountered but misunderstood | Clarify the distinguishing example or applicability boundary |
| Decision understood but execution/proof unfinished | Complete or repair the existing execution/check path |
| Already implemented and discoverable | Record as already covered |
| Unresolved product/data choice | Retain a todo with its source owner |

If the trace cannot establish the cause, label it uncertain and name the discriminating evidence. A recurrence alone does not establish missing guidance. For a successful approach, retain why it worked and where it would be inappropriate.

## 3. Apply the smallest authorized repair

Choose the owner by the lesson's subject. Put enforceable invariants in code, types or checks; accepted product or design decisions in the existing standard or component; retrieval fixes at the relevant agent entry point. Preserve named content ownership. A correction to agent behavior does not authorize rewriting someone else's product scope.

Read the destination's instructions and current contract, then make the authorized change. Prefer clarifying or replacing the owning rule over adding another copy. Existing code and checks may already be sufficient. Keep unresolved tasks separate from governing decisions.

Recording an explicitly accepted local decision is ordinary maintenance. For broader promotion or newly proposed behavioral guidance, use `knowledge-promotion-review` when available and the destination's promotion rules; retain unproved generalizations as candidates. Complete authorized local work even when broader promotion remains open.

## 4. Check the repair and its next encounter

Run the destination's real checks and inspect the result. Trace a realistic next task from its entry instructions to the repaired owner. Distinguish a valid link, an agent actually encountering the rule, correct application, and an improved outcome. Claim only the stages observed.

Use an independent realistic task to test newly proposed behavioral guidance, including a case where it should not apply, before claiming behavioral improvement. Formatting or reviewer agreement establishes neither application nor effectiveness. Keep pending field evidence explicit rather than manufacturing work to clear it.

## 5. Leave the loop recoverable

Report **lesson → diagnosed gap → repair/destination → proof**. Give each finding a disposition: applied, already covered, rejected or deferred; distinguish an applied candidate from a promoted rule. In review-only work, report proposed repairs without implying they were applied.

For writable work, use the existing owner worklog only for unresolved follow-through: what future event would test this repair and which artifact/check to inspect. Keep implementation facts in their owners. An all-covered or rejected pass can finish without edits.

At the next LL invocation, inspect relevant earlier repairs for recurrence, successful reuse and new friction. Absence of recurrence matters only if a comparable task occurred. Stop after the bounded pass; continuing the loop means using subsequent work as evidence, not scheduling runs or generating a new registry.

## Assessing the loop itself

When repairs repeatedly fail to carry forward, or the user asks to evaluate or change the learning method, read the [LL assessment playbook](../../playbooks/playbooks/learning-loop.md). If the sibling checkout is absent, locate `playbooks/learning-loop.md` through workspace routing or the configured Playbooks library. The execution steps above are self-contained; report unavailable assessment guidance when that branch needs it.

The playbook owns diagnosis across repeated uses and criteria for revising the loop. This skill owns one run. A repo's standards, code and checks own its learned decisions.

Example: “Run LL for yesterday's work. Apply accepted repo-local improvements and leave them uncommitted.”
