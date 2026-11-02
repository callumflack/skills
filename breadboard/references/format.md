# Breadboard definition

The editable JSON uses the #1957 viewer's `metadata` and `views`. The portable generator reads source metadata from each block's existing `sources` records. There is no parallel source map or second diagram language.

## Metadata and views

`metadata` contains `title`, `headingHtml`, `eyebrow`, `defaultView`, `views`, `requirementsIntro`, `questionsLabel`, `questionsIntro` and `sourcesHtml`. Each entry in `metadata.views` has a `label`, unique `query`, `title`, `headingHtml`, `frameHtml` and `initial` selection. The default view uses an empty query. Other views open at `?flow=<query>`.

`initial` is `{ "kind": "story", "id": "S1" }` or a requirement selection. `headingHtml`, `frameHtml` and `sourcesHtml` accept document markup but cannot contain scripts, styles or event handlers. Keep problem, outcome, scope, represented source state and consequential limits in the frame. Use collapsed `<details>` sections in Sources for evidence and decisions.

Each matching entry in top-level `views` contains these collections:

| Field | Content |
| --- | --- |
| `groups` | Lanes with unique `id`, nonnegative `row` and `col`, `title`, `runtime`, and member `nodes`. Each block belongs to exactly one lane. Optional `after` anchors a lane after an earlier lane in the same column. |
| `nodes` | Blocks with unique `id`, `kind`, `place`, `title`, `sub`, `detail`, and `sources`. Kinds are `ui`, `code` and `store`. Detail explains behavior, authority and recovery. |
| `edges` | Wires with unique `id`, `a` and `b` block IDs. Optional `label` describes the relationship in connection details. `data: true` draws a result or data wire. `context: true` marks a secondary runtime dependency. |
| `stories` | Entries with unique `id`, `name`, `description` and selected edge IDs in `edges`. Include `all`, named `All wiring`, with every wire. |
| `requirements` | Entries with `id`, `title`, `status`, `detail` and linked `blocks`. Optional `flow` declares a directed sequence. Optional `contextBlocks` includes real supporting runtime dependencies. |
| `questions` | Open decisions or gaps with `id`, `title`, `status`, `detail` and related `blocks`. These are supporting selections, not canvas blocks. Use an empty array when none are needed. |
| `layout` | `{ "columns": 2 }`, or another positive column count. Geometry and spacing are viewer-owned. |

Each story except All wiring requires `steps`, an ordered list of `{ "text": "A person or system does something", "edges": ["E1"] }` covering its selected wires. When a story selects more than one wire, give at least two steps. Describe alternatives explicitly. Each story also requires `checks` or a specific `gap`, or both for partial coverage. A check is `{ "url": "../source/submit.test.mjs", "test": "saves a submitted request", "covers": "Confirms the value survives reload." }`. Use the exact URL of a declared verification source and the exact test name or case ID. For local sources the generator verifies that the named text exists. This does not run the check or establish its relevance. Already generated boards remain readable; migrate older definitions before regenerating them.

A requirement can contain `walkthrough`, an array of steps with `title`, `blocks`, `owner`, `action` and `recovery`. Its linked blocks must form a connected runtime graph. Consecutive `flow` steps need directed wires. Walkthrough blocks belong to that requirement's graph. Issue administration and proof receipts belong in Sources rather than requirement flows.

## Source references

Every block has at least one real source reference. The viewer displays `label` and opens `url`. The portable checker also reads these optional fields:

| Field | Meaning |
| --- | --- |
| `role` | `code`, `intent`, `verification`, `model` or `evidence`. The role describes what the source can establish. An omitted role is treated as code. |
| `path` | File path relative to `--root`. It cannot name a file outside that root, including through a symlink. |
| `sha256` | SHA-256 of the bytes inspected. Only the explicit `record-sources` command records or changes it. |
| `revision` | Actual reviewed revision when known. It is context, not an automatically verified deployment or Git-history claim. |
| `symbol` | Function, type, section or line reference useful when opening the owning source. |

Use an authored HTTPS URL or a relative local URL. Relative URLs resolve from the generated HTML location and must remain within `--root`. Absolute paths, `file:`, protocol-relative URLs and executable URL schemes are rejected. A local source link must open the referenced local file. A remote link needs its actual known URL; the tool never constructs or fetches it.

For example, a board under `maps/preferences/` can reference `../../src/preferences.ts`, while its `path` is `src/preferences.ts`. The `path` and `url` have different bases. Include the role, reviewed symbol and revision where useful. For a source snapshot under a working folder, include the snapshot directory in `path`.

Local references with absent hashes or unavailable files remain unknown. A code reference with only a remote URL remains unknown to the byte checker. A remote intent or verification link does not establish implementation freshness. The checker reports the affected view, block and requirement IDs. Its coverage remains limited to declared references, including the full recorded file rather than only the named symbol.

