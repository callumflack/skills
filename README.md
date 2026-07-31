# Callum's Agent Skills

Portable agent skills I actually use.

Install all active public skills:

```sh
npx skills@latest add callumflack/skills
```

## Agent defaults

- [`AGENTS-SEED.md`](AGENTS-SEED.md) is the portable personalization block: owner surface, allowed writes, forbidden surfaces, done gate, nearest oracle, source pressure, and friction-as-signal.

## Knowledge workflow

- **`interrogate-claim`**. Pressure-test a strategy note by locating its claim, level, burden, objection, and next question before responding.
  ```sh
  npx skills@latest add callumflack/skills/interrogate-claim
  ```
- **`interrogate-idiom`**. Mine a reusable idiom by locating the scene it organizes, the pressure it defers, and the exchange value it can carry.
  ```sh
  npx skills@latest add callumflack/skills/interrogate-idiom
  ```
- **`claim-rubric`**. Locate the claim inside a note and turn it into a stronger title.
  ```sh
  npx skills@latest add callumflack/skills/claim-rubric
  ```
- **`claim-diagram-card`**. Create mnemonic diagram cards for KB Claim notes: simple ASCII plus a rough handwritten illustration embedded at width 600 and kept under 1MB.
  ```sh
  npx skills@latest add callumflack/skills/claim-diagram-card
  ```
- **`knowledge-handoff`**. Capture durable knowledge from long chats, sources, and knowledge-work threads into the owning KB surface.
  ```sh
  npx skills@latest add callumflack/skills/knowledge-handoff
  ```
- **`friction-to-proof`**. Convert high-friction objections into visible proof objects and decision-change asks.
  ```sh
  npx skills@latest add callumflack/skills/friction-to-proof
  ```

## Planning and execution

- **`atomic-commit-slicing`**. Isolate one approved change from a dirty Git worktree without absorbing unrelated staged, unstaged, or untracked work.
  ```sh
  npx skills@latest add callumflack/skills/atomic-commit-slicing
  ```
- **`human-first-linear`**. Explain, draft, or rewrite Linear issues so the human problem and solution come first without turning read-only requests into edits or deleting unique operational detail.
  ```sh
  npx skills@latest add callumflack/skills/human-first-linear
  ```
- **`code-stacks`**. Draft code-shaped planning notes from types, interfaces, boundaries, composition points, call stacks, and proof oracles.
  ```sh
  npx skills@latest add callumflack/skills/code-stacks
  ```
- **`plan-optimizer`**. Harden a plan with one rubric, one adversarial critique, and one rewrite that fixes the top weaknesses.
  ```sh
  npx skills@latest add callumflack/skills/plan-optimizer
  ```
- **`build-loop-plan`**. Turn a spec or PRD into a local `.scratch` implementation plan with executable slices, evidence gates, and closeout rules.
  ```sh
  npx skills@latest add callumflack/skills/build-loop-plan
  ```
- **`ralph-iteration`**. Run one Ralph planning or build iteration from project prompts, requirements, plans, and backpressure files.
  ```sh
  npx skills@latest add callumflack/skills/ralph-iteration
  ```

## Code quality

- **`bug-repro-test-first`**. Start bug work by writing a failing regression test before changing production code.
  ```sh
  npx skills@latest add callumflack/skills/bug-repro-test-first
  ```
- **`cognitive-load`**. Review code for working-memory overload: complex conditionals, shallow abstractions, needless indirection, poor naming, and over-compressed DRY.
  ```sh
  npx skills@latest add callumflack/skills/cognitive-load
  ```
- **`react-feature-composition`**. Guide React/Next feature composition before implementation and during reshaping: route/runtime boundaries, services, selectors, controller hooks, presentation models, layout/view ownership, and focused effects.
  ```sh
  npx skills@latest add callumflack/skills/react-feature-composition
  ```
- **`react-build-lens`**. Select the smallest React lens when multiple React/framework/data skills or oracles could apply; classify diff-scoped findings as PR risk/follow-up/noise, use React Doctor as high-signal evidence, and skip React Native/Expo.
  ```sh
  npx skills@latest add callumflack/skills/react-build-lens
  ```

## Skills

- [`atomic-commit-slicing`](atomic-commit-slicing/SKILL.md)
- [`bug-repro-test-first`](bug-repro-test-first/SKILL.md)
- [`build-loop-plan`](build-loop-plan/SKILL.md)
- [`claim-diagram-card`](claim-diagram-card/SKILL.md)
- [`claim-rubric`](claim-rubric/SKILL.md)
- [`code-stacks`](code-stacks/SKILL.md)
- [`cognitive-load`](cognitive-load/SKILL.md)
- [`friction-to-proof`](friction-to-proof/SKILL.md)
- [`human-first-linear`](human-first-linear/SKILL.md)
- [`interrogate-claim`](interrogate-claim/SKILL.md)
- [`interrogate-idiom`](interrogate-idiom/SKILL.md)
- [`knowledge-handoff`](knowledge-handoff/SKILL.md)
- [`plan-optimizer`](plan-optimizer/SKILL.md)
- [`ralph-iteration`](ralph-iteration/SKILL.md)
- [`react-build-lens`](react-build-lens/SKILL.md)
- [`react-feature-composition`](react-feature-composition/SKILL.md)

## Archive

Retired or uncertain bodies live in [`archive`](archive/README.md). They are retained for review, not published as active skills.

## License

Original skills are MIT licensed unless a skill says otherwise.

`cognitive-load` is adapted from Artem Zakirullin's [`cognitive-load`](https://github.com/zakirullin/cognitive-load) prompt and is published with CC-BY-4.0 attribution.
