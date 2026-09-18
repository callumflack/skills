# Origin of the plan skills

Primary design reference: Fatih Arslan's [How I manage my agents — Recap](https://arslan.io/2026/09/11/how-i-manage-my-agents/#recap), published 2026-09-11. Callum supplied the prompt below and requested its verbatim retention on 2026-09-18.

Use this reference when creating, revising, or assessing the plan skills. Its governing design principle is to derive the workflow from Callum's observed habits, giving those habits priority over the author's setup. The quoted prompt records the original authoring request; ordinary plan operations follow `plan-spec` and the repository profile without restarting that research.

## Original prompt, verbatim

<!-- prettier-ignore-start -->

> Read https://arslan.io/2026/09/11/how-i-manage-my-agents/ in full. Then look at how I actually work before you write anything: go through my last three months of commits and pull requests, the issues or tickets I opened and closed, and, if you can reach them, the chat channels where I ask for work and report on it.
>
> Write down what repeats: how I phrase a task, what I check before I call something done, which mistakes I correct more than once, and where my work waits on other people. From that, create the plan skills from the post (plan-init, plan-add, plan-write, plan-dispatch, plan-status, plan-sync, plan-retro), plus a plan-spec skill that holds the folder layout and the plan file format the others read first, as skill files in my Cursor skills folder, written for my habits and not for the author's: my folder names, my commit and PR format, the checks I run, the people and systems my plans depend on.
>
> Keep each skill under two pages, in plain English, and name the exact commands it runs. Where my history shows I do something differently from the post, follow my history. When you are done, walk one made-up plan through the whole loop so I can see them work together, then stop. Commit nothing until I have read it.

<!-- prettier-ignore-end -->

## Initial derivation

The [originating task](codex://threads/01a0b1c2-01b7-70d1-b0b0-434e47b6248d) began with Unity Surfaces ideas getting lost across conversations. After Callum supplied the recap, it reviewed June–September 2026 work and authored the eight skills. The [dated findings and fictional walkthrough](/Users/callumflack/Repos/vana-com/unity-surfaces/docs/agents/2026-09-18-plan-workflow.md) record coverage, evidence-to-rule decisions and verification limits. That local evidence link is provenance on Callum's Mac, not a runtime dependency.

The initial evidence is concentrated in Unity/Vana work. Shared skills own the lifecycle; repository profiles own commands, people, systems and delivery conventions. The package is authored in Callum's skills repository and linked into his agent runtimes. The walkthrough exercised the local loop in a temporary repository; remote dispatch, PR reconciliation, deployment and broader cross-repository calibration remain unproved by that walkthrough.
