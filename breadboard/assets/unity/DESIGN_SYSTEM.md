# Breadboard Design System

Status: current shared contract. Owner: the repository's interactive breadboard viewer. Applies to every registered breadboard, including all views of an artifact, and to every new breadboard. Feature-specific READMEs own content and evidence maintenance; they do not own interaction or presentation rules.

## One implementation

`docs/system/breadboards/viewer.template.html` owns the viewer. `interactions.mjs` owns shared presentation constants and camera geometry. `boards.json` registers every artifact and its content source. Feature bundles supply `breadboard.json`: framing, places, affordances, states, stories, requirements, gaps and source links. They cannot supply scripts, styles, coordinates, spacing overrides or preferred camera subsets.

The HTML files and adjacent `breadboard-contract.md` copies are generated standalone artifacts. They remain usable locally, offline and on their existing published Sites. Do not edit generated files. There is one current contract; Git records its history, without separate named versions or feature forks.

## What a breadboard communicates

- A feature breadboard is the maintained map of how the feature works throughout development: what the person does, what happens next, where it happens, and which implementation or verification boundary remains open. Use enduring roles and source-independent actions in its main map. Providers, demonstration apps, record counts and experiment results are supporting evidence, not the feature's structure. A concrete example may have a clearly labelled walkthrough; it must not silently replace the feature map or imply that separate partial examples prove the whole journey.
- Start with a bounded user goal, its starting conditions and observable outcome. A story follows that goal through the actual places and affordances, rather than listing implementation tasks.
- Places identify the surface/runtime. UI affordances name actions a person can take; code affordances name behavior behind them. State/data blocks name the result retained or passed onward. Wires show actual triggers, navigation or data flow.
- UI affordances are blue, code affordances purple and state/data green. Solid wires show triggers/navigation; dashed wires show data/results. Secondary runtime/recovery branches may use context styling. Color is accompanied by labels and line patterns.
- Keep stable block, wire, story and requirement IDs. Every wire names existing endpoints. A declared requirement flow must have a directed connection between consecutive steps. Group blocks by their actual place/runtime.
- Keep current proof, historical attempts, unresolved failures and later work distinct. State the date and limits of evidence. Source-inspected code, fixtures, local runtime proof, native proof, merge and deployment are different claims. A gap is an orientation aid, not permission to fix a product or expand scope.
- Compare a narrower milestone with its full source requirements in a compact coverage table when both appear. Keep operational incidents and test workarounds in collapsed evidence; they are not user journey steps. Frame tables use the shared viewer's readable, aligned cell styles.

## Journey content: every existing and future board

The active canvas and main requirement rows describe what the person does, what the runtime does and the data/result that follows. This applies to every view in every registered board. Clearly label target journeys and retain their implementation limits in the frame's coverage summary; drawing a future action does not claim it is built.

- Keep test history, verification receipts, completed proof status, PR/commit/review links, project administration and remaining-scope notes in collapsed Sources/proof or product-decision sections. Do not put them on the canvas, append them to a requirement's flow, or disguise them as renamed state/result cards.
- Block inspection starts with behavior, authority and recovery. Requirement descriptions, walkthrough actions and recovery text do the same. Keep manual setup and real safeguards visible. Preserve the displaced evidence at its existing secondary owner rather than deleting it or repeating it on every card.
- Every canvas card must represent a UI action, runtime operation or actual state/data, belong to a requirement and participate in real runtime wiring. Linked requirement cards must form a connected runtime graph, including genuine branches; declared sequential flows must have directed wires. Proof/gap cards, proof-only note wires and inline requirement issue/question links are rejected by the shared validator. Source links on inspection and collapsed open decisions remain available.
- Context styling is for a real secondary runtime/recovery dependency, such as signing in and returning to the same request. It must not turn an evidence annotation into an apparent workflow step.
- Lane labels identify the role, such as **Provider**, **Vana app** or **App**. Name a specific example only in an explicitly labelled example walkthrough. Capitalize **App** consistently in lane labels. Keep collection, private native connector delivery, approval and consuming-app delivery distinct.

These rules live here and in `scripts/breadboards.mjs`, not in a feature README or feature-only checker. Generation and CI validate every existing artifact and every newly registered board against the same boundary. Content semantics still require reading the whole affected journey and rendering it; a renamed or falsely wired administration card is not made legitimate by passing a structural check.

## Selection and dimming

- Clicking a story highlights every card and wire belonging to that story. Clicking a requirement highlights its linked cards and their connecting wires. Active cards and wires remain at full opacity.
- Nonactive cards remain visible at **55% opacity**. Nonactive ordinary wires remain visible at **20% opacity**; nonactive context wires remain visible at **50% opacity**. Do not hide inactive wires or make inactive cards fully opaque. This preserves the original breadboard's visual hierarchy.
- **All wiring** clears dimming and shows the complete graph. **Fit all** only changes the camera; it must not change the selected story or requirement.
- Block inspection presents behavior, sources, connections and related requirements/gaps in the owning sidebar card, while preserving its selection and reading position. Closing inspection returns to the complete selected flow.

## Camera and layout

- A story or requirement click automatically fits **all** selected cards, connecting wires and relevant lane headings below the toolbar, with padding on every side. No selected element may be clipped. There is no forced minimum reading zoom and no per-story preferred subset.
- **Fit selection** restores that complete selected view. Explicit zoom and pan allow detail inspection. **100%** resets the camera; **Fit all** shows the complete board. Keyboard pan/zoom, pointer drag and pinch remain available.
- Cards size to their content. Lane headings stay inside their own padded header. The shared layout uses 16px between cards, 48px between numbered lane rows and 128px between columns. Wire routes stay in gutters and must not cross unrelated cards or headings. Keep wire descriptions in block connection details, rather than overlaying labels across cards or lane headings.
- A trailing lane may anchor to its preceding lane in the same column; a taller neighbouring lane must not create a large blank gap above it. Column count and block/lane membership are content decisions; spacing and routing are viewer decisions.
- Keep text readable at inspection zoom. Do not reduce type size or remove dimming to make a complete flow fit. Keep native buttons, visible keyboard focus, labelled regions, selection state and reduced-motion support.

## Changes apply everywhere

1. Change this contract and the shared implementation together when behavior or presentation changes, including subtle changes. Do not patch one generated breadboard.
2. Run `node scripts/breadboards.mjs --write`. It regenerates every registered artifact from the same viewer and constants.
3. Run `node scripts/breadboards.mjs --check` and the shared contract tests. CI rejects edited/stale generated output, unregistered interactive breadboard HTML, invalid definitions, broken declared flows and shared viewer or validator changes without a contract update in the same change.
4. Render every affected view. Check a story, a requirement, block inspection, All wiring, dimming and complete selection fitting; inspect representative narrow and wide viewports. A passing source check alone does not prove visible behavior.
5. Publish affected artifacts to their existing Sites when publication is authorized. Preserve their identities, audiences, content evidence and any explicit release holds. A shared viewer change affects all registered boards; finish its propagation rather than leaving published copies on different behavior.

For a new board, add its content JSON and an entry in `boards.json`, then generate it. Do not copy HTML, CSS or interaction JavaScript. The registry and CI make use of the shared viewer enforceable; this contract is required reading for creation, editing, review and verification.
