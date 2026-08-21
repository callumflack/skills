# Generic Row Grammar Receipt

The complete System/default example lives in `examples/system-default`. It demonstrates a visual reference, structured component vocabulary with semantic props and owned slots, a checked composition tree, a declared specimen, and honest evidence metadata without route scanning or Flow fields. Declared status records a greenfield contract; it does not claim rendered proof.

```text
Grammar: Row
Owner: src/components/ui/row.tsx

Row
  ProviderMark                  <- media.iconName
  RowPrimary
    Title                       <- title
    Description?                <- description
  Trailing?                     <- metadata | action
```

## Inputs

| Input | Meaning | Visual consequence |
| --- | --- | --- |
| `media.iconName` | Provider identity | Resolves controlled provider media through the product asset owner. |
| `title` | Primary identity | Renders the primary line. |
| `description?` | Supporting information | Adds the supporting role; Row owns the resulting presentation. |
| `metadata?` | Trailing display information | Renders the non-interactive trailing role. |
| `action?` | Trailing semantic action | Renders the action as a sibling of the primary region. |
| `tone?` | Default or attention meaning | Determines attention presentation. |
| `primaryAction?` | Primary-region interaction | Makes only provider media and content interactive. |

## Invariants

- Same semantic roles and interaction targets.
- The consumer cannot choose rendering mechanisms; the Row owns its presentation.
- Primary-region and trailing actions remain sibling interaction targets.
- `metadata` and `action` are mutually exclusive.

The only cause of the supporting-information role is `description` presence. Do not add a parallel compact component or public size variant. Feature adapters map their own product states into this grammar; those states do not belong in the generic row component.

The grammar stops at cause and ownership:

```text
Good: description presence requires the supporting-information role; Row owns its presentation.
Bad: description presence applies a dense class and the small spacing token.

Good: attention meaning selects the attention presentation; Row owns that rendering.
Bad: attention meaning selects a color utility and border token.

Good: consumers provide a semantic action; Row owns the trailing action composition.
Review: a consumer passes className; establish whether the consumer owns placement, the component lacks a semantic slot, or the override is unexplained.
```

If repository doctrine governs styling or file placement, reference it without copying it into semantic rules:

```json
{
  "implementationConstraints": [
    {
      "id": "system-presentation-policy",
      "owner": "design-system",
      "reference": "docs/design-system.md"
    }
  ]
}
```

`system-presentation-policy` may guide implementation review. It cannot appear in an action matrix `ruleIds` list.

# Route Bootstrap Fixture

The skill includes a synthetic React fixture. Supply a package in the adopting repository that already provides TypeScript:

```sh
node .agents/skills/ui-grammar/scripts/ui-grammar.mjs bootstrap \
  .agents/skills/ui-grammar/examples/bootstrap/src/route.tsx \
  --package-json <owning-react-package/package.json>
```

The traversal reaches `SyntheticRoute -> LocalPanel` and reports the imported design-system `Button` as an external boundary. This is the intended result: bootstrap provides deterministic orientation and names what it cannot follow; it does not infer semantic rules or pretend to understand the surface.

# Complete Existing-Route Example

[`examples/existing-route`](examples/existing-route) contains a product-neutral route, presentation component, version 2 grammar, and two requests. Its executable grammar uses `compositionOwner`, root-scoped relations, review-level and forbidden prop checks, additive global and per-document actions, and explicit `dependsOn` facts. The portability test bootstraps the route and compiles both requests directly.

[`examples/legacy-v1`](examples/legacy-v1) preserves the original committed version 1 grammar shape, including `designSystem` and no composition owner. The portability test proves that it normalizes with migration warnings and still compiles with first-match behavior.
