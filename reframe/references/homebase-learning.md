# Homebase learning connection

Homebase already provides a `Learning/` entrance into the KB-owned case corpus. Agents owns the capture and retrieval code. Use those owners directly. This skill adds a way to use and develop experience; it introduces no second corpus, schema, capture command or classifier.

## Read fitting experience

Resolve Homebase through `CALLUM_HOMEBASE` when configured, or `~/Repos/callumflack/homebase` on Callum's Mac. Open its `Learning/README.md` and `Learning/AGENTS.md` before retrieving or capturing cases. Their current instructions and the Agents procedure own the details below.

The existing helper can retrieve a small shortlist:

```sh
reframe_homebase="${CALLUM_HOMEBASE:-$HOME/Repos/callumflack/homebase}"
python3 "$reframe_homebase/Tooling/agents/experiments/learning-corpus/learning_corpus.py" search --query "<terms from the current situation>" --limit 3
```

Choose terms from the problem and its mechanism. Open the fitting entry in `Learning/cases.md` and inspect the selected record's evidence, scope and exceptions. A matching keyword or old assistant report does not settle the current decision. The current project remains the authority for its own behavior.

The readable/editable, recorded-access, and capture-completion cases are useful starting examples when designing how knowledge reaches people and agents. They do not imply that every task needs a new human interface. Use the actual corpus rather than copying those cases into this package.

When nothing fits, work from the supplied material and name the absence briefly. On another machine without this Homebase, use whatever working history the user supplies and report that the shared cases were not checked.

## Preserve what happened

When capture is within the session's write authority and a consequential learning emerged, load the installed `capture-learning` skill. Its authored Homebase route is `Tooling/skills/capture-learning/SKILL.md`. Follow that procedure through source inspection, exact evidence preservation, validated append, readable-page reconciliation, audit and the KB receipt. The capture skill owns the commands; do not reproduce a partial importer here.

The existing record shape can carry a reframing case:

| Existing field | What to retain |
| --- | --- |
| `story.goal` and `story.situation` | The desired outcome and starting approach. |
| `story.cues` | The selected question ID and wording, plus the detail that made it useful. |
| `story.needed_next_step` | What the question suggested doing or exploring differently. |
| `evidence` | The actual exchange and any subsequent attempt or response. |
| `learning` | The candidate distinction, its scope and exceptions; use the existing decision, success, correction or open-question signal as appropriate. |
| `outcome` | What occurred and its evidence basis. An untried idea remains unresolved. |

Source evidence establishes what was said or reported. Later work can establish whether the new approach helped. Keep that distinction visible. When amending an existing interpretation, append a revision through the existing workflow and preserve human annotations.

A read-only session can return a proposed learning in chat without recording it. A session with no consequential learning leaves the corpus unchanged. Missing capture tooling is a stated gap, not a reason to create another archive.

## Develop the collection

During an authorized collection update, use real cases to sharpen when a question fits and where it misleads. Source-derived questions can remain useful candidates before field use. Keep IDs stable; merge equivalent variants and retain the case or source that explains the distinction. Operational changes belong in their existing project, skill or Playbooks owner.

The current learning workflow uses explicit capture and local retrieval. This connection does not activate automatic hooks, background extraction, model training or classifier calls.
