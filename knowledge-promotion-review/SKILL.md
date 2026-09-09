---
name: knowledge-promotion-review
description: Review evidence from project work, documentation, or repeated agent friction and decide whether it should stay local, become a domain candidate, or become a cross-domain candidate. Use before promoting reusable knowledge, playbooks, skills, checks, or agent guidance across repositories.
---

# Knowledge Promotion Review

Treat observations as evidence until an owner deliberately promotes them. This skill reviews promotion candidates; it does not capture them or make them govern future work.

Remain read-only by default. A request to review evidence does not authorize edits to repositories, knowledge bases, skills, policy, or agent configuration.

## Establish The Evidence Boundary

Before assessing a candidate, identify:

- source repository, artifact, date or revision, and owner
- the local problem or repeated friction it addressed
- the source owner's current instructions and implementation truth
- the source oracle that proved the result
- the proposed destination and the authority it would claim
- one counterexample or explicit boundary where the lesson does not apply

Treat resemblance between repositories as a lead to investigate, not evidence that their architecture, constraints, or required sequence match. Check the proposed destination's live owner and nearest oracle before recommending promotion.

If the evidence cannot establish its source owner, local result, or non-applicability boundary, keep it local and name what remains unproved.

## Classify What The Evidence Is

Do not promote every useful document into the same kind of artifact.

- **Project fact:** Current commands, architecture, contracts, state, implementation history, or delivery evidence. Keep it in the owning project.
- **Advisory reusable knowledge:** A principle, pattern, playbook, or decision aid that improves judgment without executing a workflow. It may become a domain or cross-domain candidate.
- **Executable skill:** A repeatable, triggerable procedure or capability whose sequence or specialist guidance materially changes execution. Propose a skill only when invocation and completion are clear.
- **Deterministic check:** A rule that can be proved mechanically by a test, type, lint rule, script, schema, or runtime gate. Prefer the nearest executable owner over prose.
- **Ambient policy:** A constraint that must govern broad work without explicit invocation. Propose policy only when its scope is genuinely ambient and the miss is repeated or expensive; never edit `AGENTS.md` automatically.
- **KB source or synthesis:** Provenance, interpretation, tensions, research, unresolved claims, and conceptual lineage. Keep these in the knowledge base rather than turning them into governing instructions.

A single evidence packet may route different parts to different owners. Do not duplicate volatile project facts inside reusable guidance.

## Decide The Reach

Choose the narrowest reach supported by evidence:

### Stay Local

Use when the lesson depends on one project's stack, vocabulary, architecture, commands, persisted contracts, or delivery environment; when only one occurrence exists and the general claim remains analogy; or when the source oracle has not proved the local result.

### Domain Candidate

Use when multiple independent repositories in one domain show the same decision pressure, the proposed guidance survives their local differences, and the domain has a clear owner and adoption oracle. Label it a candidate until that owner accepts it.

### Cross-Domain Candidate

Use when evidence from independent domains supports the same method or decision rule, its non-applicability boundary remains clear, and a cross-domain owner and oracle exist. Shared vocabulary or tools alone do not establish cross-domain authority.

Prefer a stronger local artifact over broader prose. A deterministic miss belongs in a check; a current fact belongs in its repository; a source or unresolved thesis belongs in the KB.

## Test Behavioral Guidance Before Promotion

Guidance that changes agent behavior must pass an independent behavioral test before it is promoted from candidate to governing material.

Use a realistic task and a fresh evaluator that has not received the intended answer, suspected failure, or proposed wording. Compare behavior with and without the candidate guidance when practical. Test against both a fitting case and the counterexample or non-applicability boundary. Judge observable decisions and artifacts using the destination's real oracle, not whether the evaluator repeats the guidance.

If an independent test cannot be run, keep the guidance explicitly at candidate status and state the missing gate. Do not substitute self-review, prose agreement, or a source-project success for this test.

## Report The Verdict

Return a concise review containing:

- verdict: stay local, domain candidate, or cross-domain candidate
- classification and proposed owner
- source evidence and oracle
- reusable claim stripped of volatile local facts
- counterexample or non-applicability boundary
- independent behavioral-test status when guidance changes agent behavior
- nearest adoption oracle
- unresolved evidence needed for promotion

Keep candidate, promoted, and governing status distinct.

## Mutation Boundary

Only mutate a destination when the user explicitly authorizes that write. Before editing, read the nearest owner's instructions and name allowed writes, forbidden surfaces, and the done gate.

For durable capture, hand the accepted verdict and evidence packet to `knowledge-handoff`; do not reproduce its capture workflow here. Do not invoke or imitate an external continual-learning system, auto-edit policy, or scatter the same lesson across repositories.
