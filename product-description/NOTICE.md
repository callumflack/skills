# Source and placement

Steve Ruiz's `product-description` skill is copied verbatim from [the gist revision linked in the KB note](https://gist.github.com/steveruizok/83ae5c53f2784ebf8f5fe0a3fb94480f/f9435a3c7b022ecadc8441542675a9163cdb6b7f), revision `f9435a3c7b022ecadc8441542675a9163cdb6b7f`, retrieved on 2 November 2026.

The nine source files below are unmodified, including frontmatter, wording, whitespace and line endings. Their placement follows the upstream `install.sh`: `SKILL.md` at the skill root and the eight support files under `references/`. The upstream README and installer are not installed. This notice is repository metadata, separate from the source. The repository formatter excludes the original Markdown files to preserve their exact bytes.

## Ownership and distribution

The canonical copy lives in `callumflack/skills/product-description/`. The existing `scripts/link-skills.sh` links it through `~/.agents/skills/product-description` into Claude Code, Codex, Cursor and Pi. It has no entry in the external `.skill-lock.json`.

Git in the Skills repository owns this imported copy. Updates are deliberate replacements from a selected upstream revision; retain exact source files and update this notice's revision and checksums. Do not edit the source files as a local adaptation or run the upstream installer over the runtime links.

Across computers, use the existing Agents setup: after authorized publication of the Skills change, advance the Skills commit pinned in Agents' `mise.toml`, publish that pin, then update Agents and run `mise run setup` on a clean replica. Until publication and pin advancement occur, this addition is installed only on the authoring Mac. No separate installer or lock is needed.

The retrieved gist has no license file or license declaration. Callum authorized publication of this verbatim import in the Skills repository on 2 November 2026. The repository's default MIT license does not cover the imported files; this notice grants no additional upstream rights.

## Original file checksums

SHA-256 of the downloaded source bytes:

| Installed file | SHA-256 |
| --- | --- |
| `SKILL.md` | `1771a81a429d888f2de971e168026667a4f2ab7573efb70ea3e854c7b3ffd7b2` |
| `references/product-kinds.md` | `710ed644295352a69121d8d5b5aab3538f677aca94a911f9932452774c85a079` |
| `references/README-template.md` | `97929b08347ca18d62bc786f450626def0e5512f97fddd06a9a8b6faf0673167` |
| `references/goal-template.md` | `dd47600dc4629b2d7964a1137e9fad2cf9096ad4e741f4894c566cf105406a67` |
| `references/glossary-guide.md` | `1ee3581be11a5254b0736f8ea09c795aaa78922d5051707a506abfb19794d9da` |
| `references/document-template.md` | `d099e7e15f1287e758cd8e732d1959eaf266ed214fb7ad3ee80098e5ca8a5d88` |
| `references/verification-template.md` | `39447bb851fb8cecb3a023f6db1e9e5e2d36ff1a7086bc7cbee2e1b2befa09d6` |
| `references/bug-triage-template.md` | `d1a91b699e2b81ef0568cc57a23da078b3a57b3d75e88bc686d573e2653bf9e4` |
| `references/check-links.py` | `2cff940703ccc50a2ac19de68d07fd77be9cf463be7c5421eed7905f0f76a68b` |
