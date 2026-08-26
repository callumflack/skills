---
name: roughdraft
description: "Install Roughdraft with `npm i -g roughdraft` if it is missing, then open Markdown in the local app for review. Use when the user says Roughdraft, rd, asks to install Roughdraft, asks for a plan to review, or wants comments on a Markdown file. Invoking this skill authorizes the global install. Do not copy Roughdraft setup into AGENTS.md."
---

# Roughdraft

Roughdraft is a local Markdown viewer/editor. This skill installs the CLI and runs the review loop. Chat comments, hand-written review without the app, and the browser demo are not Roughdraft.

`rd` in user requests means Roughdraft. Do not create or modify any shell alias, executable, symlink, or command named `rd`.

Do not paste Roughdraft into `AGENTS.md`, `CLAUDE.md`, Cursor rules, or any other persistent instruction file. Do not run `roughdraft help agent` or `roughdraft agent-setup`, and do not fetch `https://roughdraft.md/setup.md` or `https://roughdraft.md/prompt.md` in order to write those files. Keep using this skill instead.

## Install

Check:

```bash
roughdraft help
```

If it is missing, install it. Invoking this skill is the install ask. Do not ask again.

```bash
npm i -g roughdraft
roughdraft help
```

The npm exit code does not prove the app works. `roughdraft help` is the oracle. If it still fails, diagnose the active Node installation, npm prefix, or version-manager selection, then stop. Do not invent another install path. Do not continue without the binary.

After a fresh install with no target file, prove the loop once:

```bash
example_file="$HOME/roughdraft-example.md"
curl -fsSL https://roughdraft.md/example.md -o "$example_file"
roughdraft open "$example_file" --json
```

If `curl` is unavailable, write a short Markdown file with a heading, a couple of sentences, and an invitation to leave a comment, then open that path instead.

## Open a file

When the user asks for a plan, write the plan to a Markdown file on disk before asking them to review it.

When you write or modify a Markdown file and want the user to review or comment on it, open one absolute path. Roughdraft is a single-file editor. Open one `.md` at a time. `roughdraft open` starts the local server if it is not running.

For the agent review loop, keep the command attached and wait:

```bash
roughdraft open "/absolute/path/to/file.md" --json
```

Do not interrupt, kill, background, detach, or treat the waiting process as cleanup. The wait is the product: Roughdraft exits after the user clicks **Done Reviewing**. That exit is the signal to resume. `--json` prints `review.completed` with the document path, file version, feedback counts, and any `overallComment`.

Tell the user they can leave comments, suggested edits, or questions in the document, then click **Done Reviewing**.

Use `--no-watch` only when you need to open the file and return immediately. Pass `--timeout <seconds>` only when a bounded wait is required. `--print-url` prints the localhost URL without launching a browser.

Server control when needed:

```bash
roughdraft start
roughdraft status --json
roughdraft stop
roughdraft doctor "/absolute/path/to/file.md"
```

`http://localhost:7373/?path=/absolute/path/to/file.md` also opens a file if the server is already running.

## After review

Reread the Markdown file from disk. Respond to CriticMarkup comments and suggested changes. Reply inline in the file, save it, and open it in Roughdraft again so the user can continue.

Treat suggested insertions, deletions, and substitutions as review feedback unless the user asks you to accept them. Overall comments at handoff are written to YAML endmatter; Markdown remains the source of truth.

For local syntax refresh after install, run `roughdraft help criticmarkup`. For the full spec, read https://roughdraft.md/spec/roughdraft-flavored-markdown.md.

## CriticMarkup

Review state lives in the Markdown file. Markers inside inline code and fenced code blocks are literal examples, not live feedback.

Base markers:

- Comment: `{>>comment<<}`
- Insertion: `{++new text++}`
- Deletion: `{--old text--}`
- Substitution: `{~~old~>new~~}`
- Highlight: `{==text==}`

New comments and suggestions use a compact inline id (`{#c1}`, `{#s1}`) plus YAML endmatter. Generate a stable document-local id (`c1`, `c2` for comments; `s1`, `s2` for suggestions). Set `by` to your agent or author label, `at` to the current ISO timestamp, and `re` when replying. Preserve existing inline attribute blocks unless you are removing that comment or suggestion.

Anchored comments: `{==selected text==}{>>Comment text<<}{#c1}`. Suggestions: `{++new text++}{#s1}` or `{~~old text~>new text~~}{#s2}`. Replies live in endmatter with a `body` and `re` pointer.

<!-- prettier-ignore-start -->

```md
{==selected text==}{>>Comment text<<}{#c1}
{++new text++}{#s1}

---
comments:
  c1:
    by: AI
    at: "2026-04-28T12:00:00.000Z"
  c2:
    body: I can make that edit.
    by: AI
    at: "2026-04-28T12:05:00.000Z"
    re: c1
suggestions:
  s1:
    by: AI
    at: "2026-04-28T12:10:00.000Z"
```

<!-- prettier-ignore-end -->
