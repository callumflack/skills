# Callum's Agent Skills

Portable agent skills I actually use.

[![skills.sh](https://skills.sh/b/callumflack/skills)](https://skills.sh/callumflack/skills)

```sh
npx skills@latest add callumflack/skills
```

## Specification

These skills specify different layers of a change before implementation.

- **[`ui-grammar`](ui-grammar/SKILL.md)**. Specify which React compositions are valid for product meaning, semantic state, and capability.
  ```sh
  npx skills@latest add callumflack/skills/ui-grammar
  ```
- **[`code-stacks`](code-stacks/SKILL.md)**. Specify how a chosen change fits into live code through types, boundaries, call flow, composition, and proof oracles.
  ```sh
  npx skills@latest add callumflack/skills/code-stacks
  ```

For UI work, start with [`ui-grammar`](ui-grammar/SKILL.md). Use [`code-stacks`](code-stacks/SKILL.md) only when the implementation path still needs concrete structure. For non-UI work, use [`code-stacks`](code-stacks/SKILL.md) directly.

## Planning and execution

- **[`thread-homebase`](thread-homebase/SKILL.md)**. Review and prioritise recent Codex work from one homebase thread without mistaking idle tasks for finished work.
  ```sh
  npx skills@latest add callumflack/skills/thread-homebase
  ```
- **[`atomic-commit-slicing`](atomic-commit-slicing/SKILL.md)**. Isolate one approved change from a dirty Git worktree without absorbing unrelated staged, unstaged, or untracked work.
  ```sh
  npx skills@latest add callumflack/skills/atomic-commit-slicing
  ```
- **[`human-first-linear`](human-first-linear/SKILL.md)**. Explain, draft, or rewrite Linear issues so the human problem and solution come first without turning read-only requests into edits or deleting unique operational detail.
  ```sh
  npx skills@latest add callumflack/skills/human-first-linear
  ```
- **[`plan-optimizer`](plan-optimizer/SKILL.md)**. Harden a plan with one rubric, one adversarial critique, and one rewrite that fixes the top weaknesses.
  ```sh
  npx skills@latest add callumflack/skills/plan-optimizer
  ```
- **[`build-loop-plan`](build-loop-plan/SKILL.md)**. Turn a spec or PRD into a local `.scratch` implementation plan with executable slices, evidence gates, and closeout rules.
  ```sh
  npx skills@latest add callumflack/skills/build-loop-plan
  ```
- **[`ralph-iteration`](ralph-iteration/SKILL.md)**. Run one Ralph planning or build iteration from project prompts, requirements, plans, and backpressure files.
  ```sh
  npx skills@latest add callumflack/skills/ralph-iteration
  ```

## Code quality

- **[`testing`](testing/SKILL.md)**. Choose, write, keep, or delete tests using the smallest real oracle instead of ceremony coverage.
  ```sh
  npx skills@latest add callumflack/skills/testing
  ```
- **[`bug-repro-test-first`](bug-repro-test-first/SKILL.md)**. Start bug work by writing a failing regression test before changing production code.
  ```sh
  npx skills@latest add callumflack/skills/bug-repro-test-first
  ```
- **[`cognitive-load`](cognitive-load/SKILL.md)**. Review code for working-memory overload: complex conditionals, shallow abstractions, needless indirection, poor naming, and over-compressed DRY.
  ```sh
  npx skills@latest add callumflack/skills/cognitive-load
  ```
- **[`react-feature-composition`](react-feature-composition/SKILL.md)**. Guide React/Next feature composition before implementation and during reshaping: route/runtime boundaries, services, selectors, controller hooks, presentation models, layout/view ownership, and focused effects.
  ```sh
  npx skills@latest add callumflack/skills/react-feature-composition
  ```
- **[`react-build-lens`](react-build-lens/SKILL.md)**. Select the smallest React lens when multiple React/framework/data skills or oracles could apply; classify diff-scoped findings as PR risk/follow-up/noise, use React Doctor as high-signal evidence, and skip React Native/Expo.
  ```sh
  npx skills@latest add callumflack/skills/react-build-lens
  ```

## Knowledge workflow

- **[`interrogate-claim`](interrogate-claim/SKILL.md)**. Pressure-test a strategy note by locating its claim, level, burden, objection, and next question before responding.
  ```sh
  npx skills@latest add callumflack/skills/interrogate-claim
  ```
- **[`interrogate-idiom`](interrogate-idiom/SKILL.md)**. Mine a reusable idiom by locating the scene it organizes, the pressure it defers, and the exchange value it can carry.
  ```sh
  npx skills@latest add callumflack/skills/interrogate-idiom
  ```
- **[`claim-rubric`](claim-rubric/SKILL.md)**. Locate the claim inside a note and turn it into a stronger title.
  ```sh
  npx skills@latest add callumflack/skills/claim-rubric
  ```
- **[`claim-diagram-card`](claim-diagram-card/SKILL.md)**. Create mnemonic diagram cards for KB Claim notes: simple ASCII plus a rough handwritten illustration embedded at width 600 and kept under 1MB.
  ```sh
  npx skills@latest add callumflack/skills/claim-diagram-card
  ```
- **[`knowledge-handoff`](knowledge-handoff/SKILL.md)**. Capture durable knowledge from long chats, sources, and knowledge-work threads into its owning durable-knowledge surface.
  ```sh
  npx skills@latest add callumflack/skills/knowledge-handoff
  ```
- **[`friction-to-proof`](friction-to-proof/SKILL.md)**. Convert high-friction objections into visible proof objects and decision-change asks.
  ```sh
  npx skills@latest add callumflack/skills/friction-to-proof
  ```

## Local tools

These are not planning methods. They install or drive a local binary.

- **[`roughdraft`](roughdraft/SKILL.md)**. Review Markdown plans and documents in a local app with inline comments and suggested edits, then return them to the agent for revision.
  ```sh
  npx skills@latest add callumflack/skills/roughdraft
  ```

## Skills

### Specification

- [`ui-grammar`](ui-grammar/SKILL.md)
- [`code-stacks`](code-stacks/SKILL.md)

### Planning and execution

- [`thread-homebase`](thread-homebase/SKILL.md)
- [`plan-optimizer`](plan-optimizer/SKILL.md)
- [`build-loop-plan`](build-loop-plan/SKILL.md)
- [`ralph-iteration`](ralph-iteration/SKILL.md)
- [`human-first-linear`](human-first-linear/SKILL.md)
- [`atomic-commit-slicing`](atomic-commit-slicing/SKILL.md)

### Code design and quality

- [`codebase-design-axes`](codebase-design-axes/SKILL.md)
- [`testing`](testing/SKILL.md)
- [`bug-repro-test-first`](bug-repro-test-first/SKILL.md)
- [`cognitive-load`](cognitive-load/SKILL.md)
- [`react-feature-composition`](react-feature-composition/SKILL.md)
- [`react-build-lens`](react-build-lens/SKILL.md)

### Knowledge workflow

- [`interrogate-claim`](interrogate-claim/SKILL.md)
- [`interrogate-idiom`](interrogate-idiom/SKILL.md)
- [`claim-rubric`](claim-rubric/SKILL.md)
- [`claim-diagram-card`](claim-diagram-card/SKILL.md)
- [`knowledge-handoff`](knowledge-handoff/SKILL.md)
- [`friction-to-proof`](friction-to-proof/SKILL.md)

### Local tools

- [`roughdraft`](roughdraft/SKILL.md)

## Archive

Retired or uncertain bodies live in [`archive`](archive/README.md). They are retained for review, not published as active skills.

## Documentation

- [`skills` CLI grouping research](docs/2026-08-27-skills-cli-grouping.md). How web grouping, CLI plugin groups, and the automatic `Other` section differ—and why this repository keeps the default flat installer.

## License

Original skills are MIT licensed unless a skill says otherwise.

[`cognitive-load`](cognitive-load/SKILL.md) is adapted from Artem Zakirullin's [`cognitive-load`](https://github.com/zakirullin/cognitive-load) prompt and is published with CC-BY-4.0 attribution.
