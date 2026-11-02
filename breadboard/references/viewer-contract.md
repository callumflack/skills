# Portable breadboard viewer

This contract describes the bundled Unity Surfaces #1957 viewer. The template extends the upstream viewer with story reading paths. The interaction module retains its original bytes. See `provenance.json`. Feature content supplies JSON, not CSS, scripts, geometry or a replacement renderer. Update the bundled implementation deliberately when adopting another upstream revision.

## Runtime graph

Places identify the interaction or runtime boundary. Blue UI blocks name available actions or information. Purple code blocks name runtime behavior. Green state or data blocks name retained or passed results. Solid wires show triggers and navigation. Dashed wires show data or results. Context styling identifies a real secondary runtime or recovery relationship.

Every block belongs to one lane, participates in runtime wiring and supports a requirement. Requirement blocks form a connected graph. A declared sequential flow has directed wires between consecutive blocks. Stories select actual wire IDs. Keep stable semantic IDs.

Keep test history, proof receipts, issue administration and release details in the frame or collapsed Sources. They are supporting material rather than runtime steps. A source link or passing validator does not establish that its text describes the implementation correctly.

## Selection and inspection

Selecting a story shows its reading path beneath the selected story, and a verification section with named checks and their coverage, a specific gap, or both. Activate the selected story heading again to collapse its details while retaining its highlighted wiring; activate it once more to reopen them. The same toggle works with Enter and Space, and the button reports whether its details are expanded. Select a numbered step to isolate its wires and see the sender, receiver and handoff label. Select it again to restore the whole story. All wiring is an overview. Every other story must supply steps to regenerate the board. Link to a story using `?story=S2`, or `?flow=recovery&story=RS1` in a secondary view. Selecting a story highlights all its blocks and wires. Selecting a requirement highlights its linked blocks and connecting wires. Inactive blocks remain at 55% opacity. Inactive ordinary wires remain at 20% opacity, and inactive context wires remain at 50% opacity.

All wiring clears dimming. Fit all changes the camera without changing the selection. Block inspection shows behavior, references, connections and related requirements in the sidebar. Closing inspection restores the full selected flow and preserves reading position.

## Camera and layout

Selecting a story or requirement fits every selected block, connecting wire and relevant lane heading below the toolbar. Fit selection restores that view. Explicit zoom and pan reveal detail. Fit all shows the complete board. Keyboard controls, pointer dragging and pinch remain available.

Cards size to their content. The viewer owns spacing, lane geometry and wire routing. Content chooses lane membership, rows, columns and column count. Do not shrink type or remove dimming to fit a large story. Inspect the rendered result because source validation cannot establish legibility or truthful meaning.

## Local portability

The portable entry point retains upstream definition and renderer validation. Its explicit adaptation permits safe local source links as well as HTTPS references. Local paths resolve inside the selected repository root. The checker compares recorded source hashes and generated output without fetching or running the product.

Generate this HTML with the skill's `render` command and check it with `check`. Edit the JSON, not the generated HTML. The generator copies this contract beside the output as `breadboard-contract.md`. The original Unity repository's registry and CI commands remain at that repository and are not required here.
