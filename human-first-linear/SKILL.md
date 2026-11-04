---
name: human-first-linear
description: Explains, drafts, and edits Linear issues, projects, and project status updates in human-first form. Use for issue wording, project descriptions, progress reports, or cleanup that must preserve source claims and use the correct Linear surface.
---

# Human-First Linear

Make Linear explain the work to a human before it instructs a machine. Choose the correct surface before writing.

## Select the Mode

- **Explain:** the user asks what an issue, project, or update means or wants to talk it through. Read the live entity and answer in chat. Make no external write.
- **Draft:** the user asks for proposed wording, or write authorization is ambiguous. Return a complete draft without changing Linear.
- **Live edit:** the user explicitly asks to update, rewrite, clean up, or replace the live issue, project content, or update. Change only the fields they authorized.

Conversation context counts as authorization. When the mode remains unclear, use Draft.

## Route the Change

| Content | Destination |
| --- | --- |
| A task's problem, solution, scope, or completion criteria | Issue description |
| A short explanation of what the project is for | Project summary |
| Project purpose, agreed scope, release boundaries, and canonical resource links | Project description |
| Progress since the last report, results, blockers, delivery state, and next steps | Native project status update |
| Detailed specification or proposal | Existing project document, or a new document when authorized and needed |

Interpret “update the project” from the requested content and context. A progress report goes in a native project update; a change to agreed scope belongs in the description. When both are requested, separate them. Do not use the project summary or description as a dated status feed. For example, “local acceptance passed; release awaits Account migration” is an update, while “Mobile is deferred to the second release” is a scope boundary. An issue's current blocker can still belong in its issue description.

For a project report, read the project and recent native updates, then use the platform's native project-update operation (for example, `save_status_update` with `type: project`). A report-only request does not authorize changing project metadata. Preserve the existing health unless the requested work and evidence support reassessing it. If the native operation is unavailable, return a draft and name the limitation; do not substitute a description, document, or comment or retry an uncertain create blindly.

When moving a misplaced report, preserve its claims and evidence dates. Save and read back the native update before removing the report from the description; keep durable scope and resource links in the description. Create a new report for new progress; edit an earlier update only to correct that update or when explicitly requested.

## Workflow

1. Read the live entity when one exists and, for project work, its recent native updates; otherwise read the supplied notes or source material. Completion: the problem, blocker, and accepted decisions are supported by available evidence; missing evidence is named.
2. Snapshot the fields in scope. For an existing description, classify every section as **keep**, **rewrite**, **move**, or **remove**, and map every original claim to its destination. A claim may disappear only with explicit deletion authorization. Completion: every claim remains represented, moves to a verified owner, or is explicitly authorized for removal.
3. State the problem and solution in one plain sentence each. If no solution is accepted, state the unresolved decision instead of inventing one. Completion: the problem and accepted solution or unresolved decision make sense without internal implementation detail.
4. For an issue description, use only the sections it needs:
   - **Very simply** — what is wrong and what changes.
   - **The problem** — the concrete failure or confusion today.
   - **The solution** — the smallest accepted approach, or the decision still required.
   - **Current status** — only a blocker, dependency, or abandoned path that changes the next action.
   - **Done when** — short, observable outcomes.
   - **Necessary boundaries** — constraints that prevent likely scope drift; keep them last. Completion: every retained section helps explain the problem, solution, next action, completion, or a necessary boundary.
5. Preserve accepted architecture. If the rewrite exposes duplicate ownership or a new management surface, flag it separately; change the decision only after the user agrees. Completion: accepted decisions remain unchanged unless the user authorized the change.
6. Prune copied mechanics only after locating their canonical owner in a repository, PR, plan, or gate. Link that owner. If no owner can be verified, retain the information or ask the user. Completion: every removed operational detail is either user-authorized or recoverable from its verified link.
7. Complete the selected mode:
   - Explain: return the human explanation without an external write.
   - Draft: return the proposed text with its intended destination.
   - Live edit: save only authorized fields, re-read the affected entity, and verify every **keep** section is exact, every **rewrite** preserves its original claims unless change was authorized, every **move** has a verified destination, and every **remove** was explicitly authorized. For project updates, re-read the saved native update and list updates ordered by creation time to verify a newly created report is the latest; return its update URL. Verify project summary and description are unchanged for report-only work, and status, relationships, resources, and attachments are unchanged unless authorized. Completion: the selected mode's output and verification are complete.

## Editing Rules

Operational detail stays only when it changes the decision, constrains scope, or proves completion. Otherwise link its verified owner instead of copying command dumps, file allow-lists, coding sequences, test matrices, release algorithms, handoff inventories, or PR administration into Linear.

An open task does not need to narrate that it is unfinished. Historical detail stays only when it changes the current decision or prevents a known failed path from being repeated.

Every fact has one owner. Prefer reading or deriving owned facts over maintaining a second list, registry, overlay, document, or workflow.

## Writing Standard

Use short sentences and concrete examples. Introduce technical terms only after the human problem is clear.

Never insert manual soft returns or hard-wrap prose in Linear issues, projects, status updates, or documents. Keep each paragraph and list item on one physical line and let the app wrap it. Separate paragraphs with a blank line; preserve structural newlines for headings, tables, list items, and code blocks. Unwrap prose copied from repo Markdown before publishing, then re-read the saved content to check that paragraphs have no internal line breaks.

For example, prefer:

> The Starter accepts scope names typed by hand, so a typo fails later with a confusing error. Install the public catalog and validate the name immediately.

over:

> Create a scope-contract module, add a dependency update workflow, enumerate allowed files, and run the following command matrix.

## Done Gate

In every mode, the first screenful explains the work: an issue leads with its problem and solution or unresolved decision; a project description leads with purpose and scope; a status update leads with the result or blocker and next action. Unique operational information is retained or linked to a verified owner.

For Draft and Live edit of existing content, every original claim is accounted for. For Live edit, only authorized fields changed and the saved destination was verified. A project report is complete only when the native update was read back; editing or reading back the project description does not prove an update was posted. For Explain, no external write occurred.
