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
