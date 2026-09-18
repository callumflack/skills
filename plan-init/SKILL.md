---
name: plan-init
description: Initializes a repository plans area when a user wants durable plans and a local planning profile.
---

# Initialize plans

Read `../plan-spec/SKILL.md` first. Establish the repository root, scoped instructions, current Git state, and whether `plans/README.md` already exists. Keep this operation idempotent. Use `mkdir -p plans/{drafts,next,open,done,discarded}` from the repository root; preserve existing files and their status. Put a `.gitkeep` in each newly created empty directory so Git can retain it. Do not overwrite a profile, normalize old plans, or add an index mirroring folder status.

If the profile is absent, write a short `plans/README.md` that points to the shared plan format and states this repository's actual owners, checks, and delivery conventions. Derive commands from package scripts and existing docs, and identify a real route or runtime proof where visible UI is involved. Do not copy the whole schema into the profile or invent commands. If owner or completion conventions remain uncertain, say so in the profile as a question rather than declaring a rule.

Finish by reporting the created directories/profile and any decision still needed. Initialization alone does not start implementation, open tickets, or perform Git delivery.
