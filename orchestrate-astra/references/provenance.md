# How this skill got here

## Sources

- Eric Provencher, [Rethinking skills and prompts for GPT-6 Astra](https://x.com/pvncher/status/2095991462416490862), published 2026-09-04.
- [Full local capture](</Users/callumflack/Workspaces/Personal/repos/kb-2026/raw/@pvncher — Rethinking skills and prompts for GPT-6 Astra E6.md>).
- [Wiki summary](</Users/callumflack/Workspaces/Personal/repos/kb-2026/wiki/Eric Provencher — Rethinking skills and prompts for GPT-6 Astra — Summary E6.md>).
- [Source-summary task](codex://threads/01a079d3-7f15-7d63-b6fc-4f992dba5ae0).
- [Discussion and implementation of this arrangement](codex://threads/01a079d8-fc2a-7a22-ac48-79b8ad4370a0), 2026-09-07.

## What we took from the article

Revisit accumulated instructions when models change. Keep skill triggers precise and load references only when relevant. Replace unnecessary recipes with outcomes and judgment, while considering every model that consumes the instructions. Make safe permissions and completion boundaries explicit.

The source-summary task initially missed the article's final third. Callum required a reread: safe workflow permissions, premature stopping, and explicit completion and exploration boundaries are central to the argument.

## Callum's decision, 2026-09-07

Callum expects to use GPT-6 Astra predominantly as advisor and orchestrator, with GPT-5.6 Sol, Terra, and Luna doing execution. He wanted a simple invocation that carries the method so he does not have to remember and repeat it. Poteto Mode was an example of invocation simplicity, not a requested dependency.

We chose to extend the existing `orchestrate-astra` skill:

- Astra owns framing, difficult decisions, integration, and acceptance.
- Workers receive an outcome, owned scope, relevant context, allowed actions, and completion evidence. Astra constructs these for the task.
- Model selection starts with Luna for explicit narrow work, Terra for bounded implementation, and Sol for broader or consequential work. This mapping is our starting policy, not a benchmark result or a claim from Eric's article.
- Delegation needs a concrete benefit. Small tasks can stay with Astra.
- The wiki retains the source and interpretation. The skill owns invocation. The [harness-audit playbook](/Users/callumflack/Workspaces/Playbooks/playbooks/audit-agent-harness.md) owns the conditional audit method. Repositories retain their constraints, permissions, and completion checks.

## Correction after use, 2026-09-07

Callum rejected the fixed downward model hierarchy above. His preference for Astra as orchestrator/advisor was not a restriction on who could execute. Astra should judge the assignment and hand work to any suitable model, including another Astra. Turning that correction into an advisor-only route was also wrong.

Rereading [Eric Provencher's Mind note](</Users/callumflack/Workspaces/Personal/repos/kb-2026/wiki/Eric Provencher @pvncher — Mind.md>) reinforced the simpler approach: proportionate delegation, suitable reasoning effort, deliberate context inheritance, distinct ownership, explicit leaf assignments, and completion evidence. The skill now expresses that judgment without a model ladder. The earlier allocation above records how we arrived here; it no longer governs the skill.

## Evidence and open limits

The skill passed structural validation; its runtime link and added local references were checked. These checks do not prove better orchestration or optimal model allocation. The audit remains a Candidate awaiting organic baseline and guided comparisons, including a worker handoff and a case where the audit should not run.

The skill initially lived under the Git-ignored `agents/.agents/skills` registry. On 2026-09-07, Callum requested moving it and this provenance into the canonical `callumflack/skills` repository. Its `scripts/link-skills.sh` registers the authored source through `~/.agents/skills` and links Codex, Claude, and Cursor. This replaces the earlier local-source exception. Local wiki and Playbooks links above are provenance on Callum's Mac, not portable runtime dependencies.
