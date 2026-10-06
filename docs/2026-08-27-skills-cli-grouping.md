# Why the skill installer shows one list

The website and the installer organise skills differently. Categories on skills.sh do not create categories in the terminal installer.

Our installer uses one flat list. That is deliberate: adding headings to it would require plugin configuration we do not otherwise need.

If another repository shows a group called `Other`, it means the installer found skills that were not assigned to a plugin group. It is an automatic label, not a folder we need to create.

Research notes belong in `docs/`. They are not skills and do not need installation commands.

This is a dated finding from 27 August 2026, checked against skills CLI 1.5.23. Sources: [website categories](https://www.skills.sh/docs/customize), [installer grouping code](https://github.com/vercel-labs/skills/blob/435076e78988e1e6ec40d00b0b1d76bdbbc5419a/src/plugin-manifest.ts#L114-L182), and [automatic Other group](https://github.com/vercel-labs/skills/blob/435076e78988e1e6ec40d00b0b1d76bdbbc5419a/src/add.ts#L1328-L1357).