Do not record the generated HTML or the board's own JSON as implementation evidence. That creates a circular baseline. Keep navigation to another map in framing, distinct from the code or decision supporting a block.

## Small example

This example illustrates the complete shape. Its source path is illustrative. Replace it with an inspected source before recording a baseline.

```json
{
  "metadata": {
    "title": "Save a preference",
    "headingHtml": "Save a preference",
    "eyebrow": "Existing workflow · source inspected",
    "defaultView": "current",
    "views": {
      "current": {
        "label": "Workflow",
        "query": "",
        "title": "Save a preference",
        "headingHtml": "Save a preference",
        "frameHtml": "<h2>Goal</h2><p>Retain the selected preference. This example needs real source review.</p>",
        "initial": { "kind": "story", "id": "S1" }
      }
    },
    "requirementsIntro": "Select an obligation to inspect its working parts.",
    "questionsLabel": "Open decisions",
    "questionsIntro": "",
    "sourcesHtml": "<details><summary>Evidence</summary><p>Source inspection is not runtime proof.</p></details>"
  },
  "views": {
    "current": {
      "groups": [
        {
          "id": "preferences",
          "row": 0,
          "col": 0,
          "title": "Preferences",
          "runtime": "Browser",
          "nodes": ["U1", "N1", "D1"]
        }
      ],
      "nodes": [
        {
          "id": "U1",
          "kind": "ui",
          "place": "Preferences",
          "title": "Save selection",
          "sub": "Person action",
          "detail": "Submit the selected value.",
          "sources": [
            {
              "label": "Save handler",
              "url": "../../src/preferences.ts",
              "path": "src/preferences.ts",
              "role": "code",
              "symbol": "savePreference"
            }
          ]
        },
        {
          "id": "N1",
          "kind": "code",
          "place": "Preferences",
          "title": "Write preference",
          "sub": "Runtime operation",
          "detail": "Validate and retain the selected value.",
          "sources": [
            {
              "label": "Preference writer",
              "url": "../../src/preferences.ts",
              "path": "src/preferences.ts",
              "role": "code",
              "symbol": "savePreference"
            }
          ]
        },
        {
          "id": "D1",
          "kind": "store",
          "place": "Preferences",
          "title": "Retained preference",
          "sub": "Result",
          "detail": "The saved value is available to the next read.",
          "sources": [
            {
              "label": "Preference storage",
              "url": "../../src/preferences.ts",
              "path": "src/preferences.ts",
              "role": "code",
              "symbol": "preference"
            }
          ]
        }
      ],
      "edges": [
        {
          "id": "e-save",
          "a": "U1",
          "b": "N1",
          "label": "Submit the selected value"
        },
        {
          "id": "e-written",
          "a": "N1",
          "b": "D1",
          "label": "Retain the accepted value",
          "data": true
        }
      ],
      "stories": [
        {
          "id": "all",
          "name": "All wiring",
          "description": "",
          "edges": ["e-save", "e-written"]
        },
        {
          "id": "S1",
          "name": "Save the selected preference",
          "description": "The person submits a value and it becomes available to future reads.",
          "steps": [
            { "text": "Submit the preference.", "edges": ["e-save"] },
            {
              "text": "The app retains the chosen value.",
              "edges": ["e-written"]
            }
          ],
          "gap": "No test checks whether the selected value survives a restart.",
          "edges": ["e-save", "e-written"]
        }
      ],
      "requirements": [
        {
          "id": "R1",
          "title": "Retain the accepted preference",
          "status": "Source inspection required",
          "detail": "The saved selection is the value used by future reads.",
          "blocks": ["U1", "N1", "D1"],
          "flow": ["U1", "N1", "D1"],
          "walkthrough": [
            {
              "title": "Save selection",
              "blocks": ["U1", "N1", "D1"],
              "owner": "Preferences",
              "action": "Validate and retain the selected value.",
              "recovery": "Establish failure behavior from the actual source."
            }
          ]
        }
      ],
      "questions": [],
      "layout": { "columns": 1 }
    }
  }
}
```

## Related maps and maintenance

For an overview and mechanism view, keep both in `metadata.views` and `views`. Name the parent block in the detailed frame. State the shared entry, inputs and possible outcomes. Use real navigation such as `<a href="index.html?flow=mechanism">Expand the save mechanism</a>`. Use the actual output filename and view query. The viewer supplies a return route through its view navigation.

For maps in separate bundles, use a relative frame link and state the same boundary contract at both ends. These links are navigation, not runtime wires. The generator does not prove semantic equivalence between resolutions. Inspect the relationship and both rendered views.

`check` never records new source hashes or changes output. After reviewing a source change, update its affected story paths, requirements, blocks, wires, walkthrough and framing. Record only the reviewed path with `record-sources DEFINITION --root ROOT --source PATH`, regenerate and recheck. Keep stable IDs for retained behavior. Preserve intended behavior separately when implementation still falls short.
