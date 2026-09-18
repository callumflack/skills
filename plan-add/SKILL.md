---
name: plan-add
description: Captures a new idea, issue, or feedback as a cheap draft plan while deduplicating existing outcomes.
---

# Add a draft

Read `../plan-spec/SKILL.md` first, then the repository plan profile and scoped instructions. From the repository root, search filenames with `rg --files plans` and relevant content with `rg -n -i -- 'topic' plans`. Check likely matches for the same intended outcome, including completed or discarded plans.

If the outcome already has a plan, add the new observation and source there. Preserve existing decisions and explicitly label any correction or reopened question. If it is new, create `plans/drafts/<short-slug>.md` with a title, one-sentence practical outcome, Why, Sources, and Next. Distinguish feedback from an inferred cause; a hypothesis can remain unresolved. Keep the raw idea cheap enough to capture without design work.

Report where it lives and its next question. Capture alone does not implement the idea, create an external ticket, or claim the plan is ready.
