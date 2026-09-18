---
name: plan-retro
description: Reviews completed or discarded plans against task and PR evidence to identify a small durable process correction.
---

# Review the result

Read `../plan-spec/SKILL.md` first. Read the relevant `done/` or `discarded/` plan, repository profile, and source task, PR, or outcome artifact. Compare the intended result and completion target with what actually shipped or stopped. A PR body, local screenshot, merged commit, and deployed route are different evidence. Name gaps without filling them with inference.

Look for a repeated or costly correction, then propose the smallest owning rule or check that would have caught it. For example, fixture-only proof may need a live route check before claiming auth behavior; an external dependency may need a specific contract or artifact, while merely waiting for a numbered PR may be unnecessary. Keep one-off surprises as observations, not new ceremony. Suggest a concrete owner and a narrow validation command when evidence supports it.

Default to a read-only proposal. Do not automatically edit global instructions, skills, or unrelated repositories. Report the practical lesson and whether the plan's outcome evidence still supports its folder status.
