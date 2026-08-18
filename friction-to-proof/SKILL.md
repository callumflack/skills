---
name: friction-to-proof
description: Run an interactive protocol that channels anger-state tacit knowledge into a visible proof object and a decision-change ask. Use when the user names friction-to-proof, says they are pissed off or frustrated, says "they don't get it", or dumps irritated team/product/code/work objections that need conversion into an artifact, check, prototype, example, diagram card, or team-usable message.
---

# Friction To Proof

Anger is the sensor. Proof is the actuator. Decision change is the output.

## Rule

Do not soothe, moralize, diagnose, litigate tone, or ask angry-you to be articulate.

Preserve the alarm. Strip contempt. Test the cue. Force a visible proof object.

This is not an anger-reduction protocol. It is a decision-challenge protocol powered by anger.

If the user only names the skill, ask:

> Dump the pissed-off version. Start with: "This is fucked because..."

If the dump is already present, translate first. Ask later.

If the dump is high-heat, use the 10-minute lane first. Do not make the user fill a taxonomy.

## 10-Minute Lane

Use this when cognition is low or the user is still hot.

```markdown
Decision:

Alarm: This is fucked because...

Cue: The thing my trained eye/body noticed is...

Proof: Screenshot / repro / diff / prototype / table / checklist / user path / trace / concrete example.

Ask: Change [X] to [Y].

Close condition: We know it worked when...
```

If the user gives only a rant, infer the draft yourself, then ask for correction.

## Interactive Workflow

### 1. Pick One Live Decision

Read the raw dump for the decision or behavior being objected to.

If there are multiple misses, list at most three and ask:

> Which one is the live decision we should challenge first?

Do not continue with a bundle.

### 2. Draft the Decision Challenge Card

Return this artifact:

```markdown
## Decision Challenge Card

Decision at stake:

Current decision:

Alarm: I think this fails on...

Expert cue: The thing I am noticing is...

Smallest proof:

Current decision only works if:

Recommended change: Change [X] to [Y].

Acceptance test: We accept this when...

Owner / deadline:

Signal check: What would make me downgrade or change this read?
```

Keep each field short. If uncertain, say so.

### 3. Correct Before Polishing

Do not ask the user to explain from scratch.

Ask:

> Mark any line wrong. Keep it ugly.

Then revise the card.

### 4. Build or Name the Smallest Proof

Prefer the smallest object that makes the miss visible in under 10 minutes:

- failing example or repro
- screenshot / side-by-side
- tiny prototype
- before/after diff
- table of cases
- checklist against the stated goal
- user path / story
- trace / log / metric
- one paragraph with one concrete example

If no proof object is available yet, name the smallest observation to gather.

### 5. Draft the Team-Usable Output

Use this shape:

```markdown
Here is the smallest example I found: [proof].

It shows [current decision] fails on [specific consequence] because [expert cue / load-bearing reason].

I think the current decision only works if [assumption].

I recommend changing [X] to [Y] until [acceptance test] passes.
```

Do not write a long memo unless the user asks.

### 6. Optional Diagram Card

If the user asks for a portable visual or names `claim-diagram-card`, create a tiny memory-card shape from the card:

```text
anger alarm -> proof object -> decision change

bad loop:
contempt -> status fight -> no change

good loop:
cue -> visible example -> changed decision
```

Only use the full `claim-diagram-card` skill when updating a wiki Claim note.

## Guardrails

- Translate character judgments into decisions, behaviors, artifacts, or incentives.
- Do not make the user sound calm if the proof still needs force.
- Do not preserve insults in the team-usable output.
- Do not turn the anger into a personality analysis.
- Do not ask for recognition. Ask for a changed decision.
- If the core output is "they should respect me", route to proof: what visible miss would matter even if nobody grants special status?
- If the anger may be coming from a wound place, split without shaming:
  - decision-channel: what decision will fail?
  - wound-channel: what old threat/filter might be amplifying the read?
- Do not put the wound-channel first. First preserve the cue; then check its accuracy.
- The signal check is not self-erasure. It asks what would falsify or downgrade the read.
- Avoid "undeniable". Aim for a proof object that makes the disagreement concrete and costly to ignore.
- Always include an acceptance test, owner, or deadline when the ask needs a real decision to change.

## References

Load these only when needed:

- `references/research-basis.md` for the external research basis.
- `references/kb-origins.md` for local KB origins and the wound/filter frame.
- `references/artifact-shapes.md` for card, sentence, and diagram variants.

## Key Question

The live question is:

> What can I show them in 10 minutes that makes the miss visible enough to change the decision?
