---
name: plan-optimizer
description: >-
  Harden a plan in one honest pass: build an explicit rubric, run one adversarial critique against it, rewrite once to fix the top weaknesses. Optionally generate 3 structurally different framings first and pick the strongest skeleton. Use when the user wants to refine, stress-test, or "make the best version" of a plan — project plans, rollout plans, implementation plans, research plans, proposals. Trigger on "improve this plan", "find the holes", "make this bulletproof", or when the user shares a draft and asks "is this good?".
---

# Plan Optimizer

One pass, not a loop. Rubric → critique → rewrite. The critique and the rewrite are separate acts because judging and generating use different muscles; that separation is where the value is. There is no scoring loop: a model grading its own rewrites in one context will reliably produce a climbing number whether or not the plan improved, so numeric trajectories are theater. The oracle for a plan is the rubric, the user, and the domain docs — not a self-assigned score.

## Step 0 — Decide the skeleton (optional, only when the framing is in doubt)

If the plan's basic structure might be wrong — not just its details — generate **3 genuinely different framings** first (different architectures, orderings, or theories of the problem, not minor variants). Compare them against the rubric criteria in prose, pick the strongest skeleton, and say in one line why it beat the others. Skip this entirely when the framing is already settled; it's for structural doubt, not ritual.

## Step 1 — Build the rubric

Before touching the plan, write the rubric. Derive criteria from what would make _this_ plan succeed or fail, not a generic checklist. Prefer criteria checkable against something objective: does every phase have an exit condition? is there a named first action? is the rollback step present? Most plans are judged on some mix of:

- **Goal clarity** — is "done" unambiguous and checkable?
- **Completeness** — is anything load-bearing missing?
- **Sequencing & dependencies** — right order, prerequisites named?
- **Feasibility** — realistic given time, people, constraints?
- **Risks & mitigations** — real failure modes named, with contingencies?
- **Specificity** — owners, dates, concrete first step?

Weight them for this task and show the rubric to the user if "good" is ambiguous — their priorities (speed vs. thoroughness, risk appetite) set the weights. Where a criterion depends on facts only the user or the domain docs hold, flag it as a question rather than guessing.

## Step 2 — Critique (adversarial, against the rubric)

Go criterion by criterion and try to make the plan fail. Be concrete: "no rollback step for the migration", not "could be more robust". For each weakness, name the criterion it violates and what fixing it would look like. Order the list by how much each weakness actually costs — a missing rollback outranks a vague heading. If the critique surfaces a question only the user can answer, list it; don't invent the answer.

## Step 3 — Rewrite (once)

Produce one new full version that directly fixes the critique's top items while preserving what was already strong. Improvements must change substance — a named risk, a fixed dependency, an added exit condition — not formatting. Bigger and prettier is not better. Do not regress a strength to chase a weakness.

If the rewrite still fails a rubric criterion and you can see why, say so plainly instead of running another round: either the fix needs information you don't have (ask), or the framing is wrong (offer Step 0).

## Step 4 — Output

1. **The rewritten plan**, clean and ready to use — lead with it.
2. **What changed and why** — the 2–3 biggest substantive fixes, each tied to the rubric criterion it repaired.
3. **Open questions** — anything the critique surfaced that only the user or the domain docs can settle. These are the real next iteration, not another self-graded pass.

## Pitfalls

- **Self-scoring.** Do not assign numeric scores or show score trajectories. They perform improvement; they don't measure it.
- **Reformatting masquerading as improvement.** If the rewrite changed structure but no substance, the critique was weak — redo the critique, not the rewrite.
- **Looping.** One critique→rewrite pass captures nearly all the gain. If the result still feels weak, the bottleneck is missing information or a wrong framing — escalate to the user or to Step 0, don't grind rounds.
- **A rubric that can't see the problem.** If the plan satisfies the rubric but still feels off, fix the rubric: add the missing criterion, then re-critique once.

## Amplifiers

Two things multiply this skill's yield; both proven in field use:

- **Don't let the author grade its own draft.** Run the critique — or a from-scratch redo for comparison — in a fresh agent context that did not produce the artifact under test. Same-context self-critique anchors on the draft and performs improvement rather than finding it.
- **Verify, don't trust, the critique.** For implementation plans, check every "this input/producer exists" claim — in the draft and in the critique — against the named code symbol before merging fixes. A claimed producer that doesn't exist is the highest-value find.
