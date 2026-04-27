# Callum's Agent Skills

Portable agent skills I actually use.

Private source of truth: my KB. Public shape: curated installable exports.

## Knowledge workflow

**`note-interrogation`**. Pressure-test a strategy note by locating its claim, level, burden, objection, and next question before responding.

```sh
npx skills@latest add callumflack/skills/note-interrogation
```

**`claim-rubric`**. Locate the claim inside a note and turn it into a stronger title.

```sh
npx skills@latest add callumflack/skills/claim-rubric
```

## Code quality

**`cognitive-load`**. Review code for working-memory overload: complex conditionals, shallow abstractions, needless indirection, poor naming, and over-compressed DRY.

```sh
npx skills@latest add callumflack/skills/cognitive-load
```

**`react-feature-composition`**. Guide React/Next feature composition before implementation and during reshaping: route/runtime boundaries, controller hooks, presentation models, layout/view ownership, and focused effects.

```sh
npx skills@latest add callumflack/skills/react-feature-composition
```

## Skills

- [`claim-rubric`](claim-rubric/SKILL.md)
- [`cognitive-load`](cognitive-load/SKILL.md)
- [`note-interrogation`](note-interrogation/SKILL.md)
- [`react-feature-composition`](react-feature-composition/SKILL.md)

## License

Original skills are MIT licensed unless a skill says otherwise.

`cognitive-load` is adapted from Artem Zakirullin's [`cognitive-load`](https://github.com/zakirullin/cognitive-load) prompt and is published with CC-BY-4.0 attribution.
