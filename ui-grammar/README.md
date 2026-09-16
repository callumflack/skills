# Asking for UI Grammar

Use the ordinary skill invocation when you need a source-grounded UI description. Use these prompts when a visual correction should become a reusable design-system relationship instead of a call-site patch.

Worked case: [The gap was not spacing](references/action-owned-feedback-case-study.md) shows how action-owned feedback exposed both the correct Login composition and a missing inline Button size.

## Short ask

> Use `$ui-grammar` in Recover → Design mode to systematise this relationship in the nearest design-system owner. Preserve accepted pixels; no consumer-owned geometry.

## Full ask

> Use `$ui-grammar` in Recover → Design mode. Treat the accepted state as an immutable visual baseline. Compare all relevant states, separate invariants from intentional deltas, and trace every visual relationship to its nearest design-system owner. Do not repair compound-component geometry with consumer `className`, conditional margins, placeholders, or unrelated global tokens. Containers own placement, padding, and gaps; children own internal rendering; features own content and capability. Describe the grammar and ownership first, then implement the smallest reusable component contract and render every changed state.

## Which one to use

Use the short ask when the owning design-system surface is already clear. Use the full ask when state differences, component ownership, or the correct abstraction are still contested.
