# Artifact Shapes

Use this when the user wants a reusable card, message, or diagram.

## Decision Challenge Card

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

## 10-Minute Card

```markdown
Decision:

Alarm: This is fucked because...

Cue:

Proof:

Ask:

Close condition:
```

## Team-Usable Sentence

```markdown
Here is the smallest example I found: [proof].

It shows [current decision] fails on [specific consequence] because [expert cue / load-bearing reason].

I think the current decision only works if [assumption].

I recommend changing [X] to [Y] until [acceptance test] passes.
```

## Diagram Card Seed

Use only when a portable visual helps.

```text
anger alarm -> cue -> proof -> decision change

bad loop:
raw anger -> contempt -> status fight -> no change

good loop:
raw anger -> visible miss -> concrete ask -> changed decision
```

## Proof Object Menu

Pick one. Do not make a gallery.

- Screenshot / side-by-side
- Repro
- Diff
- Prototype
- Table of cases
- Checklist against goal
- User path
- Trace / log / metric
- Concrete example

## What Changes Decisions

A proof object is stronger when it includes:

- a named current decision
- the consequence that matters
- one concrete example
- the assumption the current decision depends on
- a recommended alternative
- an acceptance test
- owner or deadline when execution matters
