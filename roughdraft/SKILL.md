---
name: roughdraft
description: Use Roughdraft for Markdown plans, review, and comments. Trigger when the user asks for a plan, wants to review or comment on a Markdown file, or says Roughdraft or rd.
---

# Roughdraft

Roughdraft is a local app and CLI. Do not paste its setup text into `AGENTS.md`, create an `rd` alias, or replace the app with this skill.

## Ensure the app works

Run `roughdraft --version` before opening a file.

If Roughdraft is missing, first prove that `node --version` and `npm --version` work, then install it:

```bash
npm i -g roughdraft
roughdraft --version
```

The npm exit code does not prove the app works. `roughdraft --version` is the installation oracle. If it fails, diagnose the active Node installation, npm prefix, or version-manager selection before retrying. Do not invent another installation path. Do not run Roughdraft's agent-setup prompt after installation.

## Review a Markdown file

When the user asks for a plan, write the plan to a Markdown file before opening it for review.

Open one absolute file path and keep the command attached:

```bash
roughdraft open "/absolute/path/to/file.md" --json
```

Do not interrupt, kill, background, or detach the command. Wait for the `review.completed` event. Then reread the file, respond to its comments and suggestions, and make the requested changes. Reopen the file when the user needs another review pass.

Use `roughdraft help agent` for current command behavior and `roughdraft help criticmarkup` before writing or replying to CriticMarkup. The installed CLI owns those details.
