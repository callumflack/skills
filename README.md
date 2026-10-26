# Callum's Agent Skills

Portable agent skills I actually use.

The commands below are for installing on other machines. On my authoring machine, use [`scripts/link-skills.sh`](scripts/README.md) to expose this canonical checkout to agent runtimes.

[![skills.sh](https://skills.sh/b/callumflack/skills)](https://skills.sh/callumflack/skills)

```sh
npx skills@latest add callumflack/skills
```

## Specification

These skills specify different layers of a change before implementation.

- **[`ui-grammar`](ui-grammar/SKILL.md)**. Describe or design a React UI through its visual vocabulary, JSX tree, ownership, constraints, states, actions, effects, and proof. See [prompt examples](ui-grammar/README.md) for turning a visual correction into a reusable design-system relationship.
  ```sh
  npx skills@latest add callumflack/skills --skill ui-grammar
  ```
- **[`code-stacks`](code-stacks/SKILL.md)**. Specify how a chosen change fits into live code through types, boundaries, call flow, composition, and proof oracles.
  ```sh
  npx skills@latest add callumflack/skills --skill code-stacks
  ```

For UI work, start with [`ui-grammar`](ui-grammar/SKILL.md). Use [`code-stacks`](code-stacks/SKILL.md) only when the implementation path still needs concrete structure. For non-UI work, use [`code-stacks`](code-stacks/SKILL.md) directly.

## Planning and execution

- **[`orchestrate-astra`](orchestrate-astra/SKILL.md)**. Use Astra to orchestrate work and delegate to whichever model fits the assignment.
  ```sh
  npx skills@latest add callumflack/skills --skill orchestrate-astra
  ```
- **[`ask-astra`](ask-astra/SKILL.md)**. Consult Astra as a read-only advisor while the calling agent retains task ownership.
  ```sh
  npx skills@latest add callumflack/skills --skill ask-astra
  ```
- **[`pstack-codex`](pstack-codex/SKILL.md)**. Run pstack skills in Codex without applying Cursor model slugs or Task-tool instructions literally.
  ```sh
  npx skills@latest add callumflack/skills --skill pstack-codex
  ```
- **[`thread-homebase`](thread-homebase/SKILL.md)**. Review and prioritise recent Codex work from one homebase thread without mistaking idle tasks for finished work.
  ```sh
  npx skills@latest add callumflack/skills --skill thread-homebase
  ```
- **[`atomic-commit-slicing`](atomic-commit-slicing/SKILL.md)**. Isolate one approved change from a dirty Git worktree without absorbing unrelated staged, unstaged, or untracked work.
  ```sh
  npx skills@latest add callumflack/skills --skill atomic-commit-slicing
  ```
- **[`human-first-linear`](human-first-linear/SKILL.md)**. Explain, draft, or rewrite Linear issues so the human problem and solution come first without turning read-only requests into edits or deleting unique operational detail.
  ```sh
  npx skills@latest add callumflack/skills --skill human-first-linear
  ```
- **[`build-loop-plan`](build-loop-plan/SKILL.md)**. Turn a spec or PRD into a local `.scratch` implementation plan with executable slices, evidence gates, and closeout rules.
  ```sh
  npx skills@latest add callumflack/skills --skill build-loop-plan
  ```
- **[`ralph-iteration`](ralph-iteration/SKILL.md)**. Run one Ralph planning or build iteration from project prompts, requirements, plans, and backpressure files.
  ```sh
  npx skills@latest add callumflack/skills --skill ralph-iteration
  ```

## Code quality

- **[`react-feature-composition`](react-feature-composition/SKILL.md)**. Guide React/Next feature composition before implementation and during reshaping: route/runtime boundaries, services, selectors, controller hooks, presentation models, layout/view ownership, and focused effects.
  ```sh
  npx skills@latest add callumflack/skills --skill react-feature-composition
  ```
- **[`react-build-lens`](react-build-lens/SKILL.md)**. Select the smallest React lens when multiple React/framework/data skills or oracles could apply; classify diff-scoped findings as PR risk/follow-up/noise, use React Doctor as high-signal evidence, and skip React Native/Expo.
  ```sh
  npx skills@latest add callumflack/skills --skill react-build-lens
  ```
- **[`codebase-design-axes`](codebase-design-axes/SKILL.md)**. Give each variant axis one owner when adding a second state, mode, provider, or other sibling. Companion to `codebase-design`.
  ```sh
  npx skills@latest add callumflack/skills --skill codebase-design-axes
  ```
- **[`bug-repro-test-first`](bug-repro-test-first/SKILL.md)**. Start bug work by writing a failing regression test before changing production code.
  ```sh
  npx skills@latest add callumflack/skills --skill bug-repro-test-first
  ```
- **[`cognitive-load`](cognitive-load/SKILL.md)**. Review code for working-memory overload: complex conditionals, shallow abstractions, needless indirection, poor naming, and over-compressed DRY.
  ```sh
  npx skills@latest add callumflack/skills --skill cognitive-load
  ```

## Knowledge workflow

Ordinary work is completed by the always-on outcome rule and the destination's real completion check. Include the dependent updates needed to make the requested result usable. `/so-what` makes the practical result, consequence and next action clear; it does not substitute for execution. When a settled correction can be checked mechanically, `/learning-loop` puts a rejection check at its local owner.

Use `/learning-save` to preserve findings, `/learning-loop` to carry lessons into subsequent work, and `/learning-playbook` to assess broader reuse. Choose by the finding and its next use. These are conditional phases; a saved research note need not become governing guidance.

| Phase | Use | Result and owner |
| --- | --- | --- |
| Learning save | `learning-save` when useful research or conversation knowledge should survive | A sourced note in the established KB, linking adequate project owners; automatic invocation requires the user's standing capture rule and destination permission |
| Learning loop | `learning-loop` when accepted decisions, successful work or costly misses need to carry forward | The smallest authorized repair at the project's document, code or check, followed by observation in subsequent comparable work |
| Task-triggered reading | The instruction-placement rule when future work needs that reading | A short trigger and pointer in the narrowest applicable `AGENTS.md`; details stay at their owner |
| Learning playbook | `learning-playbook` before extending a lesson across projects | A read-only verdict about reach and artifact type; Playbooks, skills, checks and governing rules follow their own adoption authority |

Saving preserves evidence; promotion decides whether broader guidance is warranted. A valid document or pointer is an intermediate result. Subsequent work must establish encounter, correct application and benefit. Keep pending evidence at its existing owner.

- **[`so-what`](so-what/SKILL.md)**. Answer "so what?" with the main point, what it means, and the concrete next action.

  ```sh
  npx skills@latest add callumflack/skills --skill so-what
  ```

- **[`learning-loop`](learning-loop/SKILL.md)**. Run LL: carry lessons from worklogs, commits and successful work into their owning decisions and checks, then inspect whether they help subsequent work.
  ```sh
  npx skills@latest add callumflack/skills --skill learning-loop
  ```
- **[`learning-save`](learning-save/SKILL.md)**. Capture durable knowledge from long chats, sources, and knowledge-work threads directly into the user's established KB, or ask for a local folder when it is unavailable.
  ```sh
  npx skills@latest add callumflack/skills --skill learning-save
  ```
- **[`interrogate-claim`](interrogate-claim/SKILL.md)**. Pressure-test a strategy note by locating its claim, level, burden, objection, and next question before responding.
  ```sh
  npx skills@latest add callumflack/skills --skill interrogate-claim
  ```
- **[`interrogate-idiom`](interrogate-idiom/SKILL.md)**. Mine a reusable idiom by locating the scene it organizes, the pressure it defers, and the exchange value it can carry.
  ```sh
  npx skills@latest add callumflack/skills --skill interrogate-idiom
  ```
- **[`claim-rubric`](claim-rubric/SKILL.md)**. Locate the claim inside a note and turn it into a stronger title.
  ```sh
  npx skills@latest add callumflack/skills --skill claim-rubric
  ```
- **[`claim-diagram-card`](claim-diagram-card/SKILL.md)**. Create mnemonic diagram cards for KB Claim notes: simple ASCII plus a rough handwritten illustration embedded at width 600 and kept under 1MB.
  ```sh
  npx skills@latest add callumflack/skills --skill claim-diagram-card
  ```
- **[`learning-playbook`](learning-playbook/SKILL.md)**. Review cross-repository evidence and decide whether it should stay local, become a domain candidate, or become a cross-domain candidate.
  ```sh
  npx skills@latest add callumflack/skills --skill learning-playbook
  ```

## Sensemaking

- **[`reframe`](reframe/SKILL.md)**. Develop a useful reframe from Callum’s prompt-framing collection and fitting experience; select and work through a perspective with the agent, the human or both, including what has become worth building.

  ```sh
  npx skills@latest add callumflack/skills --skill reframe
  ```

- **[`curious`](curious/SKILL.md)**. Follow an idea through attentive particulars and imaginative possibilities; return what the exploration reveals.
  ```sh
  npx skills@latest add callumflack/skills --skill curious
  ```

Work through experience and friction to understand what is happening before deciding what to do.

- **[`friction-inquiry`](friction-inquiry/SKILL.md)**. Work through a spoken account or rough note about friction to understand the underlying issue, test your interpretation, and decide what needs further inquiry or action.
  ```sh
  npx skills@latest add callumflack/skills --skill friction-inquiry
  ```

## Archive

Retired or uncertain bodies live in [`archive`](archive/README.md). They are retained for review, not published as active skills.

## License

Original skills are MIT licensed unless a skill says otherwise.

[`cognitive-load`](cognitive-load/SKILL.md) is adapted from Artem Zakirullin's [`cognitive-load`](https://github.com/zakirullin/cognitive-load) prompt and is published with CC-BY-4.0 attribution.
