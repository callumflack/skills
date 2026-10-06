# Local skill links

Run one command from this repository:

```sh
scripts/link-skills.sh
```

It creates this structure:

```text
this repo/<authored-skill>
          ↓
~/.agents/skills/<skill>       canonical registry
          ↓
          ├─ ~/.claude/skills/<skill>
          ├─ ~/.codex/skills/<skill>
          └─ ~/.cursor/skills/<skill>
```

The script first links this repository's skills into `~/.agents/skills`. It then links every skill in that registry—including external skills—into Claude Code, Codex, and Cursor. If a same-name real file or directory would be replaced, it stops before changing links and preserves that entry.

It finishes by checking that the structure is correct. A successful run ends with one `ok` line. Run `scripts/check-links.sh` directly whenever you only want to check it.

It does not call scripts in the `agents` repository. Edit an authored skill here, then start a new agent task to reload it. Use `npx skills` only for external skills.

The script does not remove stale links after a skill is deleted or renamed. Remove the old link manually.

## Skill publication

For every skill addition, update, rename, or retirement, and when verifying publication:

1. Update the skill and its README description and install command. Add, rename, or remove its entry in `skills.sh.json` as needed. That file controls the categories on [our public skills page](https://www.skills.sh/callumflack/skills), not the terminal installer. Keep every active skill in one group; keep retired skills out.
2. For additions, renames, or retirements, remove only stale links owned by this checkout and run `scripts/link-skills.sh`. For body updates, run `scripts/check-links.sh`; reload a fresh agent task to use the new body.
3. Run `npm run verify`. It checks formatting and agreement between top-level skills, README entries, install commands, and website groups. The pre-commit hook runs the catalogue check against the Git index after `lint-staged`. Unstaged README, configuration, or skill fixes cannot hide a broken staged snapshot. Run `npm run catalogue:check -- --staged` to check that snapshot directly. Inspect the index and stage only the authorized change.
4. Commit or push only when authorized, following live branch rules. A local commit does not update the public website.
5. After pushing to the default branch, run the refresh command:

```sh
npm run publication:refresh
```

The command requires a clean checkout, runs `npm run verify`, and checks that HEAD equals the current remote default-branch commit. It installs every active top-level skill into an isolated temporary Codex project with telemetry enabled, checks installed bodies against that commit, and removes the temporary project and npm cache. It does not write to the global skill registry or commit or push changes. CLI output goes to stderr. The script emits a JSON report on stdout; use `node scripts/refresh-publication.mjs` to omit npm's command banner. The report records the source commit, remote default branch, active skills, refresh status, pending live verification, and public page URL. A guard, refresh, content check, or cleanup failure exits nonzero. Fix the reported failure and rerun the command.

This isolated install is an exception for publication verification. Continue to use the repository linker for authored runtime skills. If changing agent names or options, verify the current CLI help first.

6. After a successful refresh, open the public page and each changed skill's page. Check the visible grouping and content against the pushed source. Report publication separately from Git delivery. If caching delays the update, leave website verification pending with the page URL, pushed commit, observed mismatch, and next check; do not call it verified.

skills.sh is an install-driven catalogue, not a live GitHub directory listing. Its repo page lists skills it has seen, so do not assume retiring a source removes historical entries. `skills.sh.json` controls grouping, not deletion. Report historical listings separately from a failed refresh and use the site's supported removal mechanism if one is available; do not invent one.

Refresh behaviour and caching: [skills.sh customization documentation](https://www.skills.sh/docs/customize#when-changes-appear).
