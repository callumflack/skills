---
name: markdown-paragraphs
description: Writes and repairs Markdown for Notion and human reading without manually wrapped prose. Use when authoring or exporting Markdown paragraphs, lists, skills or playbooks.
---

# Markdown paragraphs

Write each prose paragraph and each list item on one source line. Separate paragraphs with blank lines. Let the reading app wrap text to its width; never insert source newlines to fit an editor column.

Preserve intentional line structure in code, tables, YAML, poetry, addresses and explicitly line-sensitive quotations. Do not flatten nested lists or separate blocks. For intentional prose line breaks, use an explicit hard break and retain its purpose.

When repairing existing text, join only continuation lines within the same paragraph or list item. Never join a blank-line-delimited chunk wholesale: it can contain several list items, headings or other blocks. Parse block boundaries before transforming prose. Preserve wording, emphasis, links, ownership and edits made in the destination. Fetch a Notion page before changing it; do not regenerate over human edits.

Use the owner's formatter with `proseWrap: "never"` where available. Before delivery or export, run `python3 scripts/check-paragraphs.py <file> ...` from this skill directory. The checker rejects source wrapping in ordinary prose and list continuations; it does not validate every Markdown dialect. Inspect intentional exceptions instead of broadly disabling it.

For Notion, fetch the saved page and compare every heading, list item and table with the source, including their counts and order. Run the checker with `--reference <source.md> <exported-body.md>` to reject swallowed headings or merged list items. Inspect the actual Notion app: verify distinct bullet blocks, heading levels and paragraph layout. A locally formatted file does not prove the imported page is readable. Report file validation and app verification separately.
